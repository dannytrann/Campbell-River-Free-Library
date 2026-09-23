/**
 * Import little libraries from a Google My Maps export.
 *
 *   npm run import:kml -- <mid-or-kml-url-or-file> [--dry-run]
 *
 * Accepts a My Maps `mid`, a full map URL, a KML URL, or a local .kml file.
 * Points already on the map (same name, or within ~40m of an existing library)
 * are skipped, so re-running is safe.
 *
 * Imported libraries are inserted as `approved` — they come from a curated map,
 * not the public submit form, so they don't need moderating (and that also
 * means the submission email doesn't fire 50 times).
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { MARKER_ICONS } from "../src/lib/markers";

config({ path: ".env.local" });

type Point = { name: string; lat: number; lng: number; description: string | null };

const DUPLICATE_METRES = 40;

/** Rough metre distance between two nearby coordinates. */
function metresBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (a.lat - b.lat) * 111_320;
  const dLng = (a.lng - b.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Stable icon per library so the map has variety but never changes on re-import. */
function iconFor(name: string) {
  const choices = ["house", "house", "book", "house", "tree", "book", "house", "owl", "house", "flower"];
  const hash = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const key = choices[hash % choices.length];
  return MARKER_ICONS.some((i) => i.key === key) ? key : "house";
}

function parseKml(xml: string): Point[] {
  const points: Point[] = [];
  for (const [, block] of xml.matchAll(/<Placemark>([\s\S]*?)<\/Placemark>/g)) {
    const coords = /<coordinates>\s*([-\d.]+),([-\d.]+)/.exec(block);
    if (!coords) continue; // lines, shapes, anything that isn't a pin
    const rawName = /<name>([\s\S]*?)<\/name>/.exec(block)?.[1] ?? "";
    const rawDesc = /<description>([\s\S]*?)<\/description>/.exec(block)?.[1] ?? "";
    const clean = (s: string) =>
      s
        .replace(/<!\[CDATA\[|\]\]>/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

    const name = clean(rawName);
    if (!name) continue;
    points.push({
      name,
      lng: Number(coords[1]),
      lat: Number(coords[2]),
      description: clean(rawDesc) || null,
    });
  }
  return points;
}

async function loadSource(arg: string): Promise<string> {
  if (arg.endsWith(".kml")) return readFileSync(arg, "utf8");
  const mid = /mid=([^&]+)/.exec(arg)?.[1] ?? arg;
  const url = arg.startsWith("http") && arg.includes("/maps/d/kml")
    ? arg
    : `https://www.google.com/maps/d/kml?mid=${mid}&forcekml=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch the map (${res.status}). Is it shared publicly?`);
  return res.text();
}

async function main() {
  const [arg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const dryRun = process.argv.includes("--dry-run");
  if (!arg) throw new Error("Usage: npm run import:kml -- <mid|url|file.kml> [--dry-run]");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const points = parseKml(await loadSource(arg));
  console.log(`Found ${points.length} points in the map.`);

  const { data: existing, error } = await supabase.from("libraries").select("id, name, lat, lng");
  if (error) throw error;

  const fresh: Point[] = [];
  for (const p of points) {
    const clash = (existing ?? []).find(
      (e) => e.name.toLowerCase() === p.name.toLowerCase() || metresBetween(e, p) < DUPLICATE_METRES,
    );
    const alsoInBatch = fresh.find((f) => metresBetween(f, p) < DUPLICATE_METRES);
    if (clash) console.log(`  skip (already on the map): ${p.name}`);
    else if (alsoInBatch) console.log(`  skip (duplicate within import): ${p.name}`);
    else fresh.push(p);
  }

  console.log(`\n${fresh.length} to add, ${points.length - fresh.length} skipped.`);
  if (dryRun) {
    fresh.forEach((p) => console.log(`  + ${p.name} (${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}) [${iconFor(p.name)}]`));
    console.log("\nDry run — nothing written.");
    return;
  }
  if (fresh.length === 0) return;

  const { error: insertError } = await supabase.from("libraries").insert(
    fresh.map((p) => ({
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      description: p.description,
      icon: iconFor(p.name),
      status: "approved" as const,
    })),
  );
  if (insertError) throw insertError;
  console.log(`Added ${fresh.length} libraries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
