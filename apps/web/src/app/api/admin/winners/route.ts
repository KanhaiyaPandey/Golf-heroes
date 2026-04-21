import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const winners = await db.winnerRecord.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        draw: { select: { month: true, year: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(winners);
  } catch (err) {
    return serverError(err);
  }
}

const VerifySchema = z.object({
  winnerId: z.string().cuid(),
  action: z.enum(["approve", "reject", "mark_paid"]),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { winnerId, action, adminNote } = VerifySchema.parse(body);

    const updateData: Record<string, unknown> = { adminNote };

    if (action === "approve") {
      updateData.verificationStatus = "APPROVED";
    } else if (action === "reject") {
      updateData.verificationStatus = "REJECTED";
    } else if (action === "mark_paid") {
      updateData.paymentStatus = "PAID";
      updateData.paidAt = new Date();
    }

    const updated = await db.winnerRecord.update({
      where: { id: winnerId },
      data: updateData,
    });

    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}
