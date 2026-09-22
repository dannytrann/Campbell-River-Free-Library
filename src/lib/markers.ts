// Cute marker illustrations. Each is a self-contained SVG so it can be used
// as a Google Maps marker icon (data URI) and as an <img> in the UI.
//
// A library's `icon` is either a preset key ("book", "orca", …) or a custom
// house design encoded as "house:" + six digits (see HouseDesign below).

export type MarkerIcon = { key: string; label: string; body: string; color: string };

const outline = "#3b2a1a";
const line = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

function heartPath(cx: number, cy: number, s: number) {
  // Heart roughly 2s wide, centred on (cx, cy).
  const p = (x: number, y: number) => `${(cx + x * s).toFixed(2)} ${(cy + y * s).toFixed(2)}`;
  return `M${p(0, 1)} C${p(-1.1, 0.35)} ${p(-1.3, -0.35)} ${p(-0.95, -0.75)} C${p(-0.65, -1.1)} ${p(-0.15, -0.95)} ${p(0, -0.55)} C${p(0.15, -0.95)} ${p(0.65, -1.1)} ${p(0.95, -0.75)} C${p(1.3, -0.35)} ${p(1.1, 0.35)} ${p(0, 1)} Z`;
}

export const MARKER_ICONS: MarkerIcon[] = [
  {
    key: "book",
    label: "Classic book",
    color: "#f28c6b",
    body: `<rect x="14" y="12" width="28" height="22" rx="3" fill="#fff8ec" ${line}/>
      <path d="M28 12v22" ${line}/>
      <path d="M18 18h6M18 23h6M32 18h6M32 23h6" stroke="${outline}" stroke-width="2" stroke-linecap="round"/>`,
  },
  {
    key: "house",
    label: "Tiny house",
    color: "#7cc5a8",
    body: `<path d="M14 24 28 11l14 13z" fill="#e8584f" ${line}/>
      <rect x="17" y="22" width="22" height="14" rx="2" fill="#fff8ec" ${line}/>
      <rect x="21" y="25" width="14" height="8" rx="1" fill="#9fd3f5" stroke="${outline}" stroke-width="2"/>`,
  },
  {
    key: "owl",
    label: "Bookish owl",
    color: "#b89adf",
    body: `<ellipse cx="28" cy="24" rx="12" ry="12" fill="#c9905c" ${line}/>
      <circle cx="23" cy="21" r="4" fill="#fff"/><circle cx="33" cy="21" r="4" fill="#fff"/>
      <circle cx="23" cy="21" r="1.8" fill="${outline}"/><circle cx="33" cy="21" r="1.8" fill="${outline}"/>
      <path d="m26 26 2 3 2-3z" fill="#f5b83d" stroke="${outline}" stroke-width="1.2"/>`,
  },
  {
    key: "tree",
    label: "Forest nook",
    color: "#f2c14e",
    body: `<path d="M28 9 16 27h24z" fill="#4f9d69" ${line}/>
      <rect x="25" y="27" width="6" height="8" fill="#8b5a3c" stroke="${outline}" stroke-width="2"/>`,
  },
  {
    key: "fish",
    label: "Salmon",
    color: "#6fb1e6",
    body: `<path d="M13 23c5-7 18-8 25 0-7 8-20 7-25 0z" fill="#f0826a" ${line}/>
      <path d="m38 23 6-5v10z" fill="#f0826a" ${line}/>
      <circle cx="19" cy="22" r="1.8" fill="${outline}"/>`,
  },
  {
    key: "orca",
    label: "Orca",
    color: "#9ed8e6",
    body: `<path d="M26 17 29 8l3 9z" fill="#2d2a32" ${line}/>
      <path d="M14 25C18 16 35 14 44 23c-5 8-21 10-30 2z" fill="#2d2a32" ${line}/>
      <path d="m14 25-5-5 1 6-2 6z" fill="#2d2a32" ${line}/>
      <path d="M19 27c6 3 15 2 20-2-6 1-14 2-20 2z" fill="#fff"/>
      <ellipse cx="36" cy="20.5" rx="3" ry="1.5" fill="#fff"/>`,
  },
  {
    key: "cat",
    label: "Library cat",
    color: "#f5a3c7",
    body: `<path d="m18 21 1-11 7 6zM38 21l-1-11-7 6z" fill="#f2a65a" ${line}/>
      <circle cx="28" cy="25" r="11" fill="#f2a65a" ${line}/>
      <circle cx="24" cy="24" r="1.8" fill="${outline}"/><circle cx="32" cy="24" r="1.8" fill="${outline}"/>
      <path d="M27 28h2l-1 1.5z" fill="#e8584f" stroke="${outline}" stroke-width="1"/>
      <path d="M17 27h6M17 30l6-1M39 27h-6M39 30l-6-1" stroke="${outline}" stroke-width="1.2" stroke-linecap="round"/>`,
  },
  {
    key: "mushroom",
    label: "Mushroom",
    color: "#c6e3a1",
    body: `<rect x="23" y="24" width="10" height="12" rx="3" fill="#fff8ec" ${line}/>
      <path d="M13 26a15 14 0 0 1 30 0z" fill="#e8584f" ${line}/>
      <circle cx="21" cy="20" r="2.5" fill="#fff"/><circle cx="30" cy="16" r="2" fill="#fff"/><circle cx="35" cy="22" r="2" fill="#fff"/>`,
  },
  {
    key: "mountain",
    label: "Mountain",
    color: "#c6e3a1",
    body: `<path d="M11 35 24 13l7 11 4-6 10 17z" fill="#7a8fa6" ${line}/>
      <path d="m20 20 4-7 4 7-2-1.5-2 2.5-2-2.5z" fill="#fff"/>`,
  },
  {
    key: "boat",
    label: "Sailboat",
    color: "#9ed8e6",
    body: `<path d="M29 10v17" stroke="${outline}" stroke-width="2.5"/>
      <path d="M30 11v14h11z" fill="#fff" ${line}/>
      <path d="M27 12v12l-9 0z" fill="#f2c14e" ${line}/>
      <path d="M13 27h30l-5 8H18z" fill="#e8584f" ${line}/>`,
  },
  {
    key: "flower",
    label: "Flower",
    color: "#fff1a8",
    body: `<path d="M28 28v9" stroke="#4f9d69" stroke-width="3" stroke-linecap="round"/>
      ${[0, 72, 144, 216, 288]
        .map((a) => {
          const r = (a - 90) * (Math.PI / 180);
          return `<circle cx="${(28 + 6 * Math.cos(r)).toFixed(2)}" cy="${(21 + 6 * Math.sin(r)).toFixed(2)}" r="5" fill="#f5a3c7" stroke="${outline}" stroke-width="2"/>`;
        })
        .join("")}
      <circle cx="28" cy="21" r="4" fill="#f2c14e" stroke="${outline}" stroke-width="2"/>`,
  },
  {
    key: "heart",
    label: "Heart",
    color: "#f5a3c7",
    body: `<path d="${heartPath(28, 24, 11)}" fill="#e8584f" ${line}/>`,
  },
  {
    key: "star",
    label: "Star",
    color: "#8e9be0",
    body: `<polygon points="${starPoints(28, 23, 12, 5.2)}" fill="#f2c14e" ${line}/>`,
  },
];

