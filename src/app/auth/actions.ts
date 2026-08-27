"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { ok: true; userId: string | null }
  | { ok: false; error: string };

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  return error
    ? { ok: false, error: error.message }
    : { ok: true, userId: data.user.id };
}

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  return error
    ? { ok: false, error: error.message }
    : { ok: true, userId: data.user?.id ?? null };
}

export async function signOut(): Promise<AuthActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  return error
    ? { ok: false, error: error.message }
    : { ok: true, userId: null };
}

export type BrandAuthState = {
  error: string | null;
  message: string | null;
};

const brandAuthSchema = z.object({
  intent: z.enum(["sign-in", "sign-up"]),
  fullName: z.string().trim().max(120).optional(),
  email: z.email("Enter a valid work email.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Use at least 6 characters."),
});

export async function brandAuthAction(
  _previousState: BrandAuthState,
  formData: FormData,
): Promise<BrandAuthState> {
  const parsed = brandAuthSchema.safeParse({
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

    if (data.user.app_metadata?.role === "creator") {
      await supabase.auth.signOut();
      return {
        error: "This is a creator account. Use the creator sign-in instead.",
        message: null,
      };
    }

    redirect("/");
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  if (!data.session) {
    return {
      error: null,
      message: "Check your email to confirm your account, then sign in.",
    };
  }

  redirect("/brand/setup");
}

export async function signOutBrand() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
