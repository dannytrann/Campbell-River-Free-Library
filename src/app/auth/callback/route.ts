import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link landing: exchange the one-time code for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next") ?? "/profile";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/profile";

  if (code || tokenHash) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          type: (type as "magiclink" | "email" | "signup" | "recovery" | "invite") ?? "email",
          token_hash: tokenHash!,
        });
    if (!error) {
      const url = new URL(next, origin);
      url.searchParams.set("signed_in", "1");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.redirect(new URL("/login?error=link", origin));
}
