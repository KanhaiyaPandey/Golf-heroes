import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
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
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function cancelSubscription(
  stripeSubscriptionId: string
): Promise<void> {
  await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}