// ───────────────────────── custom house builder ─────────────────────────

export const PALETTE = [
  { name: "Coral", hex: "#f28c6b" },
  { name: "Red", hex: "#e8584f" },
  { name: "Sunshine", hex: "#f2c14e" },
  { name: "Forest", hex: "#4f9d69" },
  { name: "Mint", hex: "#7cc5a8" },
  { name: "Sky", hex: "#6fb1e6" },
  { name: "Lilac", hex: "#b89adf" },
  { name: "Pink", hex: "#f5a3c7" },
  { name: "Cream", hex: "#fff8ec" },
  { name: "Wood", hex: "#8b5a3c" },
];
export const ROOF_SHAPES = ["Pointy", "Round", "Flat", "Cottage"];
export const WINDOWS = ["Books", "Heart", "Porthole", "Plain"];
export const TOPPERS = ["None", "Flag", "Heart", "Star"];

export type HouseDesign = { pin: number; roof: number; wall: number; shape: number; window: number; topper: number };

const FIELDS: [keyof HouseDesign, number][] = [
  ["pin", PALETTE.length],
  ["roof", PALETTE.length],
  ["wall", PALETTE.length],
  ["shape", ROOF_SHAPES.length],
  ["window", WINDOWS.length],
  ["topper", TOPPERS.length],
];

export const DEFAULT_HOUSE: HouseDesign = { pin: 4, roof: 1, wall: 8, shape: 0, window: 0, topper: 1 };

export function encodeHouse(d: HouseDesign): string {
  return "house:" + FIELDS.map(([k]) => d[k]).join("");
}

