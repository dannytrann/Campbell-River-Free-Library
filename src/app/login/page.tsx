import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="card space-y-5 p-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Sign in</h1>
          <p>Save your tour, earn badges, and share photos. No password — just a magic link.</p>
        </div>
        {error && <p className="rounded-lg bg-red-100 p-2 text-sm">That sign-in link was invalid or expired. Try again.</p>}
        <LoginForm next={typeof next === "string" ? next : "/profile"} />
      </div>
    </div>
  );
}
