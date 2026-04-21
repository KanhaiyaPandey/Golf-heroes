import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@golf-heroes/database";
import { formatCurrency, calculatePrizePool, formatDrawPeriod, getCurrentDrawPeriod } from "@golf-heroes/shared";
import { Navbar } from "@/components/layout/navbar";
import { ScoreManager } from "@/components/dashboard/score-manager";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { CharityWidget } from "@/components/dashboard/charity-widget";
import { DrawWidget } from "@/components/dashboard/draw-widget";
import { WinningsWidget } from "@/components/dashboard/winnings-widget";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, scores, subscription, charitySelection, winnings] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: session.userId } }),
    db.golfScore.findMany({
      where: { userId: session.userId },
      orderBy: { playedAt: "desc" },
      take: 5,
    }),
    db.subscription.findUnique({ where: { userId: session.userId } }),
    db.charitySelection.findUnique({
      where: { userId: session.userId },
      include: { charity: true },
    }),
    db.winnerRecord.findMany({
      where: { userId: session.userId },
      include: { draw: { select: { month: true, year: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const { month, year } = getCurrentDrawPeriod();
  const currentDraw = await db.draw.findUnique({
    where: { month_year: { month, year } },
    include: { entries: { where: { userId: session.userId } } },
  });

  const subscriberCount = await db.subscription.count({ where: { status: "ACTIVE" } });
  const pool = calculatePrizePool(subscriberCount);
  const isEnteredDraw = (currentDraw?.entries.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar session={session} />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-white">
            Welcome back, <span className="text-emerald-400">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="mt-1 text-zinc-400">
            {formatDrawPeriod(month, year)} draw · {subscriberCount.toLocaleString()} players competing
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <ScoreManager scores={scores} />
            <DrawWidget
              pool={pool}
              currentDraw={currentDraw}
              isEntered={isEnteredDraw}
              scores={scores}
              drawPeriod={{ month, year }}
            />
            <WinningsWidget winnings={winnings} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <SubscriptionCard subscription={subscription} />
            <CharityWidget selection={charitySelection} />
          </div>
        </div>
      </div>
    </div>
  );
}
