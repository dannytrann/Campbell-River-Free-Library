"use client";

export type MapView = "cartoon" | "satellite";

/** Google map type for each view; "hybrid" = satellite imagery with street labels. */
export const MAP_TYPE_ID: Record<MapView, string> = { cartoon: "roadmap", satellite: "hybrid" };

export function MapTypeToggle({ value, onChange }: { value: MapView; onChange: (v: MapView) => void }) {
  const options: { v: MapView; label: string }[] = [
    { v: "cartoon", label: "📖 Storybook" },
    { v: "satellite", label: "🛰️ Satellite" },
  ];
  return (
    <div role="radiogroup" aria-label="Map view" className="inline-flex overflow-hidden rounded-full border-[2.5px] border-ink bg-white text-sm font-bold">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`px-3 py-1 ${value === o.v ? "bg-sun" : "hover:bg-paper"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
