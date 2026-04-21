import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@golf-heroes/database";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "golf-heroes-super-secret-key-change-in-production"
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: "SUBSCRIBER" | "ADMIN";
  name: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("golf-heroes-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("golf-heroes-session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("golf-heroes-session");
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireActiveSubscription(userId: string): Promise<void> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    throw new Error("SUBSCRIPTION_REQUIRED");
  }
}
