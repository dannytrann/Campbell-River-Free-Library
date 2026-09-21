import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Leaderboard" };

type Row = { user_id: string; display_name: string | null; visit_count: number; photo_count: number; badge_count: number };

const medals = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_leaderboard", { max_rows: 25 });
  const rows = ((data ?? []) as Row[]).filter((r) => r.visit_count > 0 || r.photo_count > 0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Leaderboard</h1>
        <p>Campbell River&apos;s most dedicated little-library explorers.</p>
      </div>

      {rows.length === 0 ? (
        <p className="card p-6 text-center">No explorers yet — be the first on the board!</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-[2.5px] border-ink bg-sun/50 text-sm">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Explorer</th>
                <th className="px-3 py-2 text-right">📍 Visits</th>
                <th className="px-3 py-2 text-right">📸 Photos</th>
                <th className="px-3 py-2 text-right">🏅 Badges</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.user_id} className="border-b border-ink/10 last:border-0">
                  <td className="px-3 py-2 font-bold">{medals[i] ?? i + 1}</td>
                  <td className="px-3 py-2 font-bold">{r.display_name ?? "Anonymous reader"}</td>
                  <td className="px-3 py-2 text-right">{r.visit_count}</td>
                  <td className="px-3 py-2 text-right">{r.photo_count}</td>
                  <td className="px-3 py-2 text-right">{r.badge_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
