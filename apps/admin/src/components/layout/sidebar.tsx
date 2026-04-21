"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/draws", label: "Draw Management", icon: "🎲" },
  { href: "/users", label: "Users", icon: "👥" },
  { href: "/charities", label: "Charities", icon: "❤️" },
  { href: "/winners", label: "Winners", icon: "🏆" },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
              <span className="text-xs font-bold text-white">GH</span>
            </div>
            <span className="text-sm font-semibold text-white">Admin</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-amber-500/10 text-amber-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}>
              <span className="text-base shrink-0">{icon}</span>
              {!collapsed && <span className="font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-2 border-t border-zinc-800">
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 shrink-0">
            <span className="text-xs font-bold text-white">{name?.[0]?.toUpperCase()}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{name}</p>
              <p className="text-xs text-zinc-500">Admin</p>
            </div>
          )}
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit"
            className={`w-full rounded-xl px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors text-left ${collapsed ? "text-center" : ""}`}>
            {collapsed ? "↩" : "Sign out"}
          </button>
        </form>
      </div>
    </aside>
  );
}
