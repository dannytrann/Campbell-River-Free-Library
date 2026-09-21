"use client";

import { useEffect, useState } from "react";
import type { PhotoWithUrl } from "@/lib/types";

export function PhotoGallery({ photos }: { photos: PhotoWithUrl[] }) {
  const shown = photos.filter((p) => p.signedUrl);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % shown.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + shown.length) % shown.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shown.length]);

  const current = open === null ? null : shown[open];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((p, i) => (
          <button key={p.id} onClick={() => setOpen(i)} className="card group overflow-hidden text-left">
            {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL */}
            <img
              src={p.signedUrl!}
              alt={p.caption ?? "Library photo"}
              loading="lazy"
              className="aspect-square w-full object-cover transition group-hover:scale-105"
            />
            {p.caption && <p className="truncate border-t-[2.5px] border-ink px-2 py-1 text-sm">{p.caption}</p>}
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4"
          onClick={() => setOpen(null)}
        >
          <figure className="card max-h-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.signedUrl!} alt={current.caption ?? "Library photo"} className="max-h-[75vh] w-full object-contain bg-ink" />
            <figcaption className="flex items-center justify-between gap-3 p-3">
              <span>{current.caption}</span>
              <button className="btn-secondary !py-1 !px-3" onClick={() => setOpen(null)}>
                Close
              </button>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
