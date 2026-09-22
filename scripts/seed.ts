/**
 * Seed the libraries table.
 *
 *   npm run seed            # insert/update the entries below
 *   npm run seed -- --reset # delete ALL libraries (and their photos/visits) first
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS — never expose it to the browser).
 *
 * The list below is empty — add real Campbell River locations to bulk-load them.
 * To get coordinates: right-click a spot in Google Maps and click the lat/lng to copy it.
 * Libraries added through the /submit form don't need this script at all.
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
  // Add real libraries here, then run `npm run seed`. Example:
  // { name: "Cordero Crescent Library", lat: 49.9728, lng: -125.2123, neighborhood: "Discovery Plateau", icon: "house", description: "Light blue with asphalt roof." },
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
