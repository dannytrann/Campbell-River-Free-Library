import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { moderateLibrary, moderatePhoto } from "@/app/actions";
import { getCurrentUser, getProfile, withSignedUrls } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Library, Photo, PhotoWithUrl } from "@/lib/types";

export const metadata: Metadata = { title: "Moderate", robots: { index: false } };

export default async function ModeratePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/moderate");
  const profile = await getProfile(user.id);
  if (!profile?.is_admin) notFound();

  const supabase = await createClient();
  const [{ data: libs }, { data: pendingPhotos }] = await Promise.all([
    supabase.from("libraries").select("*").eq("status", "pending").order("created_at"),
    supabase.from("photos").select("*, libraries(name)").eq("status", "pending").order("created_at"),
  ]);
  const libraries = (libs ?? []) as Library[];
  const photos = (await withSignedUrls((pendingPhotos ?? []) as Photo[])) as (PhotoWithUrl & {
    libraries: { name: string } | null;
  })[];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8">
      <h1 className="font-display text-4xl font-extrabold">Moderation queue</h1>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">Library submissions ({libraries.length})</h2>
        {libraries.length === 0 && <p>Nothing waiting. 🎉</p>}
        {libraries.map((l) => (
          <div key={l.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-display text-xl font-extrabold">{l.name}</p>
              <p className="text-sm opacity-80">
                {l.neighborhood ?? "No neighbourhood"} ·{" "}
                <a
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`}
                >
                  {l.lat.toFixed(5)}, {l.lng.toFixed(5)}
                </a>
              </p>
              {l.description && <p className="mt-1 text-sm">{l.description}</p>}
            </div>
            <Decision action={moderateLibrary} id={l.id} />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">Photos ({photos.length})</h2>
        {photos.length === 0 && <p>Nothing waiting. 🎉</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              {p.signedUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.signedUrl} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
              )}
              <div className="space-y-2 p-3">
                <Link href={`/library/${p.library_id}`} className="font-bold underline">
                  {p.libraries?.name ?? "Library"}
                </Link>
                {p.caption && <p className="text-sm">{p.caption}</p>}
                <Decision action={moderatePhoto} id={p.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Decision({ action, id }: { action: (fd: FormData) => Promise<void>; id: string }) {
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <button name="status" value="approved" className="btn !bg-leaf !py-1.5 !px-4 text-white">
        Approve
      </button>
      <button name="status" value="rejected" className="btn-secondary !py-1.5 !px-4">
        Reject
      </button>
    </form>
  );
}
