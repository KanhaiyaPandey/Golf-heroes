import Link from "next/link";
import type { Subscription } from "@golf-heroes/database";
import { formatCurrency } from "@golf-heroes/shared";

interface SubscriptionCardProps {
  subscription: Subscription | null;
}

const statusColors = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  INACTIVE: "bg-zinc-700 text-zinc-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  LAPSED: "bg-amber-500/15 text-amber-400",
  PAST_DUE: "bg-red-500/15 text-red-400",
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  if (!subscription) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="mb-4 font-semibold text-white">Subscription</h2>
        <div className="rounded-xl border border-dashed border-zinc-700 p-5 text-center">
          <p className="mb-3 text-sm text-zinc-400">You don&apos;t have an active subscription</p>
          <Link
            href="/subscribe"
            className="inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            Subscribe now
          </Link>
        </div>
      </div>
    );
  }

  const renewalDate = new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="mb-4 font-semibold text-white">Subscription</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Status</span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              statusColors[subscription.status] ?? statusColors.INACTIVE
            }`}
          >
            {subscription.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Plan</span>
          <span className="text-sm font-medium text-white">{subscription.plan}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Amount</span>
          <span className="text-sm font-medium text-white">
            {formatCurrency(subscription.monthlyAmountCents)}/
            {subscription.plan === "MONTHLY" ? "mo" : "yr"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">
            {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}
          </span>
          <span className="text-sm font-medium text-white">{renewalDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Charity %</span>
          <span className="text-sm font-medium text-emerald-400">{subscription.charityPercentage}%</span>
        </div>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
          Your subscription will end on {renewalDate}.
        </div>
      )}
    </div>
  );
}
