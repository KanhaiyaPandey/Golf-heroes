"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { formatCurrency, formatDrawPeriod, getCurrentDrawPeriod } from "@golf-heroes/shared";

interface Draw {
  id: string; month: number; year: number; status: string;
  drawnNumbers: number[]; totalPoolCents: number; jackpotRollover: number;
  _count: { entries: number; winnerRecords: number };
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [drawType, setDrawType] = useState<"RANDOM" | "ALGORITHMIC">("RANDOM");
  const { month, year } = getCurrentDrawPeriod();

  const load = useCallback(async () => {
    const res = await fetch("/api/draws");
    const d = await res.json();
    if (d.success) setDraws(d.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function runAction(action: "simulate" | "publish") {
    setRunning(true);
    try {
      const res = await fetch("/api/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, drawType, month, year }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Failed"); return; }
      toast.success(`${action === "simulate" ? "Simulation" : "Draw"} complete! Numbers: ${d.data.numbers?.join(", ")}`);
      void load();
    } catch { toast.error("Something went wrong"); }
    finally { setRunning(false); }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Draw Management</h1>
        <p className="mt-1 text-zinc-400">Configure, simulate, and publish monthly prize draws</p>
      </div>

      {/* Run draw panel */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="mb-4 font-semibold text-white">Run Draw — {formatDrawPeriod(month, year)}</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Draw Type</label>
            <select value={drawType} onChange={(e) => setDrawType(e.target.value as "RANDOM" | "ALGORITHMIC")}
              className="h-9 rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-amber-500 focus:outline-none">
              <option value="RANDOM">Random</option>
              <option value="ALGORITHMIC">Algorithmic (weighted)</option>
            </select>
          </div>
          <button onClick={() => runAction("simulate")} disabled={running}
            className="h-9 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 text-sm font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-colors">
            {running ? "Running…" : "🔍 Simulate"}
          </button>
          <button onClick={() => runAction("publish")} disabled={running}
            className="h-9 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">
            {running ? "Publishing…" : "🚀 Publish Draw"}
          </button>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Simulate first to preview drawn numbers without publishing results. Publishing is irreversible.
        </p>
      </div>

      {/* Draw history */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="mb-4 font-semibold text-white">Draw History</h2>
        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Period","Status","Numbers","Pool","Entries","Winners"].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {draws.map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 font-medium text-white">{formatDrawPeriod(d.month, d.year)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-400" :
                        d.status === "SIMULATION" ? "bg-blue-500/15 text-blue-400" :
                        "bg-zinc-700 text-zinc-400"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-xs text-zinc-300">
                      {d.drawnNumbers.length > 0 ? d.drawnNumbers.join(" · ") : "—"}
                    </td>
                    <td className="py-3 text-zinc-300">
                      {d.totalPoolCents ? formatCurrency(d.totalPoolCents) : "—"}
                    </td>
                    <td className="py-3 text-zinc-300">{d._count.entries}</td>
                    <td className="py-3 text-zinc-300">{d._count.winnerRecords}</td>
                  </tr>
                ))}
                {draws.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-zinc-500">No draws yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
