"use client";

import { useEffect } from "react";
import { BADGES } from "@/lib/badges";
import type { BadgeType } from "@/lib/types";
import { celebrate } from "./celebrate";

export function BadgeToast({ badges, onClose }: { badges: BadgeType[]; onClose: () => void }) {
  useEffect(() => {
    if (badges.length === 0) return;
    celebrate();
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [badges, onClose]);

  if (badges.length === 0) return null;

  return (
    <div role="status" className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="card flex max-w-sm animate-[pop_0.4s_ease-out] items-center gap-3 bg-sun p-4">
        <span className="text-4xl" aria-hidden>{BADGES[badges[0]].emoji}</span>
        <div className="flex-1">
          <p className="font-display text-lg font-extrabold leading-tight">Badge earned!</p>
          <p className="text-sm">{badges.map((b) => BADGES[b].label).join(", ")}</p>
        </div>
        <button onClick={onClose} aria-label="Dismiss" className="font-bold">✕</button>
      </div>
      <style>{`@keyframes pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
