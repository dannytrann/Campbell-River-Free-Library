import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import { verifyReviewToken } from "@/lib/review-token";
import { markerDataUri } from "@/lib/markers";
import { decideFromEmail } from "./actions";
import type { Library, Photo } from "@/lib/types";

export const metadata: Metadata = { title: "Review submission", robots: { index: false } };

export default async function ReviewPage({ searchParams }: PageProps<"/review">) {
  const { token, done } = await searchParams;
  const claim = typeof token === "string" ? verifyReviewToken(token) : null;

  if (typeof done === "string") {
    return (
      <Shell>
        <p className="text-5xl" aria-hidden>{done === "approved" ? "✅" : "🗑️"}</p>
        <h1 className="font-display text-3xl font-extrabold">
          {done === "approved" ? "Approved — it's live!" : "Rejected"}
        </h1>
        <p>{done === "approved" ? "It's on the map now." : "It won't appear on the site."}</p>
        <Link href="/admin/moderate" className="btn-secondary">See the full queue</Link>
      </Shell>
    );
  }

  if (!claim) {
    return (
      <Shell>
        <p className="text-5xl" aria-hidden>🔗</p>
        <h1 className="font-display text-3xl font-extrabold">This link has expired</h1>
        <p>Review links last 14 days. Sign in and use the moderation queue instead.</p>
        <Link href="/admin/moderate" className="btn-primary">Open the queue</Link>
      </Shell>
    );
  }

  const supabase = createAdminClient();

  if (claim.kind === "library") {
    const { data } = await supabase.from("libraries").select("*").eq("id", claim.id).maybeSingle();
    const library = data as Library | null;
    if (!library) return <Gone />;
    if (library.status !== "pending") return <AlreadyDone status={library.status} />;

    return (
      <Shell>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markerDataUri(library.icon)} alt="" width={70} height={80} />
        <h1 className="font-display text-3xl font-extrabold leading-tight">{library.name}</h1>
        {library.neighborhood && <p className="font-bold">📍 {library.neighborhood}</p>}
        {library.description && <p className="whitespace-pre-line">{library.description}</p>}
        <a
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${library.lat},${library.lng}`}
        >
          {library.lat.toFixed(5)}, {library.lng.toFixed(5)} — check on Google Maps
        </a>
        <Buttons token={String(token)} />
      </Shell>
    );
  }

  const { data } = await supabase.from("photos").select("*, libraries(name)").eq("id", claim.id).maybeSingle();
  const photo = data as (Photo & { libraries: { name: string } | null }) | null;
  if (!photo) return <Gone />;
  if (photo.status !== "pending") return <AlreadyDone status={photo.status} />;

  const { data: signed } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(photo.image_url, 60 * 60);

  return (
    <Shell>
      <h1 className="font-display text-3xl font-extrabold">Photo for {photo.libraries?.name ?? "a library"}</h1>
      {signed?.signedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={signed.signedUrl} alt="" className="w-full rounded-xl border-[2.5px] border-ink" />
      )}
      {photo.caption && <p>“{photo.caption}”</p>}
      <Buttons token={String(token)} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="card flex flex-col items-center gap-3 p-6 text-center">{children}</div>
    </div>
  );
}

function Gone() {
  return (
    <Shell>
      <p className="text-5xl" aria-hidden>🤷</p>
      <h1 className="font-display text-3xl font-extrabold">Not found</h1>
      <p>It may have been deleted already.</p>
    </Shell>
  );
}

function AlreadyDone({ status }: { status: string }) {
  return (
    <Shell>
      <p className="text-5xl" aria-hidden>👍</p>
      <h1 className="font-display text-3xl font-extrabold">Already {status}</h1>
      <p>Someone has handled this one.</p>
      <Link href="/admin/moderate" className="btn-secondary">See the full queue</Link>
    </Shell>
  );
}

function Buttons({ token }: { token: string }) {
  return (
    <form action={decideFromEmail} className="flex w-full justify-center gap-3 pt-2">
      <input type="hidden" name="token" value={token} />
      <button name="status" value="approved" className="btn !bg-leaf px-6 text-white">
        Approve
      </button>
      <button name="status" value="rejected" className="btn-secondary px-6">
        Reject
      </button>
    </form>
  );
}
