"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  links: { href: string; label: string }[];
  signedIn: boolean;
  name: string | null;
  signOut: () => Promise<void>;
};

export function MobileNav({ links, signedIn, name, signOut }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        className="btn-secondary !px-3 !py-1.5"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <div onClick={() => setOpen(false)} className="card absolute inset-x-3 top-[70px] flex flex-col gap-1 p-3 font-bold">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 hover:bg-paper">
              {l.label}
            </Link>
          ))}
          {signedIn ? (
            <>
              <Link href="/profile" className="rounded-lg px-3 py-2 hover:bg-paper">
                {name ?? "My tour"}
              </Link>
              <form action={signOut}>
                <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-paper">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-paper">Sign in</Link>
          )}
        </div>
      )}
    </div>
  );
}
