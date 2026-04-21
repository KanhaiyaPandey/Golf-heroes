import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@golf-heroes/database";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as "MONTHLY" | "YEARLY";
  if (!userId || !plan) return;

  const stripeSubId = session.subscription as string;
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  const customerId = session.customer as string;

  const priceId = stripeSub.items.data[0]?.price.id ?? "";
  const amountCents = plan === "MONTHLY" ? 1499 : 14388;

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status: "ACTIVE",
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubId,
      stripePriceId: priceId,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      monthlyAmountCents: amountCents,
    },
    update: {
      status: "ACTIVE",
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubId,
      stripePriceId: priceId,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subId = (invoice as { subscription?: string }).subscription;
  if (!subId) return;
  const stripeSub = await stripe.subscriptions.retrieve(subId);

  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subId },
    data: {
      status: "ACTIVE",
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = (invoice as { subscription?: string }).subscription;
  if (!subId) return;
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subId },
    data: { status: "PAST_DUE" },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: { status: "CANCELLED" },
  });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const status = sub.cancel_at_period_end ? "ACTIVE" : "ACTIVE";
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: {
      status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    },
  });
}
