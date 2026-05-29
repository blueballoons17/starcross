/**
 * Creates mutual matches between the real user and all seed profiles.
 * Run with: npx tsx scripts/create-matches.ts
 */
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { calculateCompatibility } from "../lib/matching";
import type { AstrologyResult } from "../lib/astrology";

dotenv.config({ path: ".env" });

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({
  adapter,
} as ConstructorParameters<typeof PrismaClient>[0]);

async function run() {
  // Find all real (non-seed) users with a full profile
  const realUsers = await prisma.user.findMany({
    where: {
      email: { not: { contains: "starcross.demo" } },
      profile: { isNot: null },
      astrologyProfile: { isNot: null },
    },
    include: { profile: true, astrologyProfile: true },
  });

  // Find all seed users
  const seedUsers = await prisma.user.findMany({
    where: {
      email: { contains: "starcross.demo" },
      profile: { isNot: null },
      astrologyProfile: { isNot: null },
    },
    include: { profile: true, astrologyProfile: true },
  });

  console.log(`Real users: ${realUsers.length}, Seed users: ${seedUsers.length}`);

  let created = 0;
  let skipped = 0;

  for (const realUser of realUsers) {
    for (const seedUser of seedUsers) {
      const [userAId, userBId] = [realUser.id, seedUser.id].sort();

      const existing = await prisma.match.findUnique({
        where: { userAId_userBId: { userAId, userBId } },
      });
      if (existing) { skipped++; continue; }

      // Ensure mutual swipes exist
      await prisma.swipe.upsert({
        where: { fromUserId_toUserId: { fromUserId: seedUser.id, toUserId: realUser.id } },
        create: { fromUserId: seedUser.id, toUserId: realUser.id, direction: "like" },
        update: {},
      });
      await prisma.swipe.upsert({
        where: { fromUserId_toUserId: { fromUserId: realUser.id, toUserId: seedUser.id } },
        create: { fromUserId: realUser.id, toUserId: seedUser.id, direction: "like" },
        update: {},
      });

      // Calculate compatibility
      const rawA = realUser.astrologyProfile!;
      const rawB = seedUser.astrologyProfile!;

      const astroA: AstrologyResult = {
        signs: { sun: rawA.sunSign, moon: rawA.moonSign, rising: rawA.risingSign },
        elements: JSON.parse(rawA.elementScores as string),
        modals: JSON.parse(rawA.modalScores as string),
        traits: JSON.parse(rawA.traits as string),
      };
      const astroB: AstrologyResult = {
        signs: { sun: rawB.sunSign, moon: rawB.moonSign, rising: rawB.risingSign },
        elements: JSON.parse(rawB.elementScores as string),
        modals: JSON.parse(rawB.modalScores as string),
        traits: JSON.parse(rawB.traits as string),
      };

      const compat = calculateCompatibility(astroA, astroB);
      const breakdownStr = JSON.stringify({
        ...compat.breakdown,
        explanation: compat.explanation,
        strengths: compat.strengths,
        frictionPoints: compat.frictionPoints,
      });

      await prisma.match.create({
        data: { userAId, userBId, matchScore: compat.matchScore, breakdown: breakdownStr },
      });

      console.log(`  ✓ ${realUser.profile!.name} ↔ ${seedUser.profile!.name} (${Math.round(compat.matchScore)}%)`);
      created++;
    }
  }

  // Also create matches between seed users for inter-seed chatting
  for (let i = 0; i < seedUsers.length; i++) {
    for (let j = i + 1; j < seedUsers.length; j++) {
      const a = seedUsers[i];
      const b = seedUsers[j];
      const [userAId, userBId] = [a.id, b.id].sort();

      const existing = await prisma.match.findUnique({
        where: { userAId_userBId: { userAId, userBId } },
      });
      if (existing) { skipped++; continue; }

      await prisma.swipe.upsert({
        where: { fromUserId_toUserId: { fromUserId: a.id, toUserId: b.id } },
        create: { fromUserId: a.id, toUserId: b.id, direction: "like" },
        update: {},
      });
      await prisma.swipe.upsert({
        where: { fromUserId_toUserId: { fromUserId: b.id, toUserId: a.id } },
        create: { fromUserId: b.id, toUserId: a.id, direction: "like" },
        update: {},
      });

      const rawA = a.astrologyProfile!;
      const rawB = b.astrologyProfile!;
      const astroA: AstrologyResult = {
        signs: { sun: rawA.sunSign, moon: rawA.moonSign, rising: rawA.risingSign },
        elements: JSON.parse(rawA.elementScores as string),
        modals: JSON.parse(rawA.modalScores as string),
        traits: JSON.parse(rawA.traits as string),
      };
      const astroB: AstrologyResult = {
        signs: { sun: rawB.sunSign, moon: rawB.moonSign, rising: rawB.risingSign },
        elements: JSON.parse(rawB.elementScores as string),
        modals: JSON.parse(rawB.modalScores as string),
        traits: JSON.parse(rawB.traits as string),
      };

      const compat = calculateCompatibility(astroA, astroB);
      const breakdownStr = JSON.stringify({
        ...compat.breakdown,
        explanation: compat.explanation,
        strengths: compat.strengths,
        frictionPoints: compat.frictionPoints,
      });

      await prisma.match.create({
        data: { userAId, userBId, matchScore: compat.matchScore, breakdown: breakdownStr },
      });

      console.log(`  ✓ ${a.profile!.name} ↔ ${b.profile!.name} (seed↔seed)`);
      created++;
    }
  }

  console.log(`\nDone. Created ${created} new matches, skipped ${skipped} existing.`);
  await prisma.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
