"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import { MARKER_ICONS } from "@/lib/markers";
import type { BadgeType } from "@/lib/types";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";
}

// ───────────────────────── auth ─────────────────────────

export async function sendMagicLink(_prev: unknown, formData: FormData): Promise<Result> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email." };

  const supabase = await createClient();
  const next = safeNext(formData.get("next"));
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateDisplayName(_prev: unknown, formData: FormData): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };
  const name = String(formData.get("display_name") ?? "").trim().slice(0, 40);
  if (!name) return { ok: false, error: "Name can't be empty." };
  const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

// ───────────────────────── visits & badges ─────────────────────────

async function badgeSet(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("badges").select("badge_type").eq("user_id", userId);
  return new Set((data ?? []).map((b) => b.badge_type as BadgeType));
}

/** Log visits for the signed-in user; returns any badges newly earned. */
export async function recordVisits(libraryIds: string[]): Promise<Result<{ newBadges: BadgeType[] }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "not_signed_in" };

  const ids = Array.from(new Set(libraryIds)).filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 500);
  if (ids.length === 0) return { ok: true, newBadges: [] };

  const before = await badgeSet(supabase, user.id);
  const { error } = await supabase
    .from("visits")
    .upsert(ids.map((library_id) => ({ user_id: user.id, library_id })), {
      onConflict: "user_id,library_id",
      ignoreDuplicates: true,
    });
  if (error) return { ok: false, error: error.message };

  const after = await badgeSet(supabase, user.id);
  revalidatePath("/profile");
  return { ok: true, newBadges: [...after].filter((b) => !before.has(b)) };
}

// ───────────────────────── submissions ─────────────────────────

export async function submitLibrary(_prev: unknown, formData: FormData): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in to submit a library." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const icon = String(formData.get("icon") ?? "book");
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));

  if (!name || name.length > 120) return { ok: false, error: "Give the library a name (max 120 characters)." };
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0))
    return { ok: false, error: "Drop a pin on the map to set the location." };
  if (description.length > 2000) return { ok: false, error: "Description is too long." };

  const { error } = await supabase.from("libraries").insert({
    name,
    description: description || null,
    neighborhood: neighborhood || null,
    icon: MARKER_ICONS.some((i) => i.key === icon) ? icon : "book",
    lat,
    lng,
    added_by: user.id,
    status: "pending",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function uploadPhoto(_prev: unknown, formData: FormData): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in to upload photos." };

  const libraryId = String(formData.get("library_id") ?? "");
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 300);
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo to upload." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Photos must be under 8 MB." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "That file isn't an image." };

  const { data: library } = await supabase.from("libraries").select("id").eq("id", libraryId).maybeSingle();
  if (!library) return { ok: false, error: "Library not found." };

  // Re-encode everything with sharp: strips EXIF (incl. GPS), fixes rotation,
  // and produces a display-sized WebP alongside a capped "original".
  let original: Buffer, display: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const base = sharp(input, { failOn: "error" }).rotate();
    [original, display] = await Promise.all([
      base.clone().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer(),
      base.clone().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer(),
    ]);
  } catch {
    return { ok: false, error: "We couldn't read that image. Try a JPG or PNG." };
  }

  const photoId = crypto.randomUUID();
  const folder = `${user.id}/${photoId}`;
  const originalPath = `${folder}/original.jpg`;
  const displayPath = `${folder}/display.webp`;

  const storage = supabase.storage.from(PHOTO_BUCKET);
  const [o, d] = await Promise.all([
    storage.upload(originalPath, original, { contentType: "image/jpeg" }),
    storage.upload(displayPath, display, { contentType: "image/webp" }),
  ]);
  if (o.error || d.error) return { ok: false, error: (o.error ?? d.error)!.message };

  const { error } = await supabase.from("photos").insert({
    id: photoId,
    library_id: libraryId,
    image_url: displayPath,
    original_path: originalPath,
    uploaded_by: user.id,
    caption: caption || null,
    status: "pending",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ───────────────────────── moderation ─────────────────────────

async function requireAdmin() {
  const { supabase, user } = await requireUser();
  if (!user) throw new Error("Not signed in");
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) throw new Error("Not an admin");
  return supabase;
}

export async function moderatePhoto(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = formData.get("status") === "approved" ? "approved" : "rejected";
  await supabase.from("photos").update({ status }).eq("id", id);
  revalidatePath("/admin/moderate");
  revalidatePath("/map");
}

export async function moderateLibrary(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = formData.get("status") === "approved" ? "approved" : "rejected";
  await supabase.from("libraries").update({ status }).eq("id", id);
  revalidatePath("/admin/moderate");
  revalidatePath("/map");
  revalidatePath("/");
}
