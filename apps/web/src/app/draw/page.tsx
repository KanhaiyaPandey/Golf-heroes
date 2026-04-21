import { db } from "@golf-heroes/database";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatCurrency, calculatePrizePool, formatDrawPeriod, getCurrentDrawPeriod } from "@golf-heroes/shared";
import Link from "next/link";

export const metadata = { title: "Monthly Draw" };
export const dynamic = "force-dynamic";

export default async function DrawPage() {
  const session = await getSession();
  const { month, year } = getCurrentDrawPeriod();

  const [currentDraw, pastDraws, subscriberCount] = await Promise.all([
    db.draw.findUnique({
      where: { month_year: { month, year } },
      include: { _count: { select: { entries: true } } },
    }),
    db.draw.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 6,
      include: {
        _count: { select: { entries: true, winnerRecords: true } },
        winnerRecords: {
          take: 3,
          include: { user: { select: { name: true } } },
          orderBy: { prizeAmountCents: "desc" },
        },
      },
    }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  const pool = calculatePrizePool(subscriberCount);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar session={session} />

      <div className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">Monthly competition</p>
          <h1 className="font-display text-4xl text-white sm:text-5xl">Prize Draw</h1>
          <p className="mt-4 text-zinc-400">
            Monthly draws based on your Stableford scores. Match 3, 4, or 5 numbers to win.
          </p>
        </div>

        {/* Current draw */}
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                {formatDrawPeriod(month, year)}
              </p>
              <h2 className="font-display text-3xl text-white">
                {currentDraw?.status === "PUBLISHED" ? "Draw Complete" : "Draw Open"}
              </h2>
              <p className="mt-1 text-zinc-400">
                {currentDraw?._count.entries ?? 0} players entered · {subscriberCount} active subscribers
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="font-display text-4xl text-gradient-gold text-yellow-400">{formatCurrency(pool.fiveMatch)}</div>
              <div className="text-sm text-zinc-400">Jackpot prize</div>
              <div className="mt-1 text-xs text-zinc-500">Total pool: {formatCurrency(pool.total)}</div>
            </div>
          </div>

          {currentDraw?.status === "PUBLISHED" && currentDraw.drawnNumbers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-amber-500/20">
              <p className="mb-3 text-sm font-medium text-zinc-300">Drawn numbers</p>
              <div className="flex gap-3">
                {currentDraw.drawnNumbers.map((n) => (
                  <div key={n} className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 font-mono text-lg font-bold text-white">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!session && (
            <div className="mt-6 flex gap-3">
              <Link href="/subscribe"
                className="inline-flex h-10 items-center rounded-xl bg-amber-500 px-6 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
                Subscribe to enter
              </Link>
              <Link href="/login"
                className="inline-flex h-10 items-center rounded-xl border border-zinc-700 px-6 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Sign in
              </Link>
            </div>
          )}
          {session && (
            <div className="mt-6">
              <Link href="/dashboard"
                className="inline-flex h-10 items-center rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
                Go to dashboard to enter draw →
              </Link>
            </div>
          )}
        </div>

        {/* Prize tiers */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "5 numbers", pool: pool.fiveMatch, share: "40%", icon: "🏆", rollover: true },
            { label: "4 numbers", pool: pool.fourMatch, share: "35%", icon: "🥈", rollover: false },
            { label: "3 numbers", pool: pool.threeMatch, share: "25%", icon: "🥉", rollover: false },
          ].map(({ label, pool: p, share, icon, rollover }) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
              <div className="mb-2 text-2xl">{icon}</div>
              <div className="font-display text-xl text-white">{formatCurrency(p)}</div>
              <div className="text-xs text-zinc-400 mt-1">{label}</div>
              <div className="text-xs text-zinc-600 mt-0.5">{share} of pool{rollover ? " · rolls over" : ""}</div>
            </div>
          ))}
        </div>

        {/* Past draws */}
        {pastDraws.length > 0 && (
          <div>
            <h2 className="mb-4 font-semibold text-white">Past Draws</h2>
            <div className="space-y-3">
              {pastDraws.map((d) => (
                <div key={d.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{formatDrawPeriod(d.month, d.year)}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {d._count.entries} entries · {d._count.winnerRecords} winners
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {d.drawnNumbers.map((n) => (
                        <div key={n} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 font-mono text-xs font-bold text-zinc-300">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                  {d.winnerRecords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1.5">Winners</p>
                      <div className="flex flex-wrap gap-2">
                        {d.winnerRecords.map((w) => (
                          <span key={w.id} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                            {w.user.name} — {formatCurrency(w.prizeAmountCents)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
