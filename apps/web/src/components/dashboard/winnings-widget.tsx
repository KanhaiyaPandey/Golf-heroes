import type { WinnerRecord, Draw } from "@golf-heroes/database";
import { formatCurrency, formatDrawPeriod } from "@golf-heroes/shared";

interface WinningsWidgetProps {
  winnings: (WinnerRecord & { draw: Pick<Draw, "month" | "year"> })[];
}

const matchLabels = { FIVE_MATCH: "5 Match 🏆", FOUR_MATCH: "4 Match 🥈", THREE_MATCH: "3 Match 🥉" };
const paymentColors = {
  PENDING: "bg-amber-500/15 text-amber-400",
  PAID: "bg-emerald-500/15 text-emerald-400",
  FAILED: "bg-red-500/15 text-red-400",
};

export function WinningsWidget({ winnings }: WinningsWidgetProps) {
  const totalWon = winnings
    .filter((w) => w.paymentStatus === "PAID")
    .reduce((sum, w) => sum + w.prizeAmountCents, 0);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-white">Winnings</h2>
        {totalWon > 0 && (
          <span className="text-sm font-medium text-emerald-400">
            {formatCurrency(totalWon)} total paid
          </span>
        )}
      </div>

      {winnings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center">
          <div className="mb-2 text-2xl">🎯</div>
          <p className="text-sm text-zinc-500">
            No wins yet — enter the monthly draw to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {winnings.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium text-white">
                  {matchLabels[w.matchType]}
                </div>
                <div className="text-xs text-zinc-500">
                  {formatDrawPeriod(w.draw.month, w.draw.year)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {formatCurrency(w.prizeAmountCents)}
                </div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    paymentColors[w.paymentStatus]
                  }`}
                >
                  {w.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
