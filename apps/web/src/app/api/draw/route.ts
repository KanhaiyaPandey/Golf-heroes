import { NextRequest } from "next/server";
import { db } from "@golf-heroes/database";
import { requireAuth, requireActiveSubscription } from "@/lib/auth/session";
import { createDrawEntry } from "@/lib/draw/engine";
import { ok, serverError } from "@/lib/api-response";
import { getCurrentDrawPeriod, calculatePrizePool } from "@golf-heroes/shared";

export async function GET() {
  try {
    const { month, year } = getCurrentDrawPeriod();

    const draw = await db.draw.findUnique({
      where: { month_year: { month, year } },
      include: {
        entries: { select: { id: true } },
      },
    });

    const subscriberCount = await db.subscription.count({
      where: { status: "ACTIVE" },
    });

    const pool = calculatePrizePool(subscriberCount);

    return ok({
      draw,
      pool,
      subscriberCount,
      currentPeriod: { month, year },
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    await requireActiveSubscription(session.userId);

    const { month, year } = getCurrentDrawPeriod();

    // Find or create draw for this month
    let draw = await db.draw.findUnique({
      where: { month_year: { month, year } },
    });

    if (!draw) {
      draw = await db.draw.create({
        data: { month, year, status: "PENDING", drawnNumbers: [] },
      });
    }

    await createDrawEntry(draw.id, session.userId);

    return ok({ message: "Successfully entered draw", drawId: draw.id });
  } catch (err) {
    return serverError(err);
  }
}
