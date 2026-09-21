"use client";

import { useActionState } from "react";
import { sendMagicLink } from "@/app/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(sendMagicLink, null);

  if (state?.ok) {
    return (
      <div className="rounded-xl border-[2.5px] border-ink bg-sky/40 p-4 text-center">
        <p className="text-3xl" aria-hidden>📬</p>
        <p className="font-bold">Check your inbox!</p>
        <p className="text-sm">Click the link we sent to finish signing in.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="label" htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
      {state && !state.ok && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a magic link ✨"}
      </button>
    </form>
  );
}
