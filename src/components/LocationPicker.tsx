"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPBELL_RIVER_CENTER, CARTOON_MAP_STYLE } from "@/lib/map-style";
import { markerDataUri } from "@/lib/markers";
import { useGoogleMaps } from "./useGoogleMaps";

type LatLng = { lat: number; lng: number };

export function LocationPicker({ icon, onChange }: { icon: string; onChange: (p: LatLng) => void }) {
  const status = useGoogleMaps();
  const el = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [locating, setLocating] = useState(false);
  const iconRef = useRef(icon);

  const markerIcon = (key: string) => ({
    url: markerDataUri(key),
    scaledSize: new google.maps.Size(44, 50),
    anchor: new google.maps.Point(22, 50),
  });

  const place = (p: LatLng) => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({ map, draggable: true, icon: markerIcon(iconRef.current) });
      markerRef.current.addListener("dragend", () => {
        const pos = markerRef.current!.getPosition();
        if (pos) onChange({ lat: pos.lat(), lng: pos.lng() });
      });
    }
    markerRef.current.setPosition(p);
    onChange(p);
  };

  useEffect(() => {
    if (status !== "ready" || !el.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(el.current, {
      center: CAMPBELL_RIVER_CENTER,
      zoom: 13,
      styles: CARTOON_MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      gestureHandling: "greedy",
    });
    mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) place({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    iconRef.current = icon;
    markerRef.current?.setIcon(markerIcon(icon));
  }, [icon]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.panTo(p);
        mapRef.current?.setZoom(17);
        place(p);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="card relative h-72 overflow-hidden sm:h-96">
        <div ref={el} className="absolute inset-0 bg-[#f6ecd9]" />
        {status !== "ready" && (
          <div className="absolute inset-0 grid place-items-center p-4 text-center text-sm font-bold">
            {status === "loading" ? "Loading map…" : status.error}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>Tap the map to drop a pin, then drag to fine-tune.</span>
        <button type="button" onClick={useMyLocation} className="btn-secondary !py-1.5 !px-3 text-sm" disabled={locating}>
          {locating ? "Finding you…" : "📍 Use my location"}
        </button>
      </div>
    </div>
  );
}
