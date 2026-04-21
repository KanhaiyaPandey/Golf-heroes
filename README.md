# ⛳ Golf Heroes — Full-Stack Turborepo

> Subscription-driven golf performance tracking, charity fundraising, and monthly prize draws.

---

## 🗂 Monorepo Structure

```
golf-heroes/
├── apps/
│   ├── web/          # Main subscriber-facing Next.js app (port 3000)
│   └── admin/        # Admin dashboard Next.js app (port 3001)
├── packages/
│   ├── database/     # Prisma schema + client (shared)
│   ├── shared/       # Business logic, constants, helpers
│   ├── ui/           # Shared React component library
│   ├── config-typescript/  # Shared tsconfig files
│   └── config-eslint/      # Shared ESLint config
├── turbo.json
└── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- npm ≥ 10
- A [Supabase](https://supabase.com) project (new, not personal)
- A [Stripe](https://stripe.com) account with test keys

### 2. Clone & install

```bash
git clone <repo-url>
cd golf-heroes
npm install
```

### 3. Environment variables

Copy the example files and fill in values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp packages/database/.env.example packages/database/.env
```

**Required variables:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooler connection string |
| `DIRECT_URL` | Supabase direct connection (migrations) |
| `JWT_SECRET` | Long random string (same across both apps) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe price ID for monthly plan |
| `STRIPE_YEARLY_PRICE_ID` | Stripe price ID for yearly plan |

### 4. Set up the database

```bash
cd packages/database
npm run db:push        # Push schema to Supabase
npm run db:seed        # Seed test data
```

### 5. Run development servers

```bash
# From repo root — runs both apps in parallel
npm run dev
```

- **Web app**: http://localhost:3000
- **Admin panel**: http://localhost:3001

---

## 🔑 Test Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@golfheroes.com | admin123 |
| Subscriber | player@golfheroes.com | player123 |

---

## 💳 Stripe Setup

1. Create two products in your Stripe dashboard:
   - **Monthly** — £14.99/month recurring
   - **Yearly** — £143.88/year recurring
2. Copy the Price IDs into your `.env.local`
3. For webhooks (local testing):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Add the displayed `whsec_...` as `STRIPE_WEBHOOK_SECRET`.

---

## 🌐 Deployment to Vercel

Deploy each app as a separate Vercel project from the **same** monorepo:

### Web App
1. Create a new Vercel project → import this repo
2. Set **Root Directory** to `apps/web`
3. Add all environment variables
4. Deploy

### Admin App
1. Create another new Vercel project → same repo
2. Set **Root Directory** to `apps/admin`
3. Add environment variables (DATABASE_URL, DIRECT_URL, JWT_SECRET)
4. Deploy

> **Important:** Use a **new** Vercel account (not personal/existing) per the PRD requirements.

---

## 🏗 Architecture Decisions

### Auth
- JWT stored in an httpOnly cookie (7-day expiry)
- Shared secret between web and admin apps for SSO-like behaviour
- Role-based: `SUBSCRIBER` and `ADMIN`

### Score Logic
- Max 5 scores per user; newest score auto-replaces oldest when at capacity
- One score per date (unique constraint enforced at DB level)
- Scores are snapshotted at draw entry time (stored in `DrawEntry.numbers`)

### Draw Engine
- **Random**: pure `Math.random()` lottery
- **Algorithmic**: frequency-weighted selection — numbers appearing more often in user scores have higher probability
- Simulation mode previews numbers without creating winner records
- Jackpot rolls over to next month if no 5-match winner

### Prize Pool
- 50% of all active subscription revenue contributes to the monthly pool
- Split: 40% jackpot / 35% four-match / 25% three-match
- Multiple winners in same tier share equally

### Charity
- Users select one charity at sign-up (changeable anytime)
- Min 10%, max 100% of subscription directed to charity
- Independent donations also supported (not tied to gameplay)

---

## 🧪 Testing Checklist

- [ ] User signup & login
- [ ] Subscription flow (monthly and yearly via Stripe)
- [ ] Score entry — 5-score rolling logic
- [ ] Duplicate date prevention
- [ ] Draw system — simulate and publish
- [ ] Charity selection and contribution display
- [ ] Winner verification flow (admin)
- [ ] Payout tracking (mark as paid)
- [ ] User dashboard — all modules functional
- [ ] Admin panel — full control
- [ ] Responsive design on mobile and desktop
- [ ] Error handling and edge cases

---

## 📦 Package Scripts

```bash
npm run dev           # Run all apps in parallel
npm run build         # Build all apps
npm run lint          # Lint all packages
npm run type-check    # TypeScript check all packages
npm run db:generate   # Regenerate Prisma client
npm run db:push       # Push schema changes to DB
```

---

## 🔒 Security Notes

- Change `JWT_SECRET` to a cryptographically random 64+ character string in production
- Enable HTTPS (enforced automatically on Vercel)
- Stripe webhook signature verification is implemented
- Passwords are hashed with bcrypt (cost factor 10)
- All admin routes require `role === "ADMIN"` session check

---

Built for the Digital Heroes trainee selection process. 🏌️
