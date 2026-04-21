import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/session";
import { ok, serverError } from "@/lib/api-response";
import { calculatePrizePool } from "@golf-heroes/shared";

export async function GET() {
  try {
    await requireAdmin();
    const [totalUsers, activeSubscribers, monthlySubscribers, yearlySubscribers,
      totalWinners, paidWinners, pendingWinners, totalCharities, draws] = await Promise.all([
      db.user.count(),
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.subscription.count({ where: { status: "ACTIVE", plan: "MONTHLY" } }),
      db.subscription.count({ where: { status: "ACTIVE", plan: "YEARLY" } }),
      db.winnerRecord.count(),
      db.winnerRecord.count({ where: { paymentStatus: "PAID" } }),
      db.winnerRecord.count({ where: { verificationStatus: "PENDING" } }),
      db.charity.count({ where: { isActive: true } }),
      db.draw.findMany({
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 6,
        include: { _count: { select: { entries: true, winnerRecords: true } } },
      }),
    ]);
    const pool = calculatePrizePool(activeSubscribers);
    const totalPaidOut = await db.winnerRecord.aggregate({
      _sum: { prizeAmountCents: true },
      where: { paymentStatus: "PAID" },
    });
    return ok({
      totalUsers, activeSubscribers, monthlySubscribers, yearlySubscribers,
      totalWinners, paidWinners, pendingWinners, totalCharities,
      currentPool: pool,
      totalPaidOutCents: totalPaidOut._sum.prizeAmountCents ?? 0,
      recentDraws: draws,
    });
  } catch (err) { return serverError(err); }
}
