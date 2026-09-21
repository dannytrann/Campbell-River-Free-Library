"use client";

import { useMemo, useSyncExternalStore } from "react";
import { localVisitsSnapshot, parseVisits, subscribeLocalVisits } from "@/lib/tour-storage";

/** Library ids visited anonymously on this device. Empty during SSR. */
export function useLocalVisits(): string[] {
  const raw = useSyncExternalStore(subscribeLocalVisits, localVisitsSnapshot, () => "[]");
  return useMemo(() => parseVisits(raw), [raw]);
}
