import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import type { Badge, Library, Photo, PhotoWithUrl, Profile } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function getApprovedLibraries(): Promise<Library[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("libraries")
    .select("*")
    .eq("status", "approved")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getLibrary(id: string): Promise<Library | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("libraries").select("*").eq("id", id).maybeSingle();
  return data;
}

/** Attach signed URLs (bucket is private so pending photos stay hidden). */
export async function withSignedUrls(photos: Photo[], expiresIn = 60 * 60): Promise<PhotoWithUrl[]> {
  if (photos.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(photos.map((p) => p.image_url), expiresIn);
  const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return photos.map((p) => ({ ...p, signedUrl: byPath.get(p.image_url) ?? null }));
}

export async function getApprovedPhotos(libraryId: string): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("library_id", libraryId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return withSignedUrls(data ?? []);
}

/** One cover photo per library for map cards. */
export async function getCoverPhotos(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(500);
  const seen = new Set<string>();
  const covers = (data ?? []).filter((p) => !seen.has(p.library_id) && seen.add(p.library_id));
  const signed = await withSignedUrls(covers);
  return Object.fromEntries(signed.filter((p) => p.signedUrl).map((p) => [p.library_id, p.signedUrl!]));
}

export async function getVisitedIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("visits").select("library_id").eq("user_id", userId);
  return (data ?? []).map((v) => v.library_id);
}

export async function getBadges(userId: string): Promise<Badge[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at");
  return data ?? [];
}
