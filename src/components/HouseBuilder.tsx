"use client";

import {
  encodeHouse,
  markerDataUri,
  PALETTE,
  randomHouse,
  ROOF_SHAPES,
  TOPPERS,
  WINDOWS,
  type HouseDesign,
} from "@/lib/markers";

type Props = { value: HouseDesign; onChange: (d: HouseDesign) => void };

export function HouseBuilder({ value, onChange }: Props) {
  const set = (patch: Partial<HouseDesign>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-4 rounded-xl border-[2.5px] border-dashed border-ink bg-paper p-4 sm:flex-row">
      <div className="flex flex-col items-center gap-2 sm:w-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markerDataUri(encodeHouse(value))} alt="Your house icon" width={112} height={128} />
        <button type="button" className="btn-secondary !py-1 !px-3 text-sm" onClick={() => onChange(randomHouse())}>
          🎲 Surprise me
        </button>
      </div>

      <div className="flex-1 space-y-3">
        <Swatches label="Pin" value={value.pin} onChange={(pin) => set({ pin })} />
        <Swatches label="Roof" value={value.roof} onChange={(roof) => set({ roof })} />
        <Swatches label="Walls" value={value.wall} onChange={(wall) => set({ wall })} />
        <Chips label="Roof shape" options={ROOF_SHAPES} value={value.shape} onChange={(shape) => set({ shape })} />
        <Chips label="Window" options={WINDOWS} value={value.window} onChange={(window) => set({ window })} />
        <Chips label="On top" options={TOPPERS} value={value.topper} onChange={(topper) => set({ topper })} />
      </div>
    </div>
  );
}

function Swatches({ label, value, onChange }: { label: string; value: number; onChange: (i: number) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="w-24 text-sm font-bold">{label}</span>
      {PALETTE.map((c, i) => (
        <button
          key={c.hex}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={c.name}
          title={c.name}
          onClick={() => onChange(i)}
          className={`size-7 rounded-full border-2 border-ink transition ${value === i ? "scale-110 ring-4 ring-ink/30" : ""}`}
          style={{ background: c.hex }}
        />
      ))}
    </div>
  );
}

function Chips({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="w-24 text-sm font-bold">{label}</span>
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === i}
          onClick={() => onChange(i)}
          className={`rounded-full border-2 border-ink px-3 py-0.5 text-sm font-bold ${value === i ? "bg-sun" : "bg-white"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
