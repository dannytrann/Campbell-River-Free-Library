"use client";

import { useEffect, useState } from "react";
import { downscale, MAX_PHOTO_BYTES } from "@/lib/downscale";

type Props = {
  name?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  /** Told whether a usable photo is currently selected. */
  onReady?: (ready: boolean) => void;
};

export function PhotoField({ name = "photo", label = "Photo", hint, required, onReady }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [tooBig, setTooBig] = useState(false);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  return (
    <div>
      <label className="block cursor-pointer">
        <span className="label">{label}</span>
        <div className="grid min-h-40 place-items-center overflow-hidden rounded-xl border-[2.5px] border-dashed border-ink bg-paper">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-80 w-full object-contain" />
          ) : (
            <span className="p-6 text-center font-bold">Tap to choose or take a photo 📷</span>
          )}
        </div>
        <input
          type="file"
          name={name}
          accept="image/*"
          required={required}
          className="sr-only"
          onChange={async (e) => {
            const input = e.currentTarget;
            const original = input.files?.[0];
            if (!original) {
              setPreview(null);
              onReady?.(false);
              return;
            }
            const f = await downscale(original);
            if (f !== original) {
              const dt = new DataTransfer();
              dt.items.add(f);
              input.files = dt.files;
            }
            const big = f.size > MAX_PHOTO_BYTES;
            setTooBig(big);
            setPreview(URL.createObjectURL(f));
            onReady?.(!big);
          }}
        />
      </label>
      {hint && !preview && <p className="mt-1 text-sm opacity-80">{hint}</p>}
      {tooBig && <p className="mt-1 text-sm text-red-700">That photo is over 8 MB — try a smaller one.</p>}
    </div>
  );
}
