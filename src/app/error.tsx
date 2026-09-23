"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="card space-y-4 p-6 text-center">
        <p className="text-5xl" aria-hidden>📕</p>
        <h1 className="font-display text-3xl font-extrabold">That page fell off the shelf</h1>
        <p>Something went wrong on our side. Give it another try — it&apos;s usually temporary.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/map" className="btn-secondary">Back to the map</Link>
        </div>
        {error.digest && <p className="text-xs opacity-60">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}
