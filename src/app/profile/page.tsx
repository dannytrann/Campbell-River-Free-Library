import type { Metadata } from "next";
import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { BADGES, BADGE_ORDER } from "@/lib/badges";
import { getApprovedLibraries, getBadges, getCurrentUser, getProfile, getVisitedIds, withSignedUrls } from "@/lib/data";
import { markerDataUri } from "@/lib/markers";
import { createClient } from "@/lib/supabase/server";
import { NameForm } from "./NameForm";

export const metadata: Metadata = { title: "My tour" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/profile" message="Sign in to see your tour progress and badges." />;

  const supabase = await createClient();
  const [profile, libraries, visitedIds, badges, { data: myPhotos }] = await Promise.all([
    getProfile(user.id),
    getApprovedLibraries(),
    getVisitedIds(user.id),
    getBadges(user.id),
    supabase.from("photos").select("*").eq("uploaded_by", user.id).order("created_at", { ascending: false }),
  ]);
  const photos = await withSignedUrls(myPhotos ?? []);
  const visited = new Set(visitedIds);
  const earned = new Map(badges.map((b) => [b.badge_type, b]));
  const visitedLibraries = libraries.filter((l) => visited.has(l.id));
  const notYet = libraries.filter((l) => !visited.has(l.id));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8">
      <header className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold opacity-70">Explorer</p>
          <h1 className="font-display text-3xl font-extrabold">{profile?.display_name ?? "Reader"}</h1>
          <NameForm current={profile?.display_name ?? ""} />
        </div>
        <div className="sm:w-80">
          <ProgressBar visited={visitedLibraries.length} total={libraries.length} />
        </div>
      </header>

      <section>
        <h2 className="mb-4 font-display text-2xl font-extrabold">Badges</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {BADGE_ORDER.map((b) => {
            const got = earned.get(b);
            return (
              <div key={b} className={`card p-4 text-center ${got ? "bg-sun/50" : "opacity-50 grayscale"}`}>
                <div className="text-4xl" aria-hidden>{BADGES[b].emoji}</div>
                <p className="mt-2 font-display font-extrabold leading-tight">{BADGES[b].label}</p>
                <p className="text-xs">
                  {got ? `Earned ${new Date(got.earned_at).toLocaleDateString("en-CA")}` : BADGES[b].description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-2xl font-extrabold">Visited ({visitedLibraries.length})</h2>
          <LibraryList items={visitedLibraries} visited empty="No visits yet — head to the map!" />
        </div>
        <div>
          <h2 className="mb-3 font-display text-2xl font-extrabold">Still to find ({notYet.length})</h2>
          <LibraryList items={notYet} empty="You found them all! 🏆" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl font-extrabold">My photos ({photos.length})</h2>
        {photos.length === 0 ? (
          <p>You haven&apos;t shared any photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p) => (
              <div key={p.id} className="card overflow-hidden">
                {p.signedUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.signedUrl} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
                )}
                <p className="border-t-[2.5px] border-ink px-2 py-1 text-xs font-bold capitalize">
                  {p.status === "approved" ? "✅" : p.status === "pending" ? "⏳" : "❌"} {p.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LibraryList({ items, visited, empty }: { items: { id: string; name: string; icon: string; neighborhood: string | null }[]; visited?: boolean; empty: string }) {
  if (items.length === 0) return <p>{empty}</p>;
  return (
    <ul className="card divide-y-2 divide-ink/10">
      {items.map((l) => (
        <li key={l.id}>
          <Link href={`/library/${l.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markerDataUri(l.icon, visited)} alt="" width={28} height={32} />
            <span className="flex-1 font-bold">{l.name}</span>
            {l.neighborhood && <span className="text-xs opacity-70">{l.neighborhood}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
