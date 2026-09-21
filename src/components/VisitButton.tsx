"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordVisits } from "@/app/actions";
import { addLocalVisit } from "@/lib/tour-storage";
import type { BadgeType } from "@/lib/types";
import { BadgeToast } from "./BadgeToast";
import { celebrate } from "./celebrate";
import { useLocalVisits } from "./useLocalVisits";

type Props = { libraryId: string; signedIn: boolean; initiallyVisited: boolean; compact?: boolean };

export function VisitButton({ libraryId, signedIn, initiallyVisited, compact }: Props) {
  const router = useRouter();
  const [savedVisit, setSavedVisit] = useState(initiallyVisited);
  const localVisits = useLocalVisits();
  const visited = savedVisit || (!signedIn && localVisits.includes(libraryId));
  const [nudge, setNudge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [pending, startTransition] = useTransition();
  const close = useCallback(() => setBadges([]), []);

  const onClick = () => {
    setError(null);
    if (!signedIn) {
      addLocalVisit(libraryId);
      setNudge(true);
      celebrate();
      return;
    }
    startTransition(async () => {
      const res = await recordVisits([libraryId]);
      if (!res.ok) return setError(res.error);
      setSavedVisit(true);
      if (res.newBadges.length) setBadges(res.newBadges);
      else celebrate();
      router.refresh();
    });
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
      <button onClick={onClick} disabled={visited || pending} className={visited ? "btn-secondary" : "btn-primary"}>
        {visited ? "✅ Visited!" : pending ? "Saving…" : "📍 I visited!"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {nudge && !compact && (
        <p className="text-sm">
          Saved on this device.{" "}
          <Link href="/login" className="font-bold underline">
            Sign in
          </Link>{" "}
          to keep your tour and earn badges.
        </p>
      )}
      <BadgeToast badges={badges} onClose={close} />
    </div>
  );
}
