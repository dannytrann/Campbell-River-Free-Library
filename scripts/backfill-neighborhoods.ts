/**
 * Fill in missing neighbourhoods by reverse-geocoding each library.
 *
 *   npm run backfill:neighborhoods -- [--dry-run] [--force]
 *
 * Uses OpenStreetMap's Nominatim (no API key, 1 request/second per their usage
 * policy). Libraries that already have a neighbourhood are left alone unless
 * --force is passed, so anything typed by a person wins over the geocoder.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const USER_AGENT = "crlibraries-backfill/1.0 (https://www.crlibraries.info)";

/** Most specific useful label Nominatim gives us, in order of preference. */
function labelFrom(address: Record<string, string>): string | null {
  for (const key of ["suburb", "neighbourhood", "quarter", "city_district", "hamlet", "village"]) {
    if (address[key]) return address[key];
  }
  // Outside the city OSM gives a hamlet/village (Oyster River, Black Creek),
  // which is a useful label. But a bare "Campbell River", or a regional-district
  // name like "Area D (Oyster Bay/Buttle Lake)", says nothing a neighbourhood
  // heading should say — treat those as unknown and leave them for a local.
  const town = address.town || address.city;
  if (!town || /^Area [A-Z]\b/.test(town) || town === "Campbell River") return null;
  return town;
}

async function reverse(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const body = await res.json();
  return labelFrom(body.address ?? {});
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: libraries, error } = await supabase.from("libraries").select("id, name, lat, lng, neighborhood").order("name");
  if (error) throw error;

  const todo = (libraries ?? []).filter((l) => force || !l.neighborhood);
  console.log(`${todo.length} to look up (${(libraries ?? []).length - todo.length} already have one).\n`);

  const counts = new Map<string, number>();
  for (const l of todo) {
    const label = await reverse(l.lat, l.lng);
    counts.set(label ?? "(none found)", (counts.get(label ?? "(none found)") ?? 0) + 1);
    console.log(`  ${l.name.padEnd(42)} -> ${label ?? "(none found)"}`);
    if (!dryRun && label) {
      const { error: updateError } = await supabase.from("libraries").update({ neighborhood: label }).eq("id", l.id);
      if (updateError) throw updateError;
    }
    await new Promise((r) => setTimeout(r, 1100)); // Nominatim: 1 request/second
  }

  console.log("\nTotals:");
  [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));
  if (dryRun) console.log("\nDry run — nothing written.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
