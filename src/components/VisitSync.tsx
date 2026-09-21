"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearLocalVisits, readLocalVisits } from "@/lib/tour-storage";
import { recordVisits } from "@/app/actions";
import type { BadgeType } from "@/lib/types";
import { BadgeToast } from "./BadgeToast";

/** Once someone signs in, move their anonymous (localStorage) visits onto their account. */
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
        router.refresh();
      }
    };

    supabase.auth.getUser().then(({ data }) => data.user && sync());
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") sync();
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return <BadgeToast badges={badges} onClose={close} />;
}
