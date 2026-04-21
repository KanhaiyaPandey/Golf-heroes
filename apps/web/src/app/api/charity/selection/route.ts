import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAuth } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/api-response";
import { validateCharityPercentage } from "@golf-heroes/shared";

const SelectionSchema = z.object({
  charityId: z.string().cuid(),
  customPercentage: z
    .number()
    .int()
    .min(10)
    .max(100)
    .refine(validateCharityPercentage)
    .default(10),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const selection = await db.charitySelection.findUnique({
      where: { userId: session.userId },
      include: { charity: true },
    });
    return ok(selection);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { charityId, customPercentage } = SelectionSchema.parse(body);

    const selection = await db.charitySelection.upsert({
      where: { userId: session.userId },
      update: { charityId, customPercentage },
      create: { userId: session.userId, charityId, customPercentage },
      include: { charity: true },
    });

    return ok(selection);
  } catch (err) {
    return serverError(err);
  }
}
