"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearLocalVisits, readLocalVisits } from "@/lib/tour-storage";
import { recordVisits } from "@/app/actions";
import type { BadgeType } from "@/lib/types";
import { BadgeToast } from "./BadgeToast";

/**
 * Two jobs once someone signs in:
 *  - move their anonymous (localStorage) visits onto the account, and
 *  - refresh the server components, so the header stops saying "Sign in".
 *
 * The second matters because a magic link can land with the session in the URL
 * fragment, which only the browser can read: the HTML was already rendered as
 * logged-out, and without this the user has to reload by hand.
 */
export function VisitSync() {
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const close = useCallback(() => setBadges([]), []);

  useEffect(() => {
    let supabase;
    try {
      supabase = createClient();
    } catch {
      return; // Supabase not configured yet
    }

    const sync = async () => {
      const local = readLocalVisits();
      if (local.length === 0) return;
      const res = await recordVisits(local);
      if (res.ok) {
        clearLocalVisits();
        if (res.newBadges.length) setBadges(res.newBadges);
      }
    };

    supabase.auth.getUser().then(({ data }) => data.user && sync());
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      sync().finally(() => router.refresh());
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return <BadgeToast badges={badges} onClose={close} />;
}
