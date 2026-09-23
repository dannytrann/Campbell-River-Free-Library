import Link from "next/link";
import { getCurrentUser, getProfile } from "@/lib/data";
import { signOut } from "@/app/actions";
import { MobileNav } from "./MobileNav";

const links = [
  { href: "/map", label: "Map" },
  { href: "/libraries", label: "All libraries" },
  { href: "/submit", label: "Add a library" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);
  const profile = user ? await getProfile(user.id) : null;

  // Moderation lives at /admin/moderate — deliberately not linked in the nav.
  const allLinks = links;

  return (
    <header className="sticky top-0 z-30 border-b-[2.5px] border-ink bg-sun">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold leading-none">
          <span className="text-2xl" aria-hidden>📚</span>
          <span className="hidden sm:inline">CR Little Libraries</span>
          <span className="sm:hidden">CR Libraries</span>
        </Link>

        <nav className="hidden items-center gap-5 font-bold md:flex">
          {allLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline decoration-[3px] underline-offset-4">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="btn-secondary !py-1.5 !px-4">
                {profile?.display_name ?? "My tour"}
              </Link>
              <form action={signOut}>
                <button className="text-sm underline">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-secondary !py-1.5 !px-4">Sign in</Link>
          )}
        </nav>

        <MobileNav links={allLinks} signedIn={!!user} name={profile?.display_name ?? null} signOut={signOut} />
      </div>
    </header>
  );
}
