"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CreatorAuthState = {
  error: string | null;
  message: string | null;
};

const creatorAuthSchema = z.object({
  intent: z.enum(["sign-in", "sign-up"]),
  fullName: z.string().trim().max(120).optional(),
  email: z.email("Enter a valid email.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Use at least 6 characters."),
});

export async function creatorAuthAction(
  _previousState: CreatorAuthState,
  formData: FormData,
): Promise<CreatorAuthState> {
  const parsed = creatorAuthSchema.safeParse({
    intent: formData.get("intent"),
    fullName: formData.get("fullName") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your account details.",
      message: null,
    };
  }

  if (parsed.data.intent === "sign-up" && !parsed.data.fullName) {
    return { error: "Enter your name.", message: null };
  }

  const supabase = await createServerSupabaseClient();

  if (parsed.data.intent === "sign-in") {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { error: "That email and password don't match.", message: null };
    }

    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();
    const signedUpAsCreator = data.user.app_metadata?.role === "creator";

    if (creatorError || (!creator && !signedUpAsCreator)) {
      await supabase.auth.signOut();
      return {
        error: "This is a brand account. Use the brand sign-in instead.",
        message: null,
      };
    }

    redirect(creator ? "/creator" : "/creator/onboarding");
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: await getCreatorEmailRedirectUrl(),
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  if (!data.user?.identities?.length) {
    return {
      error: null,
      message: "Check your email to confirm your account, then return here to sign in.",
    };
  }

  const admin = createAdminSupabaseClient();
  const { error: roleError } = await admin.auth.admin.updateUserById(data.user.id, {
    app_metadata: { role: "creator" },
  });

  if (roleError) {
    console.error("Creator role assignment failed", roleError);
    return {
      error: "Your account was created, but creator access could not be assigned. Please contact support.",
      message: null,
    };
  }

  if (!data.session) {
    return {
      error: null,
      message: "Check your email to confirm your account, then return here to sign in.",
    };
  }

  redirect("/creator/onboarding");
}

async function getCreatorEmailRedirectUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (!origin) return undefined;

  try {
    const parsedOrigin = new URL(origin);
    if (!["http:", "https:"].includes(parsedOrigin.protocol)) return undefined;
    return new URL("/auth/callback?next=/creator/onboarding", parsedOrigin).toString();
  } catch {
    return undefined;
  }
}

export async function signOutCreator() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/creator/auth");
}
