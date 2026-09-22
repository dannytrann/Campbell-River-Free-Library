"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitLibrary } from "@/app/actions";
import { LocationPicker } from "@/components/LocationPicker";
import { HouseBuilder } from "@/components/HouseBuilder";
import { DEFAULT_HOUSE, encodeHouse, MARKER_ICONS, markerDataUri } from "@/lib/markers";

export function SubmitForm() {
  const [state, action, pending] = useActionState(submitLibrary, null);
  const [preset, setPreset] = useState("book");
  const [custom, setCustom] = useState(false);
  const [house, setHouse] = useState(DEFAULT_HOUSE);
  const icon = custom ? encodeHouse(house) : preset;
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

      <fieldset className="space-y-3">
        <legend className="label">Pick a map icon</legend>
        <input type="hidden" name="icon" value={icon} />
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
          {MARKER_ICONS.map((m) => (
            <IconChoice key={m.key} icon={m.key} label={m.label} selected={!custom && preset === m.key} onSelect={() => {
              setPreset(m.key);
              setCustom(false);
            }} />
          ))}
          <IconChoice icon={encodeHouse(house)} label="✏️ Design your own" selected={custom} onSelect={() => setCustom(true)} />
        </div>
        {custom && <HouseBuilder value={house} onChange={setHouse} />}
      </fieldset>

      {state && !state.ok && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full sm:w-auto" disabled={pending || !pos}>
        {pending ? "Submitting…" : pos ? "Submit for review" : "Drop a pin first"}
      </button>
    </form>
  );
}

function IconChoice({ icon, label, selected, onSelect }: { icon: string; label: string; selected: boolean; onSelect: () => void }) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center rounded-xl border-[2.5px] p-1.5 text-xs font-bold ${
        selected ? "border-ink bg-sun/50" : "border-transparent hover:bg-paper"
      }`}
    >
      <input type="radio" name="icon-choice" checked={selected} onChange={onSelect} className="sr-only" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={markerDataUri(icon)} alt="" width={40} height={46} />
      <span className="text-center leading-tight">{label}</span>
    </label>
  );
}
