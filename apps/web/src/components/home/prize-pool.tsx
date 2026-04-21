import { formatCurrency } from "@golf-heroes/shared";

interface PrizePoolProps {
  pool: { total: number; fiveMatch: number; fourMatch: number; threeMatch: number };
  subscriberCount: number;
}

export function PrizePool({ pool, subscriberCount }: PrizePoolProps) {
  const tiers = [
    {
      match: "5 Numbers",
      prize: formatCurrency(pool.fiveMatch),
      label: "Jackpot",
      share: "40%",
      color: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/30",
      badge: "bg-amber-500/15 text-amber-400",
      icon: "🏆",
      rollover: true,
    },
    {
      match: "4 Numbers",
      prize: formatCurrency(pool.fourMatch),
      label: "Major Prize",
      share: "35%",
      color: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500/15 text-emerald-400",
      icon: "🥈",
      rollover: false,
    },
    {
      match: "3 Numbers",
      prize: formatCurrency(pool.threeMatch),
      label: "Minor Prize",
      share: "25%",
      color: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/30",
      badge: "bg-blue-500/15 text-blue-400",
      icon: "🥉",
      rollover: false,
    },
  ];

  return (
    <section className="bg-zinc-950 py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            This month&apos;s draw
          </p>
          <h2 className="font-display text-4xl text-white sm:text-5xl">
            Prize pool breakdown
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Based on{" "}
            <span className="text-white font-medium">{subscriberCount.toLocaleString()} active subscribers</span>.
            Prizes split equally among winners in each tier.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.match}
              className={`relative overflow-hidden rounded-2xl border ${tier.border} bg-gradient-to-b ${tier.color} p-6`}
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="text-3xl">{tier.icon}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tier.badge}`}>
                  {tier.share} of pool
                </span>
              </div>

              <div className="mb-1 font-display text-3xl text-white">{tier.prize}</div>
              <div className="mb-3 text-sm font-medium text-white">{tier.label}</div>
              <div className="text-xs text-zinc-500">
                Match <span className="font-semibold text-zinc-300">{tier.match}</span> to win
              </div>
              {tier.rollover && (
                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                  🔄 Jackpot rolls over if unclaimed
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
          <p className="text-sm text-zinc-400">
            Total pool this month:{" "}
            <span className="text-xl font-display text-white ml-2">{formatCurrency(pool.total)}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
