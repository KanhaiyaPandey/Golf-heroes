import { NextRequest } from "next/server";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("q") ?? "";

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: search
          ? {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        include: {
          subscription: { select: { status: true, plan: true, currentPeriodEnd: true } },
          _count: { select: { golfScores: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count(),
    ]);

    return ok({ users, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    return serverError(err);
  }
}
