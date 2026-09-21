"use client";

import { useEffect, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let configured = false;

const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const missingKey = { error: "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to show the map." };

/** Loads the Maps JS API once; returns "ready", "loading", or an error message. */
export function useGoogleMaps() {
  const [state, setState] = useState<"loading" | "ready" | { error: string }>(key ? "loading" : missingKey);

  useEffect(() => {
    if (!key) return;
    if (!configured) {
      setOptions({ key, v: "weekly" });
      configured = true;
    }
    let cancelled = false;
    Promise.all([importLibrary("maps"), importLibrary("marker")])
      .then(() => !cancelled && setState("ready"))
      .catch((e) => !cancelled && setState({ error: String(e?.message ?? e) }));
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
