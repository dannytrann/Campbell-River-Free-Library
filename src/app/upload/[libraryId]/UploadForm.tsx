"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { uploadPhoto } from "@/app/actions";
import { PhotoField } from "@/components/PhotoField";

export function UploadForm({ libraryId }: { libraryId: string }) {
  const [state, action, pending] = useActionState(uploadPhoto, null);
  const [ready, setReady] = useState(false);

  if (state?.ok) {
    return (
      <div className="card space-y-3 p-6 text-center">
        <p className="text-4xl" aria-hidden>📸</p>
        <p className="font-display text-2xl font-extrabold">Photo added!</p>
        <p>It&apos;s live on the library&apos;s page now. Five photos earns you the Photographer badge.</p>
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
      <PhotoField required onReady={setReady} />

      <div>
        <label className="label" htmlFor="caption">Caption (optional)</label>
        <input id="caption" name="caption" maxLength={300} className="input" placeholder="Freshly restocked with picture books!" />
      </div>

      {state && !state.ok && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending || !ready}>
        {pending ? "Uploading…" : "Upload photo"}
      </button>
    </form>
  );
}
