"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitLibrary } from "@/app/actions";
import { LocationPicker } from "@/components/LocationPicker";
import { MARKER_ICONS, markerDataUri } from "@/lib/markers";

export function SubmitForm() {
  const [state, action, pending] = useActionState(submitLibrary, null);
  const [icon, setIcon] = useState("book");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

  if (state?.ok) {
    return (
      <div className="card space-y-3 p-6 text-center">
        <p className="text-4xl" aria-hidden>🎉</p>
        <p className="font-display text-2xl font-extrabold">Thanks! Your library is in the review queue.</p>
        <p>It&apos;ll appear on the map once a moderator approves it.</p>
        <div className="flex justify-center gap-3">
          <Link href="/map" className="btn-primary">Back to the map</Link>
          <button className="btn-secondary" onClick={() => window.location.reload()}>Add another</button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5 p-5">
      <div>
        <label className="label" htmlFor="name">Library name</label>
        <input id="name" name="name" required maxLength={120} className="input" placeholder="e.g. The Willow Point Book Nook" />
      </div>

      <div>
        <span className="label">Location</span>
        <LocationPicker icon={icon} onChange={setPos} />
        <input type="hidden" name="lat" value={pos?.lat ?? ""} />
        <input type="hidden" name="lng" value={pos?.lng ?? ""} />
        {pos && (
          <p className="mt-1 text-xs opacity-70">
            {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
          </p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="neighborhood">Neighbourhood (optional)</label>
        <input id="neighborhood" name="neighborhood" className="input" placeholder="e.g. Willow Point, Campbellton, Quinsam Heights" />
      </div>

      <div>
        <label className="label" htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          className="input"
          placeholder="What does it look like? Any themes — kids' books, mysteries, seed swap?"
        />
      </div>

      <fieldset>
        <legend className="label">Pick a map icon</legend>
        <div className="flex flex-wrap gap-2">
          {MARKER_ICONS.map((m) => (
            <label
              key={m.key}
              className={`flex cursor-pointer flex-col items-center rounded-xl border-[2.5px] p-2 text-xs font-bold ${
                icon === m.key ? "border-ink bg-sun/50" : "border-transparent"
              }`}
            >
              <input type="radio" name="icon" value={m.key} checked={icon === m.key} onChange={() => setIcon(m.key)} className="sr-only" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={markerDataUri(m.key)} alt="" width={40} height={46} />
              <span className="max-w-20 text-center leading-tight">{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state && !state.ok && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full sm:w-auto" disabled={pending || !pos}>
        {pending ? "Submitting…" : pos ? "Submit for review" : "Drop a pin first"}
      </button>
    </form>
  );
}
