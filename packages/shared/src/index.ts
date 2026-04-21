// ─── Subscription Constants ────────────────────────────────────────────────
export const SUBSCRIPTION_PRICES = {
  MONTHLY: {
    amountCents: 1499,
    label: "£14.99 / month",
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? "",
  },
  YEARLY: {
    amountCents: 14388, // £143.88 (~20% discount)
    label: "£143.88 / year",
    stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID ?? "",
  },
} as const;

export const MIN_CHARITY_PERCENTAGE = 10;
export const MAX_CHARITY_PERCENTAGE = 100;
export const DEFAULT_CHARITY_PERCENTAGE = 10;

// ─── Score Constants ───────────────────────────────────────────────────────
export const MIN_SCORE = 1;
export const MAX_SCORE = 45;
export const MAX_STORED_SCORES = 5;

// ─── Prize Pool Constants ──────────────────────────────────────────────────
export const PRIZE_POOL_ALLOCATIONS = {
  FIVE_MATCH: 0.4,   // 40%
  FOUR_MATCH: 0.35,  // 35%
  THREE_MATCH: 0.25, // 25%
} as const;

export const SUBSCRIPTION_PRIZE_POOL_PERCENTAGE = 0.5; // 50% of sub goes to prize pool

// ─── Draw Constants ────────────────────────────────────────────────────────
export const DRAW_NUMBER_COUNT = 5;
export const DRAW_NUMBER_MIN = 1;
export const DRAW_NUMBER_MAX = 45;

// ─── Helper Functions ──────────────────────────────────────────────────────

export function formatCurrency(cents: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function calculatePrizePool(activeSubscribers: number): {
  total: number;
  fiveMatch: number;
  fourMatch: number;
  threeMatch: number;
} {
  const monthlyRate = SUBSCRIPTION_PRICES.MONTHLY.amountCents;
  const total = Math.floor(
    activeSubscribers * monthlyRate * SUBSCRIPTION_PRIZE_POOL_PERCENTAGE
  );
  return {
    total,
    fiveMatch: Math.floor(total * PRIZE_POOL_ALLOCATIONS.FIVE_MATCH),
    fourMatch: Math.floor(total * PRIZE_POOL_ALLOCATIONS.FOUR_MATCH),
    threeMatch: Math.floor(total * PRIZE_POOL_ALLOCATIONS.THREE_MATCH),
  };
}

export function calculateCharityContribution(
  subscriptionCents: number,
  percentage: number
): number {
  return Math.floor(subscriptionCents * (percentage / 100));
}

export function countMatches(userNumbers: number[], drawnNumbers: number[]): number {
  const drawnSet = new Set(drawnNumbers);
  return userNumbers.filter((n) => drawnSet.has(n)).length;
}

export function getMatchType(matchCount: number): "FIVE_MATCH" | "FOUR_MATCH" | "THREE_MATCH" | null {
  if (matchCount >= 5) return "FIVE_MATCH";
  if (matchCount === 4) return "FOUR_MATCH";
  if (matchCount === 3) return "THREE_MATCH";
  return null;
}

export function validateScore(score: number): boolean {
  return Number.isInteger(score) && score >= MIN_SCORE && score <= MAX_SCORE;
}

export function validateCharityPercentage(pct: number): boolean {
  return Number.isInteger(pct) && pct >= MIN_CHARITY_PERCENTAGE && pct <= MAX_CHARITY_PERCENTAGE;
}

export function getCurrentDrawPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function formatDrawPeriod(month: number, year: number): string {
  return new Date(year, month - 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}
