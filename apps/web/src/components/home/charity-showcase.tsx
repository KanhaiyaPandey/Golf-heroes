import Link from "next/link";
import Image from "next/image";
import type { Charity, CharityEvent } from "@golf-heroes/database";

interface CharityShowcaseProps {
  charities: (Charity & { events: CharityEvent[] })[];
}

export function CharityShowcase({ charities }: CharityShowcaseProps) {
  return (
    <section className="relative bg-zinc-950 py-32 overflow-hidden">
      {/* Glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">
              Giving back
            </p>
            <h2 className="font-display text-4xl text-white sm:text-5xl">
              Featured charities
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl">
              Choose a cause you're passionate about. At least 10% of your subscription goes directly to your chosen charity.
            </p>
          </div>
          <Link
            href="/charities"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            View all charities
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {charities.map((charity) => (
            <Link
              key={charity.id}
              href={`/charities/${charity.slug}`}
              className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-zinc-800">
                {charity.imageUrl ? (
                  <Image
                    src={charity.imageUrl}
                    alt={charity.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-4xl">🏌️</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
              </div>

              <div className="p-5">
                <h3 className="mb-2 font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {charity.name}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">
                  {charity.description}
                </p>
                {charity.events[0] && (
                  <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                    <p className="text-xs text-zinc-500">Upcoming event</p>
                    <p className="mt-1 text-sm text-zinc-300">{charity.events[0].title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(charity.events[0].eventDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
