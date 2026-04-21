"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Charity, CharityEvent } from "@golf-heroes/database";

interface CharitiesClientProps {
  charities: (Charity & { events: CharityEvent[] })[];
  isLoggedIn: boolean;
}

export function CharitiesClient({ charities, isLoggedIn }: CharitiesClientProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selecting, setSelecting] = useState<string | null>(null);

  const filtered = charities.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.description.toLowerCase().includes(q.toLowerCase())
  );

  async function handleSelect(charityId: string) {
    if (!isLoggedIn) { router.push("/login"); return; }
    setSelecting(charityId);
    try {
      const res = await fetch("/api/charity/selection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId, customPercentage: 10 }),
      });
      if (!res.ok) { toast.error("Failed to select charity"); return; }
      toast.success("Charity selected! 🎉");
      router.push("/dashboard");
    } catch { toast.error("Something went wrong"); }
    finally { setSelecting(null); }
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search charities…"
            className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-800 pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((charity) => (
          <div key={charity.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-700">
            {/* Image */}
            <div className="relative h-44 bg-zinc-800 overflow-hidden">
              {charity.imageUrl ? (
                <Image src={charity.imageUrl} alt={charity.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl">🏌️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
              {charity.isFeatured && (
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
                    ⭐ Featured
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="mb-2 font-semibold text-white">{charity.name}</h3>
              <p className="mb-4 flex-1 text-sm text-zinc-500 leading-relaxed line-clamp-3">
                {charity.description}
              </p>

              {/* Events */}
              {charity.events.length > 0 && (
                <div className="mb-4 space-y-2">
                  {charity.events.map((ev) => (
                    <div key={ev.id} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2.5">
                      <p className="text-xs font-medium text-zinc-300">{ev.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        📅 {new Date(ev.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        {ev.location && ` · ${ev.location}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleSelect(charity.id)} disabled={selecting === charity.id}
                  className="flex-1 h-9 rounded-xl bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50">
                  {selecting === charity.id ? "Selecting…" : isLoggedIn ? "Select this charity" : "Sign in to select"}
                </button>
                {charity.websiteUrl && (
                  <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 rounded-2xl border border-dashed border-zinc-700 py-16 text-center">
            <div className="mb-2 text-3xl">🔍</div>
            <p className="text-zinc-500">No charities found for &ldquo;{q}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
