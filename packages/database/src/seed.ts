import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@golfheroes.com" },
    update: {},
    create: {
      email: "admin@golfheroes.com",
      name: "Admin User",
      role: "ADMIN",
      emailVerified: true,
      // password: "admin123" - hashed with bcrypt
      hashedPassword:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSNZ83wozu",
    },
  });

  // Create test subscriber
  const subscriber = await prisma.user.upsert({
    where: { email: "player@golfheroes.com" },
    update: {},
    create: {
      email: "player@golfheroes.com",
      name: "John Golfer",
      role: "SUBSCRIBER",
      emailVerified: true,
      // password: "player123"
      hashedPassword:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSNZ83wozu",
    },
  });

  // Create charities
  const charities = await Promise.all([
    prisma.charity.upsert({
      where: { slug: "junior-golf-foundation" },
      update: {},
      create: {
        name: "Junior Golf Foundation",
        slug: "junior-golf-foundation",
        description:
          "Empowering young people through the game of golf. We provide equipment, coaching, and opportunities for children from all backgrounds.",
        imageUrl:
          "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
        websiteUrl: "https://juniorgolf.example.com",
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.charity.upsert({
      where: { slug: "green-fairways-environment" },
      update: {},
      create: {
        name: "Green Fairways Environment Trust",
        slug: "green-fairways-environment",
        description:
          "Protecting natural landscapes and promoting sustainable golf course management across the UK and Ireland.",
        imageUrl:
          "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
        websiteUrl: "https://greenfairways.example.com",
        isFeatured: false,
        isActive: true,
      },
    }),
    prisma.charity.upsert({
      where: { slug: "veterans-on-the-green" },
      update: {},
      create: {
        name: "Veterans on the Green",
        slug: "veterans-on-the-green",
        description:
          "Using golf as therapy and community for military veterans. Offering free golf days, mental health support, and social connection.",
        imageUrl:
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
        websiteUrl: "https://veteransgolf.example.com",
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.charity.upsert({
      where: { slug: "golf-for-all" },
      update: {},
      create: {
        name: "Golf for All – Disability Sports UK",
        slug: "golf-for-all",
        description:
          "Making golf accessible to people with physical and cognitive disabilities through adaptive equipment and inclusive programs.",
        imageUrl:
          "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800",
        websiteUrl: "https://golfforall.example.com",
        isFeatured: false,
        isActive: true,
      },
    }),
  ]);

  // Add charity events
  await prisma.charityEvent.createMany({
    data: [
      {
        charityId: charities[0]!.id,
        title: "Annual Junior Golf Day 2026",
        description:
          "A fun-filled day for young golfers aged 8-16. Coaching, competitions, and prizes!",
        eventDate: new Date("2026-07-15"),
        location: "St Andrews Links, Scotland",
      },
      {
        charityId: charities[2]!.id,
        title: "Veterans Charity Golf Classic",
        description:
          "18 holes followed by a dinner in honour of our serving and former armed forces.",
        eventDate: new Date("2026-08-22"),
        location: "Royal Troon Golf Club, Ayrshire",
      },
    ],
    skipDuplicates: true,
  });

  // Create subscription for test subscriber
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: subscriber.id },
  });

  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        userId: subscriber.id,
        plan: "MONTHLY",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        monthlyAmountCents: 1499,
        charityPercentage: 10,
      },
    });
  }

  // Create golf scores for test subscriber
  const today = new Date();
  const scores = [
    { score: 32, daysAgo: 2 },
    { score: 28, daysAgo: 7 },
    { score: 35, daysAgo: 14 },
    { score: 30, daysAgo: 21 },
    { score: 27, daysAgo: 28 },
  ];

  for (const { score, daysAgo } of scores) {
    const playedAt = new Date(today);
    playedAt.setDate(playedAt.getDate() - daysAgo);
    const dateOnly = new Date(
      playedAt.getFullYear(),
      playedAt.getMonth(),
      playedAt.getDate()
    );

    await prisma.golfScore.upsert({
      where: {
        userId_playedAt: {
          userId: subscriber.id,
          playedAt: dateOnly,
        },
      },
      update: {},
      create: {
        userId: subscriber.id,
        score,
        playedAt: dateOnly,
      },
    });
  }

  // Charity selection for subscriber
  await prisma.charitySelection.upsert({
    where: { userId: subscriber.id },
    update: {},
    create: {
      userId: subscriber.id,
      charityId: charities[0]!.id,
      customPercentage: 10,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("  Admin:      admin@golfheroes.com / admin123");
  console.log("  Subscriber: player@golfheroes.com / player123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
