import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { db } from "@golf-heroes/database";
import { formatCurrency, calculatePrizePool } from "@golf-heroes/shared";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { CharityShowcase } from "@/components/home/charity-showcase";
import { PrizePool } from "@/components/home/prize-pool";
import { CTASection } from "@/components/home/cta-section";

export default async function HomePage() {
  const session = await getSession();
  const subscriberCount = await db.subscription.count({ where: { status: "ACTIVE" } });
  const pool = calculatePrizePool(subscriberCount);
  const featuredCharities = await db.charity.findMany({
    where: { isFeatured: true, isActive: true },
    take: 3,
    include: { events: { take: 1, orderBy: { eventDate: "asc" } } },
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar session={session} />
      <HeroSection pool={pool} subscriberCount={subscriberCount} />
      <HowItWorks />
      <PrizePool pool={pool} subscriberCount={subscriberCount} />
      <CharityShowcase charities={featuredCharities} />
      <CTASection isLoggedIn={!!session} />
      <Footer />
    </div>
  );
}
