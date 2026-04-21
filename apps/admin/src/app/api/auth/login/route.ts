import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { createSession } from "@/lib/session";
import { ok, error, serverError } from "@/lib/api-response";

const Schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const { email, password } = Schema.parse(await req.json());
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword || user.role !== "ADMIN")
      return error("Invalid credentials", 401);
    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) return error("Invalid credentials", 401);
    await createSession({ userId: user.id, email: user.email, role: "ADMIN", name: user.name });
    return ok({ userId: user.id, name: user.name });
  } catch (err) {
    return serverError(err);
  }
}
