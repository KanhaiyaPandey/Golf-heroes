"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const plans = [
  {
    id: "MONTHLY" as const,
    label: "Monthly",
    price: "£14.99",
    period: "/month",
    description: "Flexible — cancel anytime",
    popular: false,
    features: [
      "Enter monthly prize draw",
      "Track up to 5 Stableford scores",
      "Choose your charity",
      "10% to your chosen cause",
    ],
  },
  {
    id: "YEARLY" as const,
    label: "Yearly",
    price: "£143.88",
    period: "/year",
    description: "Save ~20% vs monthly",
    popular: true,
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority draw entry",
      "Exclusive yearly member badge",
    ],
  },
];

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/signup";
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? "Failed to start checkout");
        return;
      }

      window.location.href = data.data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen animated-bg pt-16">
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <span className="text-xs font-bold text-white">GH</span>
            </div>
            <span className="font-display text-lg text-white">
              Golf <span className="text-emerald-400">Heroes</span>
            </span>
          </Link>
          <h1 className="font-display text-4xl text-white sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mt-4 text-zinc-400">
            Cancel anytime. All plans include draw entry, score tracking, and charity contribution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl border p-6 text-left transition-all ${
                selectedPlan === plan.id
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}

              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{plan.label}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{plan.description}</p>
                </div>
                <div
                  className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedPlan === plan.id
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-zinc-600"
                  }`}
                >
                  {selectedPlan === plan.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="font-display text-3xl text-white">{plan.price}</span>
                <span className="text-zinc-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-xl shadow-emerald-500/20"
        >
          {loading ? "Redirecting to checkout…" : `Subscribe — ${selectedPlan === "MONTHLY" ? "£14.99/mo" : "£143.88/yr"}`}
        </button>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Secure checkout via Stripe. Your card details are never stored on our servers.
        </p>
      </div>
    </div>
  );
}
