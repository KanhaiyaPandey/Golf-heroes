"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  websiteUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  _count: { charitySelections: number; events: number };
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    websiteUrl: "",
    isFeatured: false,
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/charities");
    const d = await res.json();
    if (d.success) setCharities(d.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/charities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? "Failed");
        return;
      }
      toast.success("Charity created!");
      setShowForm(false);
      setForm({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        websiteUrl: "",
        isFeatured: false,
      });
      void load();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/charities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    void load();
  }

  async function toggleFeatured(id: string, isFeatured: boolean) {
    await fetch(`/api/charities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    void load();
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Charities</h1>
          <p className="mt-1 text-zinc-400">
            {charities.length} charities registered
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-9 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          + Add Charity
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <h2 className="mb-4 font-semibold text-white">New Charity</h2>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {[
              { name: "name", label: "Name", required: true },
              { name: "slug", label: "Slug (URL-safe)", required: true },
              { name: "imageUrl", label: "Image URL", required: false },
              { name: "websiteUrl", label: "Website URL", required: false },
            ].map(({ name, label, required }) => (
              <div key={name}>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  {label}
                </label>
                <input
                  required={required}
                  value={
                    (form as Record<string, string | boolean>)[name] as string
                  }
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
              />
              <label htmlFor="featured" className="text-sm text-zinc-300">
                Featured on homepage
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="h-9 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Create Charity"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 rounded-xl border border-zinc-700 px-4 text-sm text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-zinc-500">
            Loading…
          </div>
        ) : (
          charities.map((c) => (
            <div
              key={c.id}
              className={`rounded-2xl border bg-zinc-900/60 overflow-hidden ${c.isActive ? "border-zinc-800" : "border-zinc-800 opacity-60"}`}
            >
              <div className="relative h-36 bg-zinc-800">
                {c.imageUrl ? (
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">
                    🏌️
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {c.isFeatured && (
                    <span className="rounded-full bg-amber-500/80 px-2 py-0.5 text-xs font-medium text-white">
                      Featured
                    </span>
                  )}
                  {!c.isActive && (
                    <span className="rounded-full bg-red-500/80 px-2 py-0.5 text-xs font-medium text-white">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white">{c.name}</h3>
                <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                  {c.description}
                </p>
                <div className="mt-2 flex gap-3 text-xs text-zinc-500">
                  <span>👥 {c._count.charitySelections} subscribers</span>
                  <span>📅 {c._count.events} events</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => toggleFeatured(c.id, c.isFeatured)}
                    className="h-7 rounded-lg border border-zinc-700 px-2 text-xs text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
                  >
                    {c.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    onClick={() => toggleActive(c.id, c.isActive)}
                    className={`h-7 rounded-lg border px-2 text-xs transition-colors ${c.isActive ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"}`}
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
