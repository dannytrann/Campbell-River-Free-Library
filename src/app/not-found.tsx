import Link from "next/link";
import { markerDataUri } from "@/lib/markers";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="card flex flex-col items-center gap-4 p-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markerDataUri("owl")} alt="" width={70} height={80} />
        <h1 className="font-display text-3xl font-extrabold">Nothing on this shelf</h1>
        <p>This page doesn&apos;t exist — the library may have been removed, or the link is wrong.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/map" className="btn-primary">Back to the map</Link>
          <Link href="/libraries" className="btn-secondary">Browse all libraries</Link>
        </div>
      </div>
    </div>
  );
}
