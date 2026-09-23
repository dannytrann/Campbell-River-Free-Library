import { markerDataUri } from "@/lib/markers";
import type { Library } from "@/lib/types";

/**
 * A stylised plot of where the libraries actually are — real coordinates,
 * no streets — used as the home page teaser. Drawing it ourselves keeps the
 * landing page free of Google Maps loads (and quota), and it can never go
 * stale, since it renders from the same rows as the live map.
 */
export function PinScatter({ libraries }: { libraries: Library[] }) {
  if (libraries.length === 0) {
    return <div className="grid h-full place-items-center bg-[#f6ecd9] font-bold">Map coming soon 🗺️</div>;
  }

  const lats = libraries.map((l) => l.lat);
  const lngs = libraries.map((l) => l.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const pad = 0.06;
  const spanLat = (maxLat - minLat) * (1 + pad * 2) || 0.02;
  const spanLng = (maxLng - minLng) * (1 + pad * 2) || 0.02;

  const W = 400;
  const H = 300;
  const x = (lng: number) => ((lng - (minLng - spanLng * pad)) / spanLng) * W;
  const y = (lat: number) => H - ((lat - (minLat - spanLat * pad)) / spanLat) * H;

  // Draw southern pins last so they overlap naturally, like a map.
  const ordered = [...libraries].sort((a, b) => b.lat - a.lat);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e9f0cf]">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Where ${libraries.length} little libraries sit around Campbell River`}>
        {/* the strait, roughly east of the pins */}
        <path d={`M${W * 0.62} 0 Q${W * 0.74} ${H * 0.3} ${W * 0.68} ${H * 0.55} Q${W * 0.62} ${H * 0.8} ${W * 0.78} ${H} L${W} ${H} L${W} 0 Z`} fill="#9ed8e6" />
        <path d={`M${W * 0.62} 0 Q${W * 0.74} ${H * 0.3} ${W * 0.68} ${H * 0.55} Q${W * 0.62} ${H * 0.8} ${W * 0.78} ${H}`} fill="none" stroke="#7fc4d4" strokeWidth="3" />
        {/* a couple of soft park blobs for texture */}
        <ellipse cx={W * 0.18} cy={H * 0.28} rx={W * 0.16} ry={H * 0.12} fill="#b9dfa4" opacity="0.8" />
        <ellipse cx={W * 0.3} cy={H * 0.75} rx={W * 0.18} ry={H * 0.14} fill="#b9dfa4" opacity="0.8" />

        {ordered.map((l) => (
          <image
            key={l.id}
            href={markerDataUri(l.icon)}
            x={x(l.lng) - 9}
            y={y(l.lat) - 20}
            width={18}
            height={20}
          />
        ))}
      </svg>
    </div>
  );
}
