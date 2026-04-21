import Link from "next/link";
import { formatCurrency } from "@golf-heroes/shared";

interface HeroSectionProps {
  pool: { total: number; fiveMatch: number };
  subscriberCount: number;
}

export function HeroSection({ pool, subscriberCount }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden animated-bg pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Glow orb */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-32 sm:px-6 sm:pt-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">
              {subscriberCount.toLocaleString()} active players this month
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl font-normal leading-tight text-white sm:text-7xl lg:text-8xl">
            Play golf.{" "}
            <span className="italic text-gradient">Give back.</span>
            <br />
            Win big.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Enter your Stableford scores, support a charity you believe in, and compete for monthly
            cash prizes — all in one place.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/subscribe"
              className="group relative inline-flex h-14 items-center gap-3 rounded-2xl bg-emerald-500 px-8 text-base font-semibold text-white shadow-2xl shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:-translate-y-0.5"
            >
              Start playing for {" "}
              <span className="rounded-lg bg-white/20 px-2 py-0.5 text-sm font-bold">£14.99/mo</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex h-14 items-center gap-2 rounded-2xl border border-zinc-700 px-8 text-base font-semibold text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
            >
              How it works
            </Link>
          </div>

          {/* Prize pool spotlight */}
          <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl w-full">
            {[
              {
                label: "This Month's Jackpot",
                value: formatCurrency(pool.fiveMatch),
                color: "text-gradient-gold",
                icon: "🏆",
              },
              {
                label: "Total Prize Pool",
                value: formatCurrency(pool.total),
                color: "text-gradient",
                icon: "💰",
              },
              {
                label: "Charity Impact",
                value: formatCurrency(Math.floor(pool.total * 0.1 * subscriberCount / 100)),
                color: "text-blue-400",
                icon: "❤️",
              },
            ].map(({ label, value, color, icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur"
              >
                <div className="mb-2 text-2xl">{icon}</div>
                <div className={`font-display text-2xl font-normal ${color}`}>{value}</div>
                <div className="mt-1 text-xs text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
