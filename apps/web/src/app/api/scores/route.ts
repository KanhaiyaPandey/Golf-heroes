import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAuth } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/api-response";
import { MAX_STORED_SCORES, validateScore } from "@golf-heroes/shared";

const ScoreSchema = z.object({
  score: z
    .number()
    .int()
    .min(1)
    .max(45)
    .refine(validateScore, "Score must be between 1 and 45"),
  playedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const scores = await db.golfScore.findMany({
      where: { userId: session.userId },
      orderBy: { playedAt: "desc" },
      take: MAX_STORED_SCORES,
    });
    return ok(scores);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { score, playedAt } = ScoreSchema.parse(body);

    const dateObj = new Date(playedAt + "T00:00:00.000Z");

    // Check for duplicate date
    const existing = await db.golfScore.findUnique({
      where: {
        userId_playedAt: { userId: session.userId, playedAt: dateObj },
      },
    });
    if (existing) {
      return serverError(
        Object.assign(new Error("A score for this date already exists"), {
          statusCode: 409,
        })
      );
    }

    // Get current count
    const currentCount = await db.golfScore.count({
      where: { userId: session.userId },
    });

    // If at limit, delete the oldest
    if (currentCount >= MAX_STORED_SCORES) {
      const oldest = await db.golfScore.findFirst({
        where: { userId: session.userId },
        orderBy: { playedAt: "asc" },
      });
      if (oldest) {
        await db.golfScore.delete({ where: { id: oldest.id } });
      }
    }

    const newScore = await db.golfScore.create({
      data: { userId: session.userId, score, playedAt: dateObj },
    });

    return ok(newScore, 201);
  } catch (err) {
    return serverError(err);
  }
}
