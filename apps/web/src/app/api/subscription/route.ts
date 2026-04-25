import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@golf-heroes/database";
import { requireAuth } from "@/lib/auth/session";
import { createCheckoutSession } from "@/lib/stripe";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAuth();
    const subscription = await db.subscription.findUnique({
      where: { userId: session.userId },
    });
    return ok(subscription);
  } catch (err) {
    return serverError(err);
  }
}

const CheckoutSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { plan } = CheckoutSchema.parse(body);

    const origin = (() => {
      const envUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (envUrl) {
        try {
          return new URL(envUrl).origin;
        } catch {
          try {
            return new URL(`https://${envUrl}`).origin;
          } catch {
            // Fall through to request origin.
          }
        }
      }
      return req.nextUrl.origin;
    })();

    const url = await createCheckoutSession({
      userId: session.userId,
      email: session.email,
      plan,
      successUrl: new URL("/dashboard?subscribed=true", origin).toString(),
      cancelUrl: new URL("/subscribe", origin).toString(),
    });

    return ok({ url });
  } catch (err) {
    return serverError(err);
  }
}
