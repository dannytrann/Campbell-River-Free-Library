// Cute marker illustrations. Each is a self-contained SVG so it can be used
// as a Google Maps marker icon (data URI) and as an <img> in the UI.

export type MarkerIcon = { key: string; label: string; body: string; color: string };

const outline = "#3b2a1a";

export const MARKER_ICONS: MarkerIcon[] = [
  {
    key: "book",
    label: "Classic book",
    color: "#f28c6b",
    body: `<rect x="14" y="12" width="28" height="22" rx="3" fill="#fff8ec" stroke="${outline}" stroke-width="2.5"/>
      <path d="M28 12v22" stroke="${outline}" stroke-width="2.5"/>
      <path d="M18 18h6M18 23h6M32 18h6M32 23h6" stroke="${outline}" stroke-width="2" stroke-linecap="round"/>`,
  },
  {
    key: "house",
    label: "Tiny house",
    color: "#7cc5a8",
    body: `<path d="M14 24 28 11l14 13" fill="#e8584f" stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="17" y="22" width="22" height="14" rx="2" fill="#fff8ec" stroke="${outline}" stroke-width="2.5"/>
      <rect x="21" y="25" width="14" height="8" rx="1" fill="#9fd3f5" stroke="${outline}" stroke-width="2"/>`,
  },
  {
    key: "owl",
    label: "Bookish owl",
    color: "#b89adf",
    body: `<ellipse cx="28" cy="24" rx="12" ry="12" fill="#c9905c" stroke="${outline}" stroke-width="2.5"/>
      <circle cx="23" cy="21" r="4" fill="#fff"/><circle cx="33" cy="21" r="4" fill="#fff"/>
      <circle cx="23" cy="21" r="1.8" fill="${outline}"/><circle cx="33" cy="21" r="1.8" fill="${outline}"/>
      <path d="m26 26 2 3 2-3z" fill="#f5b83d" stroke="${outline}" stroke-width="1.2"/>`,
  },
  {
    key: "tree",
    label: "Forest nook",
    color: "#f2c14e",
    body: `<path d="M28 9 16 27h24z" fill="#4f9d69" stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="25" y="27" width="6" height="8" fill="#8b5a3c" stroke="${outline}" stroke-width="2"/>`,
  },
  {
    key: "fish",
    label: "Salmon (it's Campbell River!)",
    color: "#6fb1e6",
    body: `<path d="M13 23c5-7 18-8 25 0-7 8-20 7-25 0z" fill="#f0826a" stroke="${outline}" stroke-width="2.5"/>
      <path d="m38 23 6-5v10z" fill="#f0826a" stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="19" cy="22" r="1.8" fill="${outline}"/>`,
  },
];

export function markerSvg(key: string, visited = false): string {
  const icon = MARKER_ICONS.find((i) => i.key === key) ?? MARKER_ICONS[0];
  const fill = visited ? "#9aa5a0" : icon.color;
  const check = visited
    ? `<circle cx="45" cy="11" r="8" fill="#4f9d69" stroke="${outline}" stroke-width="2"/><path d="m41 11 3 3 5-6" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="64" viewBox="0 0 56 64">
    <path d="M28 62C28 62 6 42 6 24a22 22 0 0 1 44 0c0 18-22 38-22 38z" fill="${fill}" stroke="${outline}" stroke-width="3"/>
    ${icon.body}${check}</svg>`;
}

export function markerDataUri(key: string, visited = false): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg(key, visited))}`;
}
