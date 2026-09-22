import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed one-use-ish tokens for the approve/reject links in notification emails.
 * A token names a single row and expires, so a leaked email can't be used to
 * moderate anything else — and it is verified before any action is offered.
 */
export type ReviewKind = "library" | "photo";

const TTL_MS = 14 * 24 * 60 * 60 * 1000;

function secret() {
  const s = process.env.REVIEW_TOKEN_SECRET;
  if (!s || s.length < 16) throw new Error("REVIEW_TOKEN_SECRET is missing or too short (use 32+ random chars).");
  return s;
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");

export function createReviewToken(kind: ReviewKind, id: string, expiresAt = Date.now() + TTL_MS): string {
  const payload = b64(`${kind}.${id}.${expiresAt}`);
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyReviewToken(token: string): { kind: ReviewKind; id: string } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [kind, id, expiresAt] = Buffer.from(payload, "base64url").toString().split(".");
  if ((kind !== "library" && kind !== "photo") || !id) return null;
  if (!Number(expiresAt) || Number(expiresAt) < Date.now()) return null;
  return { kind, id };
}
