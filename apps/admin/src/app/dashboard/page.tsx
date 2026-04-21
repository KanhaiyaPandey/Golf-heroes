import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import { formatCurrency, calculatePrizePool, formatDrawPeriod, getCurrentDrawPeriod } from "@golf-heroes/shared";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalUsers, activeSubscribers, pendingWinners, recentDraws] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.winnerRecord.count({ where: { verificationStatus: "PENDING" } }),
    db.draw.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 5,
      include: { _count: { select: { entries: true, winnerRecords: true } } },
    }),
  ]);
  const totalPaid = await db.winnerRecord.aggregate({
    _sum: { prizeAmountCents: true },
    where: { paymentStatus: "PAID" },
  });
  const pool = calculatePrizePool(activeSubscribers);
  return { totalUsers, activeSubscribers, pendingWinners, recentDraws, pool, totalPaid: totalPaid._sum.prizeAmountCents ?? 0 };
}

export default async function AdminDashboard() {
  const session = await requireAdmin().catch(() => null);
  if (!session) redirect("/login");

  const { totalUsers, activeSubscribers, pendingWinners, recentDraws, pool, totalPaid } = await getStats();
  const safeRecentDraws = Array.isArray(recentDraws) ? recentDraws : [];
  const { month, year } = getCurrentDrawPeriod();

  const statCards = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: "👥", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Active Subscribers", value: activeSubscribers.toLocaleString(), icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Prize Pool (this month)", value: formatCurrency(pool.total), icon: "💰", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Pending Verifications", value: pendingWinners.toLocaleString(), icon: "⏳", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Total Paid Out", value: formatCurrency(totalPaid), icon: "🏦", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Jackpot (this month)", value: formatCurrency(pool.fiveMatch), icon: "🏆", color: "text-gold-400 text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Dashboard</h1>
        <p className="mt-1 text-zinc-400">Overview for {formatDrawPeriod(month, year)}</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-8">
        {statCards.map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5`}>
            <div className="mb-3 text-2xl">{icon}</div>
            <div className={`font-display text-2xl ${color}`}>{value}</div>
            <div className="mt-1 text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent draws */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Draws</h2>
          <a href="/draws" className="text-xs text-zinc-500 hover:text-amber-400 transition-colors">
            Manage draws →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-3 text-left text-xs font-medium text-zinc-500">Period</th>
                <th className="pb-3 text-left text-xs font-medium text-zinc-500">Status</th>
                <th className="pb-3 text-right text-xs font-medium text-zinc-500">Entries</th>
                <th className="pb-3 text-right text-xs font-medium text-zinc-500">Winners</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {safeRecentDraws.map((d) => (
                <tr key={d.id}>
                  <td className="py-3 text-white">{formatDrawPeriod(d.month, d.year)}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-400" :
                      d.status === "SIMULATION" ? "bg-blue-500/15 text-blue-400" :
                      "bg-zinc-700 text-zinc-400"
                    }`}>{d.status}</span>
                  </td>
                  <td className="py-3 text-right text-zinc-300">{d._count.entries}</td>
                  <td className="py-3 text-right text-zinc-300">{d._count.winnerRecords}</td>
                </tr>
              ))}
              {safeRecentDraws.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-500">No draws yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
