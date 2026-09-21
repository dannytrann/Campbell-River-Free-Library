"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CAMPBELL_RIVER_CENTER, CARTOON_MAP_STYLE } from "@/lib/map-style";
import { markerDataUri } from "@/lib/markers";
import type { Library } from "@/lib/types";
import { useGoogleMaps } from "./useGoogleMaps";
import { ProgressBar } from "./ProgressBar";
import { VisitButton } from "./VisitButton";
import { useLocalVisits } from "./useLocalVisits";

type Props = {
  libraries: Library[];
  covers?: Record<string, string>;
  visitedIds?: string[];
  signedIn?: boolean;
  /** Landing-page preview: no card, no gestures, click goes to /map. */
  preview?: boolean;
  initialSelectedId?: string;
};

export function LibraryMap({ libraries, covers = {}, visitedIds = [], signedIn = false, preview, initialSelectedId }: Props) {
  const status = useGoogleMaps();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const framedRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  // Anonymous visitors: merge in visits saved on this device.
  const localVisits = useLocalVisits();
  const visited = useMemo(
    () => new Set([...visitedIds, ...(signedIn ? [] : localVisits)]),
    [visitedIds, localVisits, signedIn],
  );
  const visitedCount = libraries.filter((l) => visited.has(l.id)).length;
  const selected = libraries.find((l) => l.id === selectedId) ?? null;

  // Create the map once the API is ready.
  useEffect(() => {
    if (status !== "ready" || !el.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(el.current, {
      center: CAMPBELL_RIVER_CENTER,
      zoom: 13,
      styles: CARTOON_MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: !preview,
      gestureHandling: preview ? "none" : "greedy",
      clickableIcons: false,
      keyboardShortcuts: !preview,
    });
    if (!preview) mapRef.current.addListener("click", () => setSelectedId(null));
  }, [status, preview]);

  // (Re)draw markers whenever data or visit state changes.
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = libraries.map((lib) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: lib.lat, lng: lib.lng },
        title: lib.name,
        icon: {
          url: markerDataUri(lib.icon, visited.has(lib.id)),
          scaledSize: new google.maps.Size(44, 50),
          anchor: new google.maps.Point(22, 50),
        },
        clickable: !preview,
      });
      if (!preview) marker.addListener("click", () => setSelectedId(lib.id));
      return marker;
    });

    // Frame all libraries once; don't yank the view around on later redraws.
    if (!framedRef.current && libraries.length > 1) {
      framedRef.current = true;
      const focus = libraries.find((l) => l.id === initialSelectedId);
      if (focus) {
        map.setCenter({ lat: focus.lat, lng: focus.lng });
        map.setZoom(16);
      } else {
        const bounds = new google.maps.LatLngBounds();
        libraries.forEach((l) => bounds.extend({ lat: l.lat, lng: l.lng }));
        map.fitBounds(bounds, 60);
      }
    }
  }, [status, libraries, visited, preview, initialSelectedId]);

  // Pan to a selected library (e.g. deep link from /map?library=…).
  useEffect(() => {
    if (selected && mapRef.current) mapRef.current.panTo({ lat: selected.lat, lng: selected.lng });
  }, [selected]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="absolute inset-0 bg-[#f6ecd9]" />

      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <p className="card max-w-sm p-4 font-bold">
            {status === "loading" ? "Unfolding the map… 🗺️" : status.error}
          </p>
        </div>
      )}

      {!preview && (
        <div className="card absolute left-3 right-3 top-3 p-3 sm:right-auto sm:w-80">
          <ProgressBar visited={visitedCount} total={libraries.length} />
        </div>
      )}

      {!preview && selected && (
        <div className="card absolute inset-x-3 bottom-3 overflow-hidden sm:left-auto sm:right-4 sm:top-4 sm:bottom-auto sm:w-96">
          {covers[selected.id] ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL
            <img src={covers[selected.id]} alt={`Photo of ${selected.name}`} className="h-40 w-full border-b-[2.5px] border-ink object-cover" />
          ) : (
            <div className="grid h-24 place-items-center border-b-[2.5px] border-ink bg-sky/40 text-sm font-bold">
              No photos yet — be the first! 📸
            </div>
          )}
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-extrabold leading-tight">{selected.name}</h2>
                {selected.neighborhood && <p className="text-sm opacity-80">{selected.neighborhood}</p>}
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close" className="font-bold">✕</button>
            </div>
            {selected.description && <p className="line-clamp-3 text-sm">{selected.description}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <VisitButton
                key={selected.id}
                libraryId={selected.id}
                signedIn={signedIn}
                initiallyVisited={visited.has(selected.id)}
                compact
              />
              <Link href={`/library/${selected.id}`} className="btn-secondary">
                Details →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
