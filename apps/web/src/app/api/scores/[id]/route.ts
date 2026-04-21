import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAuth } from "@/lib/auth/session";
import { ok, notFound, forbidden, serverError } from "@/lib/api-response";

const UpdateSchema = z.object({
  score: z.number().int().min(1).max(45).optional(),
  playedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const existing = await db.golfScore.findUnique({ where: { id } });
    if (!existing) return notFound("Score");
    if (existing.userId !== session.userId && session.role !== "ADMIN") {
      return forbidden();
    }

    const updated = await db.golfScore.update({
      where: { id },
      data: {
        ...(data.score !== undefined ? { score: data.score } : {}),
        ...(data.playedAt
          ? { playedAt: new Date(data.playedAt + "T00:00:00.000Z") }
          : {}),
      },
    });

    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await db.golfScore.findUnique({ where: { id } });
    if (!existing) return notFound("Score");
    if (existing.userId !== session.userId && session.role !== "ADMIN") {
      return forbidden();
    }

    await db.golfScore.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
