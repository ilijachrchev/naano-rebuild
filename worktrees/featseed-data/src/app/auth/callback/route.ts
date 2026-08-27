import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_REDIRECT_PATH = "/";

function getSafeRedirectPath(request: NextRequest) {
  const requestedPath = request.nextUrl.searchParams.get("next");

  if (!requestedPath?.startsWith("/") || requestedPath.startsWith("//")) {
    return DEFAULT_REDIRECT_PATH;
  }

  try {
    const destination = new URL(requestedPath, request.url);

    if (destination.origin !== request.nextUrl.origin) {
      return DEFAULT_REDIRECT_PATH;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return DEFAULT_REDIRECT_PATH;
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(request);

  if (!code) {
    return NextResponse.json({ error: "Missing auth code" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.json({ error: "Unable to complete sign-in" }, { status: 400 });
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
