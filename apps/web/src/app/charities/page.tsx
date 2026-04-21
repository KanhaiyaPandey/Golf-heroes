import { db } from "@golf-heroes/database";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CharitiesClient } from "@/components/charity/charities-client";

export const metadata = { title: "Charities" };

export default async function CharitiesPage() {
  const [session, charities] = await Promise.all([
    getSession(),
    db.charity.findMany({
      where: { isActive: true },
      include: { events: { orderBy: { eventDate: "asc" }, take: 2 } },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar session={session} />
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Make a difference</p>
          <h1 className="font-display text-4xl text-white sm:text-5xl">Choose your charity</h1>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            At least 10% of every subscription goes directly to your chosen cause. Browse our partner charities below.
          </p>
        </div>
        <CharitiesClient charities={charities} isLoggedIn={!!session} />
      </div>
      <Footer />
    </div>
  );
}
