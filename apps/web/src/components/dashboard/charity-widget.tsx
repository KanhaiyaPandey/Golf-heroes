import Link from "next/link";
import Image from "next/image";
import type { Charity, CharitySelection } from "@golf-heroes/database";

interface CharityWidgetProps {
  selection: (CharitySelection & { charity: Charity }) | null;
}

export function CharityWidget({ selection }: CharityWidgetProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">Your Charity</h2>
        <Link
          href="/charities"
          className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
        >
          Change →
        </Link>
      </div>

      {selection ? (
        <div>
          <div className="flex items-start gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-zinc-800 shrink-0">
              {selection.charity.imageUrl ? (
                <Image
                  src={selection.charity.imageUrl}
                  alt={selection.charity.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-lg">🏌️</div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-white">
                {selection.charity.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                {selection.charity.description}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Your contribution</span>
              <span className="text-sm font-semibold text-emerald-400">
                {selection.customPercentage}% of subscription
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-700 p-5 text-center">
          <div className="mb-2 text-2xl">❤️</div>
          <p className="mb-3 text-sm text-zinc-400">No charity selected</p>
          <Link
            href="/charities"
            className="inline-flex rounded-xl bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600 transition-colors"
          >
            Choose a charity
          </Link>
        </div>
      )}
    </div>
  );
}
