"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { GolfScore } from "@golf-heroes/database";

interface ScoreManagerProps {
  scores: GolfScore[];
}

export function ScoreManager({ scores }: ScoreManagerProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newScore, setNewScore] = useState({ score: "", playedAt: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState({ score: "", playedAt: "" });
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newScore.score || !newScore.playedAt) return;
    const scoreNum = parseInt(newScore.score);
    if (scoreNum < 1 || scoreNum > 45) {
      toast.error("Score must be between 1 and 45");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scoreNum, playedAt: newScore.playedAt }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to add score"); return; }
      toast.success("Score added!");
      setNewScore({ score: "", playedAt: "" });
      setAdding(false);
      router.refresh();
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this score?")) return;
    try {
      const res = await fetch(`/api/scores/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete score"); return; }
      toast.success("Score deleted");
      router.refresh();
    } catch { toast.error("Something went wrong"); }
  }

  async function handleEdit(id: string) {
    if (!editScore.score) return;
    const scoreNum = parseInt(editScore.score);
    setLoading(true);
    try {
      const res = await fetch(`/api/scores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scoreNum }),
      });
      if (!res.ok) { toast.error("Failed to update score"); return; }
      toast.success("Score updated!");
      setEditingId(null);
      router.refresh();
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Golf Scores</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {scores.length}/5 scores stored · Stableford format (1–45)
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add score
          </button>
        )}
      </div>

      {/* Add score form */}
      {adding && (
        <form onSubmit={handleAdd} className="mb-4 flex gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
          <input
            type="number"
            min={1}
            max={45}
            required
            value={newScore.score}
            onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
            placeholder="Score (1–45)"
            className="h-9 w-32 rounded-lg border border-zinc-600 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="date"
            required
            value={newScore.playedAt}
            onChange={(e) => setNewScore({ ...newScore, playedAt: e.target.value })}
            max={new Date().toISOString().split("T")[0]}
            className="h-9 flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-9 rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="h-9 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Scores list */}
      <div className="space-y-2">
        {scores.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
            <div className="mb-2 text-3xl">⛳</div>
            <p className="text-sm text-zinc-500">No scores yet. Add your first Stableford score above.</p>
          </div>
        ) : (
          scores.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3"
            >
              {editingId === s.id ? (
                <div className="flex flex-1 items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={editScore.score}
                    onChange={(e) => setEditScore({ ...editScore, score: e.target.value })}
                    className="h-8 w-24 rounded-lg border border-zinc-600 bg-zinc-800 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleEdit(s.id)}
                    className="h-8 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="h-8 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-700 font-mono text-sm font-bold text-white">
                      {s.score}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {s.score} pts{" "}
                        {i === 0 && (
                          <span className="ml-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-400">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(s.playedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(s.id); setEditScore({ score: String(s.score), playedAt: "" }); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
