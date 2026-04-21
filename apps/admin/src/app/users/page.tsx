"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string; name: string; email: string; role: string; createdAt: string;
  subscription: { status: string; plan: string; currentPeriodEnd: string } | null;
  _count: { winnerRecords: number };
  golfScores: { score: number; playedAt: string }[];
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  INACTIVE: "bg-zinc-700 text-zinc-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  LAPSED: "bg-amber-500/15 text-amber-400",
  PAST_DUE: "bg-red-500/15 text-red-400",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/users?page=${page}&q=${encodeURIComponent(q)}`);
    const d = await res.json();
    if (d.success) { setUsers(d.data.users); setTotal(d.data.total); setPages(d.data.pages); }
    setLoading(false);
  }, [page, q]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Users</h1>
        <p className="mt-1 text-zinc-400">{total.toLocaleString()} total users</p>
      </div>

      <div className="mb-4 flex gap-3">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search by name or email…"
          className="h-10 flex-1 max-w-xs rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none" />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-zinc-500">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800">
              <tr>
                {["User","Subscription","Scores","Wins","Joined"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users.map((u) => (
                <>
                  <tr key={u.id} className="hover:bg-zinc-800/30 cursor-pointer" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{u.name}</div>
                      <div className="text-xs text-zinc-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {u.subscription ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[u.subscription.status] ?? ""}`}>
                          {u.subscription.plan} · {u.subscription.status}
                        </span>
                      ) : <span className="text-xs text-zinc-600">None</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{u.golfScores.length}/5</td>
                    <td className="px-4 py-3 text-zinc-300">{u._count.winnerRecords}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                  {expanded === u.id && (
                    <tr key={`${u.id}-expanded`} className="bg-zinc-800/20">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="text-xs text-zinc-400">
                          <strong className="text-zinc-300">Scores: </strong>
                          {u.golfScores.length > 0
                            ? u.golfScores.map((s) => `${s.score}pts (${new Date(s.playedAt).toLocaleDateString("en-GB")})`).join("  ·  ")
                            : "No scores"}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-zinc-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="h-8 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 hover:text-white disabled:opacity-40">← Prev</button>
            <button disabled={page === pages} onClick={() => setPage(page + 1)}
              className="h-8 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 hover:text-white disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
