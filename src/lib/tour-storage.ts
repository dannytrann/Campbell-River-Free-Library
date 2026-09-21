// Anonymous visit tracking. Synced to the account (and cleared) after sign-in.
const KEY = "crll:visited";

export function parseVisits(raw: string | null): string[] {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function readLocalVisits(): string[] {
  try {
    return parseVisits(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export function addLocalVisit(libraryId: string): string[] {
  const next = Array.from(new Set([...readLocalVisits(), libraryId]));
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event("crll:visits-changed"));
  return next;
}

export function clearLocalVisits() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event("crll:visits-changed"));
}

// React binding: re-renders when visits change in this tab or another.
export function subscribeLocalVisits(cb: () => void) {
  window.addEventListener("crll:visits-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("crll:visits-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

/** Raw snapshot string (stable identity for useSyncExternalStore). */
export function localVisitsSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
