import type { Metadata } from "next";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getCurrentUser } from "@/lib/data";
import { SubmitForm } from "./SubmitForm";

export const metadata: Metadata = { title: "Add a library" };

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/submit" message="Sign in to add a little library to the map." />;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Add a little library</h1>
        <p>Know one that isn&apos;t on the map? Tell us about it — a moderator will review it before it goes live.</p>
      </div>
      <SubmitForm />
    </div>
  );
}
