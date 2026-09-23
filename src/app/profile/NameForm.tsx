"use client";

import { useActionState, useState } from "react";
import { updateDisplayName } from "@/app/actions";

export function NameForm({ current, startOpen = false }: { current: string; startOpen?: boolean }) {
  const [editing, setEditing] = useState(startOpen);
  const [state, action, pending] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = await updateDisplayName(prev, fd);
    if (res.ok) setEditing(false);
    return res;
  }, null);

  if (!editing) {
    if (!current) {
      return (
        <button onClick={() => setEditing(true)} className="text-sm font-bold underline">
          Pick a display name
        </button>
      );
    }
    return (
      <button onClick={() => setEditing(true)} className="text-sm underline">
        Change display name
      </button>
    );
  }

  return (
    <form action={action} className="mt-2 flex flex-wrap gap-2">
      <input
        name="display_name"
        defaultValue={current}
        maxLength={40}
        className="input !w-48 !py-1"
        aria-label="Display name"
        placeholder="Shown on the leaderboard"
      />
      <button className="btn-primary !py-1 !px-3" disabled={pending}>Save</button>
      {current && (
        <button type="button" className="text-sm underline" onClick={() => setEditing(false)}>Cancel</button>
      )}
      {state && !state.ok && <p className="w-full text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
