import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const signaturePattern = /^[a-f0-9]{64}$/;

function getSigningKey() {
  const signingKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!signingKey) throw new Error("Missing creator signup signing key");
  return signingKey;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function signCreatorSignupIntent(email: string) {
  return createHmac("sha256", getSigningKey())
    .update(`naano:creator-signup:${normalizeEmail(email)}`)
    .digest("hex");
}

export function verifyCreatorSignupIntent(email: string, signature: unknown) {
  if (typeof signature !== "string" || !signaturePattern.test(signature)) return false;

  const expected = signCreatorSignupIntent(email);
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
}
