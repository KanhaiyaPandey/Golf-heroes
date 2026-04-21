import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/api-response";
import { calculatePrizePool } from "@golf-heroes/shared";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      activeSubscribers,
      totalCharityDonations,
      recentDraws,
      totalWinners,
    ] = await Promise.all([
      db.user.count(),
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.donation.aggregate({ _sum: { amountCents: true } }),
      db.draw.findMany({
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 6,
        include: { _count: { select: { entries: true, winnerRecords: true } } },
      }),
      db.winnerRecord.count(),
    ]);

    const pool = calculatePrizePool(activeSubscribers);

    return ok({
      totalUsers,
      activeSubscribers,
      totalCharityDonationsCents: totalCharityDonations._sum.amountCents ?? 0,
      currentMonthPool: pool,
      recentDraws,
      totalWinners,
    });
  } catch (err) {
    return serverError(err);
  }
}
