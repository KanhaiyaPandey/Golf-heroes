import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/auth/session";
import {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  processDrawResults,
} from "@/lib/draw/engine";
import { ok, serverError } from "@/lib/api-response";

const DrawActionSchema = z.object({
  action: z.enum(["simulate", "publish"]),
  drawType: z.enum(["RANDOM", "ALGORITHMIC"]).default("RANDOM"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024),
});

export async function GET() {
  try {
    await requireAdmin();
    const draws = await db.draw.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        _count: { select: { entries: true, winnerRecords: true } },
      },
    });
    return ok(draws);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { action, drawType, month, year } = DrawActionSchema.parse(body);

    // Find or create draw
    let draw = await db.draw.findUnique({
      where: { month_year: { month, year } },
    });
    if (!draw) {
      draw = await db.draw.create({
        data: { month, year, drawType, status: "PENDING", drawnNumbers: [] },
      });
    }

    const numbers =
      drawType === "ALGORITHMIC"
        ? await generateAlgorithmicNumbers()
        : generateRandomNumbers();

    if (action === "simulate") {
      await db.draw.update({
        where: { id: draw.id },
        data: { drawnNumbers: numbers, status: "SIMULATION", drawType },
      });
      return ok({ message: "Simulation complete", numbers, drawId: draw.id });
    }

    // Publish
    await processDrawResults(draw.id, numbers);
    return ok({ message: "Draw published", numbers, drawId: draw.id });
  } catch (err) {
    return serverError(err);
  }
}
