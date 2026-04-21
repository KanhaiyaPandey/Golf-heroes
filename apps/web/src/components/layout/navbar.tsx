"use client";

import Link from "next/link";
import { useState } from "react";
import type { SessionPayload } from "@/lib/auth/session";

interface NavbarProps {
  session: SessionPayload | null;
}

export function Navbar({ session }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 blur-md group-hover:opacity-50 transition-opacity" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <span className="text-xs font-bold text-white">GH</span>
            </div>
          </div>
          <span className="font-display text-lg text-white">
            Golf <span className="text-emerald-400">Heroes</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/charities" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Charities
          </Link>
          <Link href="/draw" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Monthly Draw
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              {session.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Admin
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <button className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/subscribe"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/charities" className="text-sm text-zinc-400" onClick={() => setMenuOpen(false)}>
              Charities
            </Link>
            <Link href="/draw" className="text-sm text-zinc-400" onClick={() => setMenuOpen(false)}>
              Monthly Draw
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm text-zinc-400" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                {session.role === "ADMIN" && (
                  <Link href="/admin" className="text-sm text-amber-400" onClick={() => setMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-zinc-400" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
                <Link
                  href="/subscribe"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
