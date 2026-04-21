import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/session";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const charities = await db.charity.findMany({
      include: { _count: { select: { charitySelections: true, events: true } } },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });
    return ok(charities);
  } catch (err) { return serverError(err); }
}

const Schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = Schema.parse(await req.json());
    const charity = await db.charity.create({ data });
    return ok(charity, 201);
  } catch (err) { return serverError(err); }
}
