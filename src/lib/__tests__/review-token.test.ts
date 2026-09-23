import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.REVIEW_TOKEN_SECRET = "test-secret-that-is-long-enough-123456";
});

// Imported after the env var is set: the module reads it lazily, but keep the
// order explicit so a future refactor to a module constant fails loudly here.
const { createReviewToken, verifyReviewToken } = await import("../review-token");

const ID = "9bbee173-c1d2-420c-b1a5-da79f2d094a5";

describe("review tokens", () => {
  it("round-trips a valid token", () => {
    expect(verifyReviewToken(createReviewToken("library", ID))).toEqual({ kind: "library", id: ID });
    expect(verifyReviewToken(createReviewToken("photo", ID))).toEqual({ kind: "photo", id: ID });
  });

  it("rejects a tampered payload", () => {
    const token = createReviewToken("library", ID);
    const [payload, sig] = token.split(".");
    const forged = Buffer.from(`library.00000000-0000-0000-0000-000000000000.${Date.now() + 1000}`).toString("base64url");
    expect(verifyReviewToken(`${forged}.${sig}`)).toBeNull();
    expect(verifyReviewToken(`${payload}.${"a".repeat(sig.length)}`)).toBeNull();
  });

  it("rejects an expired token", () => {
    expect(verifyReviewToken(createReviewToken("library", ID, Date.now() - 1))).toBeNull();
  });

  it("rejects malformed input", () => {
    for (const bad of ["", "nonsense", "a.b", "....", Buffer.from("library.x.1").toString("base64url")]) {
      expect(verifyReviewToken(bad)).toBeNull();
    }
  });

  it("rejects a token signed with a different secret", () => {
    const token = createReviewToken("library", ID);
    process.env.REVIEW_TOKEN_SECRET = "a-completely-different-secret-value-9999";
    expect(verifyReviewToken(token)).toBeNull();
    process.env.REVIEW_TOKEN_SECRET = "test-secret-that-is-long-enough-123456";
  });
});
