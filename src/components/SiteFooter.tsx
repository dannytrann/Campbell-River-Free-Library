"use client";

import { usePathname } from "next/navigation";
import { markerDataUri, MARKER_ICONS } from "@/lib/markers";

export function SiteFooter() {
  // The map fills the viewport; a footer under it would just add a stray scroll.
  const pathname = usePathname();
  if (pathname === "/map") return null;

  return (
    <footer className="mt-auto border-t-[2.5px] border-ink bg-sun/40 px-4 py-6 text-center text-sm">
      <div className="mb-2 flex flex-wrap justify-center gap-1">
        {MARKER_ICONS.map((m) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={m.key} src={markerDataUri(m.key)} alt="" width={24} height={28} />
        ))}
      </div>
      <p>Made with love for Campbell River readers.</p>
      <p className="mt-1">
        Created by{" "}
        <a
          href="https://dannyhaitran.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline decoration-[2px] underline-offset-2 hover:text-coral"
        >
          Danny Tran
        </a>
      </p>
    </footer>
  );
}
