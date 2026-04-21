import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { createSession } from "@/lib/auth/session";
import { ok, error, serverError } from "@/lib/api-response";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword) {
      return error("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) return error("Invalid credentials", 401);

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as "SUBSCRIBER" | "ADMIN",
      name: user.name,
    });

    return ok({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return serverError(err);
  }
}
