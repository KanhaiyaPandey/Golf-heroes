import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAdmin } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") ?? "";
    const featured = searchParams.get("featured");

    const charities = await db.charity.findMany({
      where: {
        isActive: true,
        ...(featured === "true" ? { isFeatured: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { events: { orderBy: { eventDate: "asc" }, take: 3 } },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });

    return ok(charities);
  } catch (err) {
    return serverError(err);
  }
}

const CreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(10),
  imageUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  slug: z.string().min(2).max(80),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = CreateSchema.parse(body);
    const charity = await db.charity.create({ data });
    return ok(charity, 201);
  } catch (err) {
    return serverError(err);
  }
}
