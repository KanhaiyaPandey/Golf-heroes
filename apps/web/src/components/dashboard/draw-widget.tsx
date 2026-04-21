"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Draw, DrawEntry, GolfScore } from "@golf-heroes/database";
import { formatCurrency, formatDrawPeriod, countMatches } from "@golf-heroes/shared";

interface DrawWidgetProps {
  pool: { total: number; fiveMatch: number; fourMatch: number; threeMatch: number };
  currentDraw: (Draw & { entries: DrawEntry[] }) | null;
  isEntered: boolean;
  scores: GolfScore[];
  drawPeriod: { month: number; year: number };
}

export function DrawWidget({ pool, currentDraw, isEntered, scores, drawPeriod }: DrawWidgetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnterDraw() {
    if (scores.length === 0) {
      toast.error("You need at least one score to enter the draw");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/draw", { method: "POST" });
      const data = await res.json();
      if (res.status === 402) {
        toast.error("You need an active subscription to enter the draw");
        return;
      }
      if (!res.ok) { toast.error(data.error ?? "Failed to enter draw"); return; }
      toast.success("🎉 You're in the draw!");
      router.refresh();
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }

  const userNumbers = scores.map((s) => s.score);
  const isPublished = currentDraw?.status === "PUBLISHED" || currentDraw?.status === "COMPLETED";
  const drawnNumbers = currentDraw?.drawnNumbers ?? [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Monthly Draw</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {formatDrawPeriod(drawPeriod.month, drawPeriod.year)}
          </p>
        </div>
        {isEntered && (
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
            ✓ Entered
          </span>
        )}
      </div>

      {/* Pool summary */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          { label: "Jackpot", value: formatCurrency(pool.fiveMatch), color: "text-amber-400" },
          { label: "4 match", value: formatCurrency(pool.fourMatch), color: "text-emerald-400" },
          { label: "3 match", value: formatCurrency(pool.threeMatch), color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-3 text-center">
            <div className={`text-sm font-semibold ${color}`}>{value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Published draw results */}
      {isPublished && drawnNumbers.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-zinc-400">Drawn numbers</p>
          <div className="flex gap-2 flex-wrap">
            {drawnNumbers.map((n) => {
              const isMatch = userNumbers.includes(n);
              return (
                <div
                  key={n}
                  className={`draw-ball ${isMatch ? "draw-ball-match" : "draw-ball-no-match"}`}
                >
                  {n}
                </div>
              );
            })}
          </div>
          {isEntered && drawnNumbers.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              You matched{" "}
              <span className="font-semibold text-white">{countMatches(userNumbers, drawnNumbers)}</span>{" "}
              numbers
            </p>
          )}
        </div>
      )}

      {/* Your numbers */}
      {scores.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-zinc-400">Your draw numbers (latest 5 scores)</p>
          <div className="flex gap-2 flex-wrap">
            {userNumbers.map((n, i) => (
              <div
                key={i}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 font-mono text-sm font-bold text-white"
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {!isEntered && !isPublished && (
        <button
          onClick={handleEnterDraw}
          disabled={loading || scores.length === 0}
          className="w-full h-10 rounded-xl bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          {loading ? "Entering…" : "Enter this month's draw"}
        </button>
      )}

      {scores.length === 0 && (
        <p className="text-xs text-amber-400 text-center">
          Add at least 1 score to enter the draw
        </p>
      )}
    </div>
  );
}
