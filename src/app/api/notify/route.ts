import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import { sendLibrarySubmissionEmail, sendPhotoSubmissionEmail } from "@/lib/email";
import type { Library, Photo } from "@/lib/types";

/**
 * Called by a Supabase Database Webhook when a row lands in `libraries` or
 * `photos`. Authenticated with a shared secret header, not a user session.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.NOTIFY_SECRET;
  if (!expected) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const given = request.headers.get("x-notify-secret") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || body.type !== "INSERT" || !body.record) return NextResponse.json({ ok: true, skipped: true });

  const supabase = createAdminClient();

  if (body.table === "libraries") {
    const library = body.record as Library;
    if (library.status !== "pending") return NextResponse.json({ ok: true, skipped: true });

    let submitter: string | null = null;
    if (library.added_by) {
      const { data } = await supabase.auth.admin.getUserById(library.added_by);
      submitter = data.user?.email ?? null;
    }
    const res = await sendLibrarySubmissionEmail(library, submitter);
    return NextResponse.json(res);
  }

  if (body.table === "photos") {
    const photo = body.record as Photo;
    if (photo.status !== "pending") return NextResponse.json({ ok: true, skipped: true });

    const [{ data: library }, { data: signed }] = await Promise.all([
      supabase.from("libraries").select("name").eq("id", photo.library_id).maybeSingle(),
      supabase.storage.from(PHOTO_BUCKET).createSignedUrl(photo.image_url, 14 * 24 * 60 * 60),
    ]);
    const res = await sendPhotoSubmissionEmail(photo, library?.name ?? "a library", signed?.signedUrl ?? null);
    return NextResponse.json(res);
  }

  return NextResponse.json({ ok: true, skipped: true });
}
