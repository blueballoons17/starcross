# Kindred Stars

An astrology-based dating platform built with Next.js 16, Prisma 7, and TypeScript.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Installation

```bash
git clone <repo-url>
cd kindredstars
npm install
```

## Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kindredstars"
NEXTAUTH_SECRET="your-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

`NEXTAUTH_SECRET` must be a strong random string (32+ chars). Generate one with:
```bash
openssl rand -base64 32
```

## Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with 12 demo users
npx prisma db seed
```

To reset the database:
```bash
npx prisma migrate reset
```

## Running

```bash
npm run dev
```

Visit http://localhost:3000

## Seeded Accounts

All demo users have password: `password123`

| Name | Email | Sun Sign |
|------|-------|----------|
| Maya Chen | maya.chen@example.com | Aries |
| Isabelle Martin | isabelle.martin@example.com | Leo |
| Priya Sharma | priya.sharma@example.com | Scorpio |
| Sofia Reyes | sofia.reyes@example.com | Aquarius |
| Alice Nakamura | alice.nakamura@example.com | Cancer |
| Zara Okonkwo | zara.okonkwo@example.com | Virgo |
| James Carter | james.carter@example.com | Aries |
| Lucas Dubois | lucas.dubois@example.com | Cancer |
| Ethan Walsh | ethan.walsh@example.com | Capricorn |
| Ravi Patel | ravi.patel@example.com | Sagittarius |
| Marco Ferrari | marco.ferrari@example.com | Taurus |
| Alex Kim | alex.kim@example.com | Libra |

## Architecture

```
kindredstars/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/  # NextAuth.js handler
│   │   │   └── register/       # POST: create account
│   │   ├── discover/           # GET: candidate feed
│   │   ├── matches/            # GET: user matches
│   │   ├── profile/            # GET/POST: user profile
│   │   └── swipe/              # POST: record swipe, create match
│   ├── discover/page.tsx       # Swipe discovery UI
│   ├── matches/page.tsx        # Matches dashboard
│   ├── onboarding/page.tsx     # Multi-step profile setup
│   ├── profile/page.tsx        # User astrological profile view
│   ├── layout.tsx              # Root layout (fonts, providers)
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # Design system components (shadcn-style)
│   ├── CompatibilityModal.tsx  # Full breakdown modal
│   ├── MatchCard.tsx           # Match grid card with score ring
│   ├── NavBar.tsx              # Top navigation (auth-gated)
│   ├── SessionProvider.tsx     # NextAuth session wrapper
│   └── SwipeDeck.tsx           # Drag-to-swipe card stack
├── lib/
│   ├── astrology/index.ts      # Deterministic birth chart engine
│   ├── auth/index.ts           # bcrypt helpers
│   ├── matching/index.ts       # Compatibility scoring engine
│   ├── prisma.ts               # PrismaClient singleton
│   ├── utils.ts                # cn() utility
│   └── zodiac-colors.ts        # Sign color palette
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Demo data seeder
├── types/
│   └── next-auth.d.ts          # Session type augmentation
└── prisma.config.ts            # Prisma 7 datasource config
```

## Key Design Decisions

### Prisma 7
Prisma 7 requires a database adapter. This project uses `@prisma/adapter-pg` for PostgreSQL. The datasource URL is configured via `prisma.config.ts` (not the schema file, which changed in Prisma 7).

### Astrology Engine
All calculations are deterministic and serverless-friendly. Sun sign uses actual date ranges; moon and rising signs use deterministic algorithms from birth date/time for consistent varied results.

### Compatibility Scoring

Weighted from four components:
- Sign synastry (30%): a 12x12 classic astrology compatibility table
- Elemental harmony (25%): fire/air and earth/water affinities
- Emotional alignment (20%): similarity of emotional style traits
- Communication (15%): communication style overlap
- Stability (10%): elemental + modal balance

### Auth
NextAuth.js with JWT sessions. User IDs are embedded in the JWT token and propagated to the session via callbacks.

## Production Deployment

1. Set `NEXTAUTH_URL` to your production domain
2. Generate a strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
3. Provision a PostgreSQL database and set `DATABASE_URL`
4. Run `npx prisma migrate deploy`
5. Run `npm run build && npm start`
