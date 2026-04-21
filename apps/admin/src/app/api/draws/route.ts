import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/session";
import { ok, serverError } from "@/lib/api-response";
import { calculatePrizePool, getCurrentDrawPeriod } from "@golf-heroes/shared";

// Inline draw engine to avoid cross-app imports
function generateRandomNumbers(): number[] {
  const nums = new Set<number>();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(nums).sort((a, b) => a - b);
}

function countMatches(a: number[], b: number[]): number {
  const set = new Set(b);
  return a.filter((n) => set.has(n)).length;
}

function getMatchType(n: number) {
  if (n >= 5) return "FIVE_MATCH";
  if (n === 4) return "FOUR_MATCH";
  if (n === 3) return "THREE_MATCH";
  return null;
}

export async function GET() {
  try {
    await requireAdmin();
    const draws = await db.draw.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { _count: { select: { entries: true, winnerRecords: true } } },
    });
    return ok(draws);
  } catch (err) { return serverError(err); }
}

const Schema = z.object({
  action: z.enum(["simulate", "publish"]),
  drawType: z.enum(["RANDOM", "ALGORITHMIC"]).default("RANDOM"),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2024).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { action, drawType, month: m, year: y } = Schema.parse(body);
    const { month, year } = m && y ? { month: m, year: y } : getCurrentDrawPeriod();

    let draw = await db.draw.findUnique({ where: { month_year: { month, year } } });
    if (!draw) draw = await db.draw.create({ data: { month, year, drawType, status: "PENDING", drawnNumbers: [] } });

    const numbers = generateRandomNumbers();

    if (action === "simulate") {
      await db.draw.update({ where: { id: draw.id }, data: { drawnNumbers: numbers, status: "SIMULATION", drawType } });
      return ok({ message: "Simulation complete", numbers, drawId: draw.id });
    }

    // Full publish
    const entries = await db.drawEntry.findMany({ where: { drawId: draw.id } });
    const subscriberCount = await db.subscription.count({ where: { status: "ACTIVE" } });
    const pool = calculatePrizePool(subscriberCount);
    const jackpotTotal = pool.fiveMatch + (draw.jackpotRollover ?? 0);

    const winners: { userId: string; matchType: "FIVE_MATCH" | "FOUR_MATCH" | "THREE_MATCH" }[] = [];
    for (const entry of entries) {
      const mc = countMatches(entry.numbers, numbers);
      const mt = getMatchType(mc);
      await db.drawEntry.update({ where: { id: entry.id }, data: { matchCount: mc, matchType: mt } });
      if (mt) winners.push({ userId: entry.userId, matchType: mt });
    }

    const byType = {
      FIVE_MATCH: winners.filter((w) => w.matchType === "FIVE_MATCH"),
      FOUR_MATCH: winners.filter((w) => w.matchType === "FOUR_MATCH"),
      THREE_MATCH: winners.filter((w) => w.matchType === "THREE_MATCH"),
    };

    let jackpotRolloverNext = 0;
    const records: { drawId: string; userId: string; matchType: "FIVE_MATCH" | "FOUR_MATCH" | "THREE_MATCH"; prizeAmountCents: number }[] = [];

    if (byType.FIVE_MATCH.length > 0) {
      const share = Math.floor(jackpotTotal / byType.FIVE_MATCH.length);
      byType.FIVE_MATCH.forEach(({ userId }) => records.push({ drawId: draw!.id, userId, matchType: "FIVE_MATCH", prizeAmountCents: share }));
    } else { jackpotRolloverNext = jackpotTotal; }

    if (byType.FOUR_MATCH.length > 0) {
      const share = Math.floor(pool.fourMatch / byType.FOUR_MATCH.length);
      byType.FOUR_MATCH.forEach(({ userId }) => records.push({ drawId: draw!.id, userId, matchType: "FOUR_MATCH", prizeAmountCents: share }));
    }
    if (byType.THREE_MATCH.length > 0) {
      const share = Math.floor(pool.threeMatch / byType.THREE_MATCH.length);
      byType.THREE_MATCH.forEach(({ userId }) => records.push({ drawId: draw!.id, userId, matchType: "THREE_MATCH", prizeAmountCents: share }));
    }

    await db.$transaction([
      ...records.map((r) => db.winnerRecord.create({ data: r })),
      db.draw.update({
        where: { id: draw.id },
        data: { drawnNumbers: numbers, status: "PUBLISHED", publishedAt: new Date(),
          totalPoolCents: pool.total, fiveMatchPool: jackpotTotal,
          fourMatchPool: pool.fourMatch, threeMatchPool: pool.threeMatch },
      }),
    ]);

    return ok({ message: "Draw published", numbers, winners: records.length, jackpotRollover: jackpotRolloverNext });
  } catch (err) { return serverError(err); }
}
