import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { createSession } from "@/lib/auth/session";
import { ok, error, serverError } from "@/lib/api-response";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = RegisterSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return error("Email already in use", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: { name, email, hashedPassword, role: "SUBSCRIBER" },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as "SUBSCRIBER" | "ADMIN",
      name: user.name,
    });

    return ok({ userId: user.id, name: user.name, email: user.email }, 201);
  } catch (err) {
    return serverError(err);
  }
}
