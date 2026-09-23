/**
 * Guards against src/lib/types.ts drifting from the real database.
 *
 *   npm run check:schema
 *
 * Reads the column list PostgREST publishes for each table and compares it with
 * the hand-written types. Needs .env.local; not run in CI (no credentials there).
 */
import { config } from "dotenv";
import { readFileSync } from "fs";

config({ path: ".env.local" });

const TYPES: Record<string, string> = {
  libraries: "Library",
  photos: "Photo",
  profiles: "Profile",
  badges: "Badge",
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and a key in .env.local");

  const spec = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }).then((r) => r.json());
  const source = readFileSync("src/lib/types.ts", "utf8");
  let problems = 0;

  for (const [table, typeName] of Object.entries(TYPES)) {
    const columns: string[] = Object.keys(spec.definitions?.[table]?.properties ?? {});
    if (columns.length === 0) {
      console.error(`✗ ${table}: not found in the API schema`);
      problems++;
      continue;
    }
    const block = new RegExp(`export type ${typeName} = \\{([^}]*)\\}`, "m").exec(source)?.[1] ?? "";
    const declared = [...block.matchAll(/^\s*(\w+)\s*[?:]/gm)].map((m) => m[1]);

    const missing = columns.filter((c) => !declared.includes(c));
    const extra = declared.filter((d) => !columns.includes(d));
    if (missing.length || extra.length) {
      console.error(`✗ ${table} (${typeName}) — missing: ${missing.join(", ") || "none"} | not in db: ${extra.join(", ") || "none"}`);
      problems++;
    } else {
      console.log(`✓ ${table} (${typeName}) — ${columns.length} columns match`);
    }
  }

  if (problems) {
    console.error(`\n${problems} table(s) out of sync — update src/lib/types.ts.`);
    process.exit(1);
  }
  console.log("\nTypes match the database.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
