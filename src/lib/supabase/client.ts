"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { BrowserDatabase } from "@/types/browser-database";

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing public Supabase environment variables");
  }

  return createBrowserClient<BrowserDatabase>(url, anonKey);
}
