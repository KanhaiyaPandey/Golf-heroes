import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function ensureAbsoluteUrl(url: string, name: string): string {
  try {
    return new URL(url).toString();
  } catch {
    throw new Error(
      `Invalid ${name}: must be an absolute URL including scheme (e.g. https://...). Received: ${url}`
    );
  }
}

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(apiKey, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });

  return stripeClient;
}

export const STRIPE_PLANS = {
  MONTHLY: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? "price_monthly",
    amountCents: 1499,
    interval: "month" as const,
  },
  YEARLY: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID ?? "price_yearly",
    amountCents: 14388,
    interval: "year" as const,
  },
};

export async function createCheckoutSession({
  userId,
  email,
  plan,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  plan: "MONTHLY" | "YEARLY";
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const selectedPlan = STRIPE_PLANS[plan];
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
    success_url: ensureAbsoluteUrl(successUrl, "successUrl"),
    cancel_url: ensureAbsoluteUrl(cancelUrl, "cancelUrl"),
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  return session.url ?? "/subscribe";
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: ensureAbsoluteUrl(returnUrl, "returnUrl"),
  });
  return session.url;
}

export async function cancelSubscription(
  stripeSubscriptionId: string
): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}
