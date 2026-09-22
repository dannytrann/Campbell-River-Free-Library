"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocalVisits } from "./useLocalVisits";

const DISMISS_KEY = "crll:nudge-dismissed";
const THRESHOLD = 3;

/**
 * Anonymous visits live in this browser only, so once someone has ticked off a
 * few libraries we make the risk obvious instead of leaving it to a small line
 * of text. Dismissed for the rest of the browser session.
 */
export function SaveTourNudge({ signedIn }: { signedIn: boolean }) {
  const visits = useLocalVisits();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (signedIn || dismissed || visits.length < THRESHOLD) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div className="card mx-auto flex max-w-md flex-col gap-3 bg-sun p-4 sm:flex-row sm:items-center">
        <span className="text-3xl" aria-hidden>🔖</span>
        <div className="flex-1">
          <p className="font-display text-lg font-extrabold leading-tight">
            You&apos;ve found {visits.length} libraries!
          </p>
          <p className="text-sm">
            They&apos;re only saved on this device. Sign in to keep your tour, earn badges, and join the leaderboard.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary !py-1.5 !px-4">
            Save my tour
          </Link>
          <button onClick={dismiss} className="text-sm font-bold underline">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
