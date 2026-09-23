import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import type { Badge, Library, Photo, PhotoWithUrl, Profile } from "@/lib/types";

/** Cached per request: the layout, header and page all ask for these. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
});

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

/** One cover per library, picked in Postgres (see get_library_covers). */
export async function getCoverPhotos(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_library_covers");
  const covers = (data ?? []) as { library_id: string; image_url: string }[];
  if (covers.length === 0) return {};

  const { data: signed } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(covers.map((c) => c.image_url), 60 * 60);
  const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return Object.fromEntries(
    covers
      .map((c) => [c.library_id, byPath.get(c.image_url)] as const)
      .filter((pair): pair is readonly [string, string] => Boolean(pair[1])),
  );
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
