/**
 * Seed the libraries table.
 *
 *   npm run seed            # insert/update the entries below
 *   npm run seed -- --reset # delete ALL libraries (and their photos/visits) first
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS — never expose it to the browser).
 *
 * The entries below are PLACEHOLDERS spread around Campbell River so the map has
 * something to show. Replace them with real locations as you find them. To get
 * coordinates: right-click a spot in Google Maps and click the lat/lng to copy it.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

type SeedLibrary = {
  /** Matched on re-runs, so re-seeding updates instead of duplicating. Renaming creates a new row (use --reset). */
  name: string;
  lat: number;
  lng: number;
  neighborhood?: string;
  description?: string;
  /** Preset key from src/lib/markers.ts (e.g. "orca") or a custom "house:######" code from the submit form. */
  icon?: string;
};

const LIBRARIES: SeedLibrary[] = [
  { name: "Placeholder: Willow Point Nook", lat: 49.9728, lng: -125.2123, neighborhood: "Willow Point", icon: "house", description: "PLACEHOLDER — replace with a real library." },
  { name: "Placeholder: Seawalk Stop", lat: 50.0081, lng: -125.2291, neighborhood: "Seawalk / Frank James Park", icon: "fish", description: "PLACEHOLDER — replace with a real library." },
  { name: "Placeholder: Downtown Shelf", lat: 50.0247, lng: -125.2465, neighborhood: "Downtown", icon: "book", description: "PLACEHOLDER — replace with a real library." },
  { name: "Placeholder: Campbellton Corner", lat: 50.0386, lng: -125.2702, neighborhood: "Campbellton", icon: "tree", description: "PLACEHOLDER — replace with a real library." },
  { name: "Placeholder: Quinsam Heights Owl", lat: 50.0156, lng: -125.2860, neighborhood: "Quinsam Heights", icon: "owl", description: "PLACEHOLDER — replace with a real library." },
  { name: "Placeholder: Willow Creek Box", lat: 49.9880, lng: -125.2458, neighborhood: "Willow Creek", icon: "house", description: "PLACEHOLDER — replace with a real library." },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  if (process.argv.includes("--reset")) {
    const { error } = await supabase.from("libraries").delete().not("id", "is", null);
    if (error) throw error;
    console.log("Deleted all libraries.");
  }

  for (const lib of LIBRARIES) {
    const row = {
      name: lib.name,
      lat: lib.lat,
      lng: lib.lng,
      neighborhood: lib.neighborhood ?? null,
      description: lib.description ?? null,
      icon: lib.icon ?? "book",
      status: "approved" as const,
    };
    const { data: existing } = await supabase.from("libraries").select("id").eq("name", lib.name).maybeSingle();
    const { error } = existing
      ? await supabase.from("libraries").update(row).eq("id", existing.id)
      : await supabase.from("libraries").insert(row);
    if (error) throw error;
    console.log(`${existing ? "Updated" : "Inserted"}  ${lib.name}`);
  }
  console.log(`Done — ${LIBRARIES.length} libraries seeded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
