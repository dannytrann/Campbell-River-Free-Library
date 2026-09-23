import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedLibraries, getCurrentUser, getVisitedIds } from "@/lib/data";
import { markerDataUri } from "@/lib/markers";

export const metadata: Metadata = {
  title: "All libraries",
  description:
    "Every free little library on the Campbell River map, listed by neighbourhood — with directions and photos for each one.",
};

/**
 * A plain list of every library: searchable by Google, readable by screen
 * readers, and usable by anyone who'd rather not pan around a map.
 */
export default async function LibrariesPage() {
  const user = await getCurrentUser();
  const [libraries, visitedIds] = await Promise.all([
    getApprovedLibraries(),
    user ? getVisitedIds(user.id) : Promise.resolve([]),
  ]);
  const visited = new Set(visitedIds);

  const byNeighborhood = new Map<string, typeof libraries>();
  for (const l of libraries) {
    const key = l.neighborhood?.trim() || "Around town";
    byNeighborhood.set(key, [...(byNeighborhood.get(key) ?? []), l]);
  }
  const groups = [...byNeighborhood.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold">All little libraries</h1>
        <p>
          {libraries.length} free little {libraries.length === 1 ? "library" : "libraries"} in Campbell River, BC.{" "}
          <Link href="/map" className="font-bold underline">See them on the map →</Link>
        </p>
      </header>

      {libraries.length === 0 ? (
        <div className="card space-y-3 p-6 text-center">
          <p>No libraries on the map yet.</p>
          <Link href="/submit" className="btn-primary">Add the first one</Link>
        </div>
      ) : (
        groups.map(([neighborhood, items]) => (
          <section key={neighborhood} className="space-y-3">
            <h2 className="font-display text-2xl font-extrabold">{neighborhood}</h2>
            <ul className="card divide-y-2 divide-ink/10">
              {items.map((l) => (
                <li key={l.id}>
                  <Link href={`/library/${l.id}`} className="flex items-center gap-3 p-3 hover:bg-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={markerDataUri(l.icon, visited.has(l.id))} alt="" width={34} height={39} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{l.name}</span>
                      {l.description && <span className="line-clamp-1 block text-sm opacity-80">{l.description}</span>}
                    </span>
                    {visited.has(l.id) && <span className="shrink-0 text-sm font-bold">✅ Visited</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
