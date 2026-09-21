"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { uploadPhoto } from "@/app/actions";

/** Shrink big phone photos in the browser so uploads stay fast and under the size limit. */
async function downscale(file: File, max = 2400): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 4 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file; // let the server try
  }
}

export function UploadForm({ libraryId }: { libraryId: string }) {
  const [state, action, pending] = useActionState(uploadPhoto, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tooBig, setTooBig] = useState(false);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  if (state?.ok) {
    return (
      <div className="card space-y-3 p-6 text-center">
        <p className="text-4xl" aria-hidden>📸</p>
        <p className="font-display text-2xl font-extrabold">Photo received!</p>
        <p>It&apos;ll show up once a moderator gives it a thumbs up. Approved photos count toward your Photographer badge.</p>
        <div className="flex justify-center gap-3">
          <Link href={`/library/${libraryId}`} className="btn-primary">Back to library</Link>
          <button className="btn-secondary" onClick={() => window.location.reload()}>Upload another</button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-5">
      <input type="hidden" name="library_id" value={libraryId} />
      <label className="block cursor-pointer">
        <span className="label">Photo</span>
        <div className="grid min-h-48 place-items-center overflow-hidden rounded-xl border-[2.5px] border-dashed border-ink bg-paper">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-80 w-full object-contain" />
          ) : (
            <span className="p-6 text-center font-bold">Tap to choose or take a photo 📷</span>
          )}
        </div>
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          className="sr-only"
          onChange={async (e) => {
            const input = e.currentTarget;
            const original = input.files?.[0];
            if (!original) return setPreview(null);
            const f = await downscale(original);
            if (f !== original) {
              const dt = new DataTransfer();
              dt.items.add(f);
              input.files = dt.files;
            }
            setTooBig(f.size > 8 * 1024 * 1024);
            setPreview(URL.createObjectURL(f));
          }}
        />
      </label>
      {tooBig && <p className="text-sm text-red-700">That photo is over 8 MB — try a smaller one.</p>}

      <div>
        <label className="label" htmlFor="caption">Caption (optional)</label>
        <input id="caption" name="caption" maxLength={300} className="input" placeholder="Freshly restocked with picture books!" />
      </div>

      {state && !state.ok && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending || !preview || tooBig}>
        {pending ? "Uploading…" : "Upload photo"}
      </button>
    </form>
  );
}
