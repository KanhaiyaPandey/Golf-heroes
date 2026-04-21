import { db } from "@golf-heroes/database";
import {
  countMatches,
  getMatchType,
  calculatePrizePool,
  DRAW_NUMBER_COUNT,
  DRAW_NUMBER_MIN,
  DRAW_NUMBER_MAX,
} from "@golf-heroes/shared";

// ─── Random Draw ───────────────────────────────────────────────────────────
export function generateRandomNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < DRAW_NUMBER_COUNT) {
    numbers.add(
      Math.floor(Math.random() * (DRAW_NUMBER_MAX - DRAW_NUMBER_MIN + 1)) +
        DRAW_NUMBER_MIN
    );
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// ─── Algorithmic Draw (weighted by score frequency) ───────────────────────
export async function generateAlgorithmicNumbers(): Promise<number[]> {
  // Fetch all scores from active subscribers
  const scores = await db.golfScore.findMany({
    where: {
      user: {
        subscription: { status: "ACTIVE" },
      },
    },
    select: { score: true },
  });

  // Build frequency map
  const freq: Record<number, number> = {};
  for (const { score } of scores) {
    freq[score] = (freq[score] ?? 0) + 1;
  }

  // Fill missing scores with weight 1
  for (let i = DRAW_NUMBER_MIN; i <= DRAW_NUMBER_MAX; i++) {
    if (!freq[i]) freq[i] = 1;
  }

  // Weighted random selection
  const drawn = new Set<number>();
  while (drawn.size < DRAW_NUMBER_COUNT) {
    const entries = Object.entries(freq).filter(
      ([num]) => !drawn.has(Number(num))
    );
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
    let rand = Math.random() * totalWeight;
    for (const [num, weight] of entries) {
      rand -= weight;
      if (rand <= 0) {
        drawn.add(Number(num));
        break;
      }
    }
  }

  return Array.from(drawn).sort((a, b) => a - b);
}

// ─── Process Draw Results ─────────────────────────────────────────────────
export async function processDrawResults(
  drawId: string,
  drawnNumbers: number[]
): Promise<void> {
  const draw = await db.draw.findUniqueOrThrow({
    where: { id: drawId },
    include: {
      entries: {
        include: { user: true },
      },
    },
  });

  // Count active subscribers for prize pool
  const subscriberCount = await db.subscription.count({
    where: { status: "ACTIVE" },
  });

  const pool = calculatePrizePool(subscriberCount);
  const totalPool = pool.fiveMatch + draw.jackpotRollover; // jackpot includes rollover

  // Evaluate each entry
  const winners: {
    userId: string;
    matchType: "FIVE_MATCH" | "FOUR_MATCH" | "THREE_MATCH";
  }[] = [];

  for (const entry of draw.entries) {
    const matchCount = countMatches(entry.numbers, drawnNumbers);
    const matchType = getMatchType(matchCount);

    // Update entry with results
    await db.drawEntry.update({
      where: { id: entry.id },
      data: { matchType, matchCount },
    });

    if (matchType) {
      winners.push({ userId: entry.userId, matchType });
    }
  }

  // Group winners by match type
  const byType = {
    FIVE_MATCH: winners.filter((w) => w.matchType === "FIVE_MATCH"),
    FOUR_MATCH: winners.filter((w) => w.matchType === "FOUR_MATCH"),
    THREE_MATCH: winners.filter((w) => w.matchType === "THREE_MATCH"),
  };

  let jackpotRolloverNext = 0;

  // Create winner records with split prizes
  const winnerRecords: {
    drawId: string;
    userId: string;
    matchType: "FIVE_MATCH" | "FOUR_MATCH" | "THREE_MATCH";
    prizeAmountCents: number;
  }[] = [];

  // Five match (jackpot)
  if (byType.FIVE_MATCH.length > 0) {
    const share = Math.floor(totalPool / byType.FIVE_MATCH.length);
    byType.FIVE_MATCH.forEach(({ userId }) => {
      winnerRecords.push({ drawId, userId, matchType: "FIVE_MATCH", prizeAmountCents: share });
    });
  } else {
    jackpotRolloverNext = totalPool; // Roll over jackpot
  }

  // Four match
  if (byType.FOUR_MATCH.length > 0) {
    const share = Math.floor(pool.fourMatch / byType.FOUR_MATCH.length);
    byType.FOUR_MATCH.forEach(({ userId }) => {
      winnerRecords.push({ drawId, userId, matchType: "FOUR_MATCH", prizeAmountCents: share });
    });
  }

  // Three match
  if (byType.THREE_MATCH.length > 0) {
    const share = Math.floor(pool.threeMatch / byType.THREE_MATCH.length);
    byType.THREE_MATCH.forEach(({ userId }) => {
      winnerRecords.push({ drawId, userId, matchType: "THREE_MATCH", prizeAmountCents: share });
    });
  }

  // Persist everything in one transaction
  await db.$transaction([
    ...winnerRecords.map((r) =>
      db.winnerRecord.create({ data: r })
    ),
    db.draw.update({
      where: { id: drawId },
      data: {
        drawnNumbers,
        status: "PUBLISHED",
        publishedAt: new Date(),
        totalPoolCents: pool.total,
        fiveMatchPool: totalPool,
        fourMatchPool: pool.fourMatch,
        threeMatchPool: pool.threeMatch,
      },
    }),
    // Store rollover in next month's draw if exists
    ...(jackpotRolloverNext > 0
      ? [
          db.draw.updateMany({
            where: {
              status: "PENDING",
              year: { gte: draw.year },
            },
            data: { jackpotRollover: jackpotRolloverNext },
          }),
        ]
      : []),
  ]);
}

// ─── Snapshot user scores for draw entry ──────────────────────────────────
export async function createDrawEntry(
  drawId: string,
  userId: string
): Promise<void> {
  // Get latest 5 scores
  const scores = await db.golfScore.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: 5,
    select: { score: true },
  });

  if (scores.length === 0) {
    throw new Error("No scores available to enter draw");
  }

  const numbers = scores.map((s) => s.score);

  await db.drawEntry.upsert({
    where: { drawId_userId: { drawId, userId } },
    update: { numbers },
    create: { drawId, userId, numbers },
  });
}
