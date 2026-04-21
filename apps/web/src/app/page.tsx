import { getSession } from "@/lib/auth/session";
import { db } from "@golf-heroes/database";
import type { Charity, CharityEvent } from "@golf-heroes/database";
import { calculatePrizePool } from "@golf-heroes/shared";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { CharityShowcase } from "@/components/home/charity-showcase";
import { PrizePool } from "@/components/home/prize-pool";
import { CTASection } from "@/components/home/cta-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  let subscriberCount = 0;
  let pool = calculatePrizePool(subscriberCount);
  let featuredCharities: (Charity & { events: CharityEvent[] })[] = [];

  try {
    subscriberCount = await db.subscription.count({
      where: { status: "ACTIVE" },
    });
    pool = calculatePrizePool(subscriberCount);
    featuredCharities = await db.charity.findMany({
      where: { isFeatured: true, isActive: true },
      take: 3,
      include: { events: { take: 1, orderBy: { eventDate: "asc" } } },
    });
  } catch (err) {
    console.error("Home page data load failed:", err);
  }

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
