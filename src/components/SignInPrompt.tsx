import Link from "next/link";

export function SignInPrompt({ next, message }: { next: string; message: string }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="card space-y-4 p-6 text-center">
        <p className="text-4xl" aria-hidden>🔑</p>
        <p className="text-lg">{message}</p>
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn-primary">
          Sign in with email
        </Link>
        <p className="text-sm opacity-80">No password needed — we&apos;ll email you a magic link.</p>
      </div>
    </div>
  );
}
