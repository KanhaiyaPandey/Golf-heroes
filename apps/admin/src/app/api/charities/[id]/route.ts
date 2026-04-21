import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/session";
import { ok, notFound, serverError } from "@/lib/api-response";

const Schema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = Schema.parse(await req.json());
    const existing = await db.charity.findUnique({ where: { id } });
    if (!existing) return notFound("Charity");
    const updated = await db.charity.update({ where: { id }, data });
    return ok(updated);
  } catch (err) { return serverError(err); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.charity.findUnique({ where: { id } });
    if (!existing) return notFound("Charity");
    await db.charity.update({ where: { id }, data: { isActive: false } });
    return ok({ deleted: true });
  } catch (err) { return serverError(err); }
}