export function decodeHouse(key: string): HouseDesign | null {
  const m = /^house:(\d{6})$/.exec(key);
  if (!m) return null;
  const digits = m[1].split("").map(Number);
  if (digits.some((d, i) => d >= FIELDS[i][1])) return null;
  return Object.fromEntries(FIELDS.map(([k], i) => [k, digits[i]])) as HouseDesign;
}

export function randomHouse(): HouseDesign {
  return Object.fromEntries(FIELDS.map(([k, n]) => [k, Math.floor(Math.random() * n)])) as HouseDesign;
}

function houseBody(d: HouseDesign): string {
  const roof = PALETTE[d.roof].hex;
  const wall = PALETTE[d.wall].hex;
  const glass = "#cfeaf7";

  const roofs = [
    { top: 11, svg: `<path d="M13 25 28 11l15 14z" fill="${roof}" ${line}/>` },
    { top: 12, svg: `<path d="M14 25a14 13 0 0 1 28 0z" fill="${roof}" ${line}/>` },
    { top: 17, svg: `<rect x="13" y="17" width="30" height="7" rx="2" fill="${roof}" ${line}/>` },
    {
      top: 11,
      svg: `<rect x="34" y="11" width="5" height="10" fill="#8b5a3c" stroke="${outline}" stroke-width="2"/>
        <path d="M13 25 28 11l15 14z" fill="${roof}" ${line}/>`,
    },
  ];
  const { top, svg: roofSvg } = roofs[d.shape];

  const pane = `<rect x="20" y="25.5" width="16" height="9" rx="1" fill="${glass}" stroke="${outline}" stroke-width="2"/>`;
  const windows = [
    `${pane}<rect x="22" y="27" width="2.5" height="6.5" fill="#e8584f"/><rect x="25.5" y="28" width="2.5" height="5.5" fill="#f2c14e"/>
     <rect x="29" y="27" width="2.5" height="6.5" fill="#4f9d69"/><rect x="32.5" y="28.5" width="2" height="5" fill="#6fb1e6"/>`,
    `${pane}<path d="${heartPath(28, 30, 3.6)}" fill="#e8584f"/>`,
    `<circle cx="28" cy="30" r="5" fill="${glass}" stroke="${outline}" stroke-width="2"/><path d="M28 25v10M23 30h10" stroke="${outline}" stroke-width="1.2"/>`,
    `${pane}<path d="M28 25.5v9" stroke="${outline}" stroke-width="1.5"/>`,
  ];

  const toppers = [
    "",
    `<path d="M28 ${top}v-8" stroke="${outline}" stroke-width="2"/><path d="M28 ${top - 8}l7 2.5-7 2.5z" fill="#e8584f" stroke="${outline}" stroke-width="1.5" stroke-linejoin="round"/>`,
    `<path d="${heartPath(28, top - 3.5, 3.5)}" fill="#e8584f" stroke="${outline}" stroke-width="1.5"/>`,
    `<polygon points="${starPoints(28, top - 3.5, 4.5, 2)}" fill="#f2c14e" stroke="${outline}" stroke-width="1.5" stroke-linejoin="round"/>`,
  ];

  return `<rect x="17" y="23" width="22" height="14" rx="2" fill="${wall}" ${line}/>
    ${roofSvg}${windows[d.window]}${toppers[d.topper]}`;
}

// ───────────────────────── rendering ─────────────────────────

export function isValidIcon(key: string): boolean {
  return MARKER_ICONS.some((i) => i.key === key) || decodeHouse(key) !== null;
}

export function markerSvg(key: string, visited = false): string {
  const house = decodeHouse(key);
  const preset = MARKER_ICONS.find((i) => i.key === key) ?? MARKER_ICONS[0];
  const body = house ? houseBody(house) : preset.body;
  const color = house ? PALETTE[house.pin].hex : preset.color;
  const fill = visited ? "#9aa5a0" : color;
  const check = visited
    ? `<circle cx="45" cy="11" r="8" fill="#4f9d69" stroke="${outline}" stroke-width="2"/><path d="m41 11 3 3 5-6" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="64" viewBox="0 0 56 64">
    <path d="M28 62C28 62 6 42 6 24a22 22 0 0 1 44 0c0 18-22 38-22 38z" fill="${fill}" stroke="${outline}" stroke-width="3"/>
    ${body}${check}</svg>`;
}

export function markerDataUri(key: string, visited = false): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg(key, visited))}`;
}
