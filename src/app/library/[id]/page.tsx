import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VisitButton } from "@/components/VisitButton";
import { PhotoGallery } from "@/components/PhotoGallery";
import { getApprovedPhotos, getCurrentUser, getLibrary, getVisitedIds } from "@/lib/data";
import { markerDataUri } from "@/lib/markers";

export async function generateMetadata({ params }: PageProps<"/library/[id]">): Promise<Metadata> {
  const { id } = await params;
  const library = await getLibrary(id).catch(() => null);
  return { title: library?.name ?? "Library" };
}

export default async function LibraryPage({ params }: PageProps<"/library/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [library, user] = await Promise.all([getLibrary(id), getCurrentUser()]);
  if (!library) notFound();

  const [photos, visitedIds] = await Promise.all([
    getApprovedPhotos(id),
    user ? getVisitedIds(user.id) : Promise.resolve([]),
  ]);

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${library.lat},${library.lng}`;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
      <Link href={`/map?library=${library.id}`} className="text-sm font-bold underline">
        ← Back to map
      </Link>

      {library.status !== "approved" && (
        <p className="card bg-sun/60 p-3 text-sm font-bold">
          This library is {library.status} review — only you and moderators can see it right now.
        </p>
      )}

      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markerDataUri(library.icon)} alt="" width={84} height={96} className="shrink-0" />
        <div className="flex-1 space-y-3">
          <h1 className="font-display text-4xl font-extrabold leading-tight">{library.name}</h1>
          {library.neighborhood && <p className="font-bold opacity-80">📍 {library.neighborhood}</p>}
          {library.description && <p className="whitespace-pre-line text-lg">{library.description}</p>}
          <div className="flex flex-wrap items-start gap-3 pt-2">
            <VisitButton libraryId={library.id} signedIn={!!user} initiallyVisited={visitedIds.includes(library.id)} />
            <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              🧭 Directions
            </a>
            <Link href={`/upload/${library.id}`} className="btn-secondary">
              📸 Add a photo
            </Link>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">Photos</h2>
        {photos.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="mb-3">No photos yet. Be the first to share one!</p>
            <Link href={`/upload/${library.id}`} className="btn-primary">
              Upload a photo
            </Link>
          </div>
        ) : (
          <PhotoGallery photos={photos} />
        )}
      </section>
    </div>
  );
}
