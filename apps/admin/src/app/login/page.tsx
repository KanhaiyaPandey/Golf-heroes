"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Login failed"); return; }
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500">
            <span className="text-xl font-bold text-white">⚙</span>
          </div>
          <h1 className="font-display text-3xl text-white">Admin Panel</h1>
          <p className="mt-1 text-sm text-zinc-400">Golf Heroes Administration</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                placeholder="admin@golfheroes.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in to Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
