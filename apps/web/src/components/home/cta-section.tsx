import Link from "next/link";

export function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="bg-zinc-950 py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-900 p-12 text-center">
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
          </div>

          <div className="relative">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl">
              ⛳
            </div>
            <h2 className="mb-4 font-display text-4xl text-white sm:text-5xl">
              Ready to become a{" "}
              <span className="italic text-emerald-400">Golf Hero?</span>
            </h2>
            <p className="mb-8 text-zinc-400 max-w-lg mx-auto">
              Join hundreds of golfers tracking scores, supporting charities, and winning monthly prizes.
              Your game. Your cause. Your moment.
            </p>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex h-14 items-center gap-3 rounded-2xl bg-emerald-500 px-8 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all hover:-translate-y-0.5"
              >
                Go to dashboard
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/subscribe"
                  className="inline-flex h-14 items-center gap-3 rounded-2xl bg-emerald-500 px-8 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all hover:-translate-y-0.5"
                >
                  Subscribe — from £14.99/mo
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center rounded-2xl border border-zinc-700 px-8 text-base font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}

            <p className="mt-6 text-xs text-zinc-600">
              Cancel anytime · Secure payments via Stripe · 10% minimum to charity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
