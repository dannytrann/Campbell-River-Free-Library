import Link from "next/link";
import { PinScatter } from "@/components/PinScatter";
import { getApprovedLibraries } from "@/lib/data";
import { BADGES, BADGE_ORDER } from "@/lib/badges";
import { markerDataUri } from "@/lib/markers";

export default async function Home() {
  const libraries = await getApprovedLibraries().catch(() => []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="space-y-6">
          <p className="inline-block rotate-[-2deg] rounded-full border-[2.5px] border-ink bg-sky px-3 py-1 text-sm font-bold">
            Campbell River, BC 🐟
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
            Take a book.
            <br />
            Leave a book.
            <br />
            <span className="text-coral [-webkit-text-stroke:2px_var(--ink)]">Find them all.</span>
          </h1>
          <p className="max-w-md text-lg">
            There are {libraries.length > 0 ? <strong>{libraries.length}</strong> : "lots of"} little free libraries
            tucked around Campbell River. Explore the map, snap a photo, and collect badges as you complete the tour.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/map" className="btn-primary text-lg">
              Start your tour →
            </Link>
            <Link href="/submit" className="btn-secondary text-lg">
              Add a library
            </Link>
          </div>
        </div>

        <Link
          href="/map"
          aria-label="Open the full map"
          className="card relative block aspect-[4/3] rotate-1 overflow-hidden transition hover:rotate-0"
        >
          <PinScatter libraries={libraries} />
          <span className="absolute bottom-3 right-3 rounded-full border-[2.5px] border-ink bg-white px-3 py-1 text-sm font-bold">
            Open map ↗
          </span>
        </Link>
      </section>

      {/* How it works */}
      <section className="border-y-[2.5px] border-ink bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
          {[
            { n: "1", title: "Find a library", body: "Browse the map and pick a little library near you.", icon: "tree" },
            { n: "2", title: "Visit & check in", body: "Tap “I visited!” to mark it on your tour.", icon: "house" },
            { n: "3", title: "Share a photo", body: "Show off the shelves and help others find it.", icon: "owl" },
          ].map((s) => (
            <div key={s.n} className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={markerDataUri(s.icon)} alt="" width={48} height={55} className="shrink-0" />
              <div>
                <h3 className="font-display text-xl font-extrabold">
                  {s.n}. {s.title}
                </h3>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 font-display text-3xl font-extrabold">Badges to collect</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {BADGE_ORDER.map((b, i) => (
            <div key={b} className={`card p-4 text-center ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
              <div className="text-4xl" aria-hidden>{BADGES[b].emoji}</div>
              <p className="mt-2 font-display text-lg font-extrabold leading-tight">{BADGES[b].label}</p>
              <p className="text-sm opacity-80">{BADGES[b].description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
