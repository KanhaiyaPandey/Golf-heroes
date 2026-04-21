"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { formatCurrency, formatDrawPeriod } from "@golf-heroes/shared";

interface Winner {
  id: string; matchType: string; prizeAmountCents: number;
  verificationStatus: string; paymentStatus: string;
  proofUrl: string | null; adminNote: string | null; createdAt: string;
  user: { id: string; name: string; email: string };
  draw: { month: number; year: number };
}

const verifyColors: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  APPROVED: "bg-emerald-500/15 text-emerald-400",
  REJECTED: "bg-red-500/15 text-red-400",
};
const payColors: Record<string, string> = {
  PENDING: "bg-zinc-700 text-zinc-400",
  PAID: "bg-emerald-500/15 text-emerald-400",
  FAILED: "bg-red-500/15 text-red-400",
};
const matchLabels: Record<string, string> = {
  FIVE_MATCH: "5 Match 🏆", FOUR_MATCH: "4 Match 🥈", THREE_MATCH: "3 Match 🥉",
};

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/winners");
    const d = await res.json();
    if (d.success) setWinners(d.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function action(winnerId: string, act: "approve" | "reject" | "mark_paid") {
    setActing(winnerId);
    try {
      const res = await fetch("/api/winners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, action: act }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Failed"); return; }
      toast.success("Updated!");
      void load();
    } catch { toast.error("Something went wrong"); }
    finally { setActing(null); }
  }

  const pending = winners.filter((w) => w.verificationStatus === "PENDING");
  const approved = winners.filter((w) => w.verificationStatus === "APPROVED");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Winners</h1>
        <p className="mt-1 text-zinc-400">{winners.length} total records · {pending.length} pending verification</p>
      </div>

      {/* Pending first */}
      {pending.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="mb-3 text-sm font-medium text-amber-400">⏳ {pending.length} winner(s) awaiting verification</p>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-zinc-500">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800">
              <tr>
                {["Winner","Draw","Match","Prize","Verification","Payment","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {winners.map((w) => (
                <tr key={w.id} className="hover:bg-zinc-800/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{w.user.name}</div>
                    <div className="text-xs text-zinc-500">{w.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{formatDrawPeriod(w.draw.month, w.draw.year)}</td>
                  <td className="px-4 py-3 text-xs text-zinc-300">{matchLabels[w.matchType]}</td>
                  <td className="px-4 py-3 font-semibold text-white">{formatCurrency(w.prizeAmountCents)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${verifyColors[w.verificationStatus] ?? ""}`}>
                      {w.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${payColors[w.paymentStatus] ?? ""}`}>
                      {w.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {w.verificationStatus === "PENDING" && (
                        <>
                          <button onClick={() => action(w.id, "approve")} disabled={acting === w.id}
                            className="h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 text-xs text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40">
                            Approve
                          </button>
                          <button onClick={() => action(w.id, "reject")} disabled={acting === w.id}
                            className="h-7 rounded-lg bg-red-500/10 border border-red-500/20 px-2 text-xs text-red-400 hover:bg-red-500/20 disabled:opacity-40">
                            Reject
                          </button>
                        </>
                      )}
                      {w.verificationStatus === "APPROVED" && w.paymentStatus === "PENDING" && (
                        <button onClick={() => action(w.id, "mark_paid")} disabled={acting === w.id}
                          className="h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 text-xs text-blue-400 hover:bg-blue-500/20 disabled:opacity-40">
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-zinc-500">No winners yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
