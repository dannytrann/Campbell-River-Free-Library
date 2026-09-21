import type { Metadata } from "next";
import { LibraryMap } from "@/components/LibraryMap";
import { getApprovedLibraries, getCoverPhotos, getCurrentUser, getVisitedIds } from "@/lib/data";

export const metadata: Metadata = { title: "Map" };

export default async function MapPage({ searchParams }: PageProps<"/map">) {
  const { library } = await searchParams;
  const user = await getCurrentUser();
  const [libraries, covers, visitedIds] = await Promise.all([
    getApprovedLibraries(),
    getCoverPhotos(),
    user ? getVisitedIds(user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full">
      <LibraryMap
        libraries={libraries}
        covers={covers}
        visitedIds={visitedIds}
        signedIn={!!user}
        initialSelectedId={typeof library === "string" ? library : undefined}
      />
    </div>
  );
}
