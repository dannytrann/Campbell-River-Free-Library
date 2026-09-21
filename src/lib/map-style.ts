// Playful, illustrated-look map style: warm paper land, soft teal water,
// simplified roads, and most POI clutter hidden. Tweak at
// https://mapstyle.withgoogle.com or swap in a Snazzy Maps preset.
export const CARTOON_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f6ecd9" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b4636" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fffaf0" }, { weight: 3 }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b38f" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e9f0cf" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", stylers: [{ visibility: "on" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#b9dfa4" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3f7a45" }] },
  { featureType: "poi.school", stylers: [{ visibility: "on" }] },
  { featureType: "poi.school", elementType: "geometry", stylers: [{ color: "#f3d9b1" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e3cfae" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ffd98a" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e8b75c" }] },
  { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "simplified" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#9ed8e6" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2f6f80" }] },
];

export const CAMPBELL_RIVER_CENTER = { lat: 50.0244, lng: -125.2475 };
