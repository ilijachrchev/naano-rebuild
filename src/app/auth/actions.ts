"use server";

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
