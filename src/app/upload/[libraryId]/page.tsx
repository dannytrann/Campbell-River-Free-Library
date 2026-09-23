import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getCurrentUser, getLibrary } from "@/lib/data";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "Upload a photo" };

export default async function UploadPage({ params }: PageProps<"/upload/[libraryId]">) {
  const { libraryId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(libraryId)) notFound();

  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next={`/upload/${libraryId}`} message="Sign in to share a photo of this library." />;

  const library = await getLibrary(libraryId);
  if (!library) notFound();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-8">
      <Link href={`/library/${library.id}`} className="text-sm font-bold underline">
        ← {library.name}
      </Link>
      <div>
        <h1 className="font-display text-3xl font-extrabold">Share a photo</h1>
        <p>Your photo goes live right away. Please keep people&apos;s faces and house numbers out of frame — a moderator can remove anything that slips through.</p>
      </div>
      <UploadForm libraryId={library.id} />
    </div>
  );
}
