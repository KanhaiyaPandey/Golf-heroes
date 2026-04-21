import { NextRequest } from "next/server";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/session";
import { ok, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const q = searchParams.get("q") ?? "";
    const where = q ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] } : {};
    const [users, total] = await Promise.all([
      db.user.findMany({
        where, include: {
          subscription: { select: { status: true, plan: true, currentPeriodEnd: true, monthlyAmountCents: true } },
          golfScores: { orderBy: { playedAt: "desc" }, take: 5, select: { score: true, playedAt: true } },
          _count: { select: { winnerRecords: true } },
        },
        orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      }),
      db.user.count({ where }),
    ]);
    return ok({ users, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { return serverError(err); }
}
