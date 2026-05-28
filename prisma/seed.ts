/**
 * Seed 12 demo profiles — one for each zodiac sign — and pre-like every
 * real (non-seed) user so the logged-in user sees matches immediately.
 *
 * Run:  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ── Astrology helpers (self-contained — no Next.js path aliases) ─────────────

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "fire",   Leo: "fire",        Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth",     Capricorn: "earth",
  Gemini: "air",   Libra: "air",       Aquarius: "air",
  Cancer: "water", Scorpio: "water",   Pisces: "water",
};

const SIGN_MODALS: Record<string, string> = {
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal",  Capricorn: "cardinal",
  Taurus: "fixed",   Leo: "fixed",       Scorpio: "fixed",   Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable",   Sagittarius: "mutable", Pisces: "mutable",
};

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function norm360(x: number) { return ((x % 360) + 360) % 360; }

function getJulianDay(date: Date) {
  let Y = date.getUTCFullYear();
  let M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

function getSunSign(date: Date): string {
  const jd = getJulianDay(date);
  const T  = (jd - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M  = toRad(norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T));
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
           + 0.000289 * Math.sin(3 * M);
  return SIGNS[Math.floor(norm360(L0 + C) / 30)];
}

function getMoonSign(date: Date): string {
  const jd = getJulianDay(date);
  const T  = (jd - 2451545.0) / 36525;
  const Lm = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const Mm  = norm360(134.9633964 + 477198.8676313 * T + 0.0089970 * T * T);
  const Ms  = norm360(357.5291092 +  35999.0502909  * T - 0.0001536 * T * T);
  const F   = norm360( 93.2720950 + 483202.0175233  * T - 0.0036539 * T * T);
  const D   = norm360(297.8501921 + 445267.1114034  * T - 0.0018819 * T * T);
  const dL  =
      6.2888 * Math.sin(toRad(Mm))
    + 1.2740 * Math.sin(toRad(2 * D - Mm))
    + 0.6583 * Math.sin(toRad(2 * D))
    + 0.2136 * Math.sin(toRad(2 * Mm))
    - 0.1851 * Math.sin(toRad(Ms))
    - 0.1143 * Math.sin(toRad(2 * F))
    + 0.0588 * Math.sin(toRad(2 * D - 2 * Mm))
    + 0.0572 * Math.sin(toRad(2 * D - Ms - Mm))
    + 0.0533 * Math.sin(toRad(2 * D + Mm))
    + 0.0459 * Math.sin(toRad(2 * D - Ms));
  return SIGNS[Math.floor(norm360(Lm + dL) / 30)];
}

function getRisingSign(date: Date, birthTime?: string): string {
  if (!birthTime) {
    const jd = getJulianDay(date);
    return SIGNS[Math.floor(norm360(jd * 0.369) / 30)];
  }
  const [h, m] = birthTime.split(":").map(Number);
  if (isNaN(h)) return SIGNS[0];
  const jd  = getJulianDay(date) + (h - 12) / 24 + (m || 0) / 1440;
  const d   = jd - 2451545.0;
  const GMST = norm360(280.46061837 + 360.98564736629 * d);
  const e   = toRad(23.4393);
  const lat = toRad(40.0);
  const R   = toRad(GMST);
  let asc = Math.atan2(-Math.cos(R), Math.sin(R) * Math.cos(e) + Math.tan(lat) * Math.sin(e)) * (180 / Math.PI);
  asc = norm360(asc);
  const MC = norm360(Math.atan2(Math.sin(R) / Math.cos(e), Math.cos(R)) * (180 / Math.PI));
  if (((asc - MC + 360) % 360) < 180) asc = norm360(asc + 180);
  return SIGNS[Math.floor(asc / 30)];
}

const TRAITS: Record<string, { emotionalStyle: string; communicationStyle: string; relationshipNeeds: string; conflictStyle: string }> = {
  Aries: {
    emotionalStyle: "You experience emotions with startling immediacy — joy arrives like a flash of lightning, and frustration burns just as bright before fading just as fast. Your emotional life is vivid and unfiltered.",
    communicationStyle: "You speak with the confidence of someone who has already made up their mind. Directness is your native tongue — you find diplomatic hedging exhausting and would rather say the difficult thing plainly.",
    relationshipNeeds: "You need a partner who can match your energy and hold their own ground — someone who will push back rather than simply agreeing. Independence matters enormously to you.",
    conflictStyle: "You prefer to fight fast and make up faster. You say exactly what's bothering you — sometimes too bluntly — and genuinely don't understand why others hold onto grievances after the air is cleared.",
  },
  Taurus: {
    emotionalStyle: "Your emotional life is rich and steady, like a well-tended garden. You don't fall into feelings quickly, but once you do, they root deeply and hold. You are remarkably stable under pressure.",
    communicationStyle: "You are deliberate and unhurried in speech, choosing your words with the same care you choose everything else. You don't fill silence with empty words, which means when you do speak, people listen.",
    relationshipNeeds: "Security is the ground you build everything on — emotional security, physical presence, a sense that your partner is truly there and not going anywhere. You need loyalty demonstrated through action.",
    conflictStyle: "You avoid conflict instinctively and can hold your peace for longer than almost anyone. When you do reach your limit, the response can surprise people who assumed your patience was infinite.",
  },
  Gemini: {
    emotionalStyle: "Your inner life is a conversation with yourself — quick, branching, perpetually interesting. You feel things intellectually as much as viscerally, reaching for language to understand what you're experiencing.",
    communicationStyle: "Words are your element and you move through them like water. You can talk to anyone about anything and genuinely mean it. Your mind makes connections others miss.",
    relationshipNeeds: "You need someone who can keep up mentally and who doesn't confuse your restlessness for inconsistency. Novelty matters — you want a partner who brings new ideas and new ways of seeing familiar things.",
    conflictStyle: "You tend to intellectualize conflict, analyzing what went wrong rather than sitting with the discomfort of having felt it. This is both a strength and an occasional weakness.",
  },
  Cancer: {
    emotionalStyle: "Your emotional life is vast and tidal — feelings arrive in waves, recede, and return changed. You are one of the most deeply feeling signs, with an intuitive attunement to the emotional temperature of any room.",
    communicationStyle: "You communicate through subtext as much as through direct speech. In close relationships, you open fully and speak with remarkable vulnerability; with strangers you stay behind a pleasant warmth.",
    relationshipNeeds: "Emotional safety is not optional for you — it is the entire foundation. You need to know that your partner sees your sensitivity not as a liability but as one of your most remarkable qualities.",
    conflictStyle: "You tend to withdraw when hurt, retreating into yourself until you've processed enough to speak. This can be mistaken for sulking, but it's more like digestion.",
  },
  Leo: {
    emotionalStyle: "You feel everything with operatic intensity — love is luminous, disappointment is volcanic, and pride runs like bedrock underneath it all. When you are happy, you want everyone around you to feel that warmth.",
    communicationStyle: "You command a room without trying. You're an excellent storyteller, generous with praise, and you have a gift for making people feel seen in conversation.",
    relationshipNeeds: "You need a partner who sees you — really sees you — and isn't threatened by your shine. Admiration from someone you deeply respect means the world to you, and you return it generously.",
    conflictStyle: "You confront rather than avoid, and you do it with surprising directness. Your pride can make it difficult to initiate reconciliation even when you want to. But when you do apologize, it's genuine.",
  },
  Virgo: {
    emotionalStyle: "Your emotional life is conducted largely through action — you show what you feel by how carefully you attend to things. You feel deeply but process privately, often translating feeling into analysis.",
    communicationStyle: "You are precise and thoughtful, someone who actually means exactly what they say. You have a dry wit that surfaces unexpectedly and a gift for articulating complexity.",
    relationshipNeeds: "You need a partner who appreciates the substance beneath your reserve — someone who understands that your gestures of service are love letters in disguise.",
    conflictStyle: "You tend to critique before you comfort, which can complicate moments where a partner just needs to feel understood. You're drawn to solving problems, which is genuinely useful.",
  },
  Libra: {
    emotionalStyle: "You experience emotions through the lens of relationship — how you feel is often inseparable from how things are between you and someone you care about. You have a finely tuned sense of fairness.",
    communicationStyle: "You are a natural diplomat who finds the language that makes difficult things land well. Your conversational style is elegant — you make people feel respected.",
    relationshipNeeds: "Partnership is not a preference for you — it's a medium through which you understand yourself. You flourish with someone who values collaboration and beauty in the same breath.",
    conflictStyle: "You avoid direct confrontation instinctively, tending toward accommodation. This can defer rather than resolve tension, allowing resentment to build quietly below a surface that looks fine.",
  },
  Scorpio: {
    emotionalStyle: "Your emotional world is the deepest water — still on the surface, and essentially bottomless. You feel things with an intensity that would overwhelm most people, and you've learned to carry it quietly.",
    communicationStyle: "You say less than you know, always. You ask questions that go to the heart of things and are remarkably perceptive about when someone is telling partial truths.",
    relationshipNeeds: "You need total honesty — not just the performed version of it, but the kind that goes to uncomfortable places. Depth is non-negotiable: you'd rather have one true thing than a hundred pleasant surfaces.",
    conflictStyle: "You process conflict in private before you bring it to the surface. You can hold onto grievances for a long time, and you do not forgive quickly or superficially.",
  },
  Sagittarius: {
    emotionalStyle: "Your emotional nature is buoyant and expansive — you move toward joy the way a plant moves toward light, and you have a genuine philosophical resilience that lets you find meaning even in difficulty.",
    communicationStyle: "You speak with an enthusiasm that's completely genuine. You are the person who says the thing everyone else was thinking, with a bluntness that is equal parts liberating and alarming.",
    relationshipNeeds: "Freedom isn't a preference — it's a requirement. You need a partner who is expansive rather than restrictive, who has their own inner world and invites you into it.",
    conflictStyle: "You prefer to address conflict head-on and then put it behind you. You don't hold grudges because it feels genuinely like a waste of the time you could be spending on something interesting.",
  },
  Capricorn: {
    emotionalStyle: "Your emotional life is disciplined, purposeful, and deeply felt beneath a composed exterior. You tend to manage before you express — working through feelings privately, measuring them against your expectations.",
    communicationStyle: "You communicate with precision and economy — you say what you mean, mean what you say. Your humor is dry, earned, and lands at exactly the right moment.",
    relationshipNeeds: "You need a partner who takes the relationship as seriously as you do — someone who shows up, follows through, and understands that building something real takes time and intention.",
    conflictStyle: "You handle conflict with the same strategic patience you apply to everything else. You rarely explode, preferring to let things develop to the point where you have a full picture before speaking.",
  },
  Aquarius: {
    emotionalStyle: "Your emotional life is philosophically inflected — you tend to understand your feelings before you feel them. Your loyalty, once engaged, is unwavering and genuinely rare.",
    communicationStyle: "You are a natural contrarian who follows an argument wherever it leads regardless of social comfort, which makes you either invigorating or exhausting depending on the day.",
    relationshipNeeds: "You need intellectual compatibility above almost everything else — a partner who can match you in ideas, challenge your thinking, and respect your need for autonomy.",
    conflictStyle: "You handle conflict conceptually, analyzing the situation from multiple angles with admirable objectivity. You need a partner who will meet you somewhere in the middle emotionally.",
  },
  Pisces: {
    emotionalStyle: "Your emotional world has no hard edges — you feel other people's feelings almost as readily as your own. You have an inner life of unusual richness, fueled by intuition, dream, and sensitivity.",
    communicationStyle: "You communicate in impressions as much as words. You are a listener of rare depth, genuinely absorbed in what someone is telling you, and people feel this.",
    relationshipNeeds: "You need a partner who can hold you gently — someone who appreciates your sensitivity without trying to harden you, and who has enough groundedness to offer when the world becomes too much.",
    conflictStyle: "You tend to absorb rather than deflect — you take on the emotional weight of a conflict, often feeling responsible for things that aren't yours to carry. Direct confrontation doesn't come naturally.",
  },
};

function buildAstroProfile(birthDate: Date, birthTime?: string) {
  const sun    = getSunSign(birthDate);
  const moon   = getMoonSign(birthDate);
  const rising = getRisingSign(birthDate, birthTime);

  const ec: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  ec[SIGN_ELEMENTS[sun]]    += 2;
  ec[SIGN_ELEMENTS[moon]]   += 1;
  ec[SIGN_ELEMENTS[rising]] += 1;
  const elementScores = {
    fire:  Math.round((ec.fire  / 4) * 100),
    earth: Math.round((ec.earth / 4) * 100),
    air:   Math.round((ec.air   / 4) * 100),
    water: Math.round((ec.water / 4) * 100),
  };

  const mc: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  mc[SIGN_MODALS[sun]]    += 2;
  mc[SIGN_MODALS[moon]]   += 1;
  mc[SIGN_MODALS[rising]] += 1;
  const modalScores = {
    cardinal: Math.round((mc.cardinal / 4) * 100),
    fixed:    Math.round((mc.fixed    / 4) * 100),
    mutable:  Math.round((mc.mutable  / 4) * 100),
  };

  return { sunSign: sun, moonSign: moon, risingSign: rising, elementScores, modalScores, traits: TRAITS[sun] };
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_EMAILS = [
  "aria.bellini@starcross.demo",
  "luna.park@starcross.demo",
  "maya.chen@starcross.demo",
  "sophia.laurent@starcross.demo",
  "zara.williams@starcross.demo",
  "isabel.torres@starcross.demo",
  "celeste.moreau@starcross.demo",
  "nadia.vasquez@starcross.demo",
  "kai.nakamura@starcross.demo",
  "elena.petrov@starcross.demo",
  "jasmine.osei@starcross.demo",
  "river.santos@starcross.demo",
];

interface SeedProfile {
  email: string;
  name: string;
  birthDate: Date;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  gender: string;
  bio: string;
  interests: string[];
}

const SEED_PROFILES: SeedProfile[] = [
  // 1 ── Aries — Apr 10 ────────────────────────────────────────────────────────
  {
    email: "aria.bellini@starcross.demo",
    name: "Aria Bellini",
    birthDate: new Date("1997-04-10"),
    birthTime: "14:30",
    birthCity: "Florence",
    birthCountry: "Italy",
    gender: "Woman",
    bio: "Fashion designer with an obsession for Renaissance art and modern chaos. I sketch on trains, argue about pasta shapes, and think the best conversations happen over terrible wine at 1am. My apartment is half studio, half jungle.",
    interests: ["Fashion design", "Art history", "Travel", "Wine", "Sketching", "Photography", "Architecture", "Cooking Italian food"],
  },

  // 2 ── Taurus — May 5 ────────────────────────────────────────────────────────
  {
    email: "luna.park@starcross.demo",
    name: "Luna Park",
    birthDate: new Date("1994-05-05"),
    birthTime: "09:15",
    birthCity: "Seoul",
    birthCountry: "South Korea",
    gender: "Woman",
    bio: "Pastry chef, reluctant morning person, plant hoarder. I believe in slow Sundays, butter in everything, and desserts that make people cry a little. Currently perfecting a kouign-amann recipe that is genuinely ruining my sleep.",
    interests: ["Baking", "Ceramics", "Plants", "Yoga", "K-dramas", "Hiking", "Reading", "Farmers markets"],
  },

  // 3 ── Gemini — Jun 5 ────────────────────────────────────────────────────────
  {
    email: "maya.chen@starcross.demo",
    name: "Maya Chen",
    birthDate: new Date("1998-06-05"),
    birthTime: "18:45",
    birthCity: "San Francisco",
    birthCountry: "USA",
    gender: "Woman",
    bio: "Investigative journalist who writes about tech and power. I have too many browser tabs open at all times, an alarming amount of opinions about fonts, and a habit of turning small talk into long conversations. I am exactly as curious as I am annoying about it.",
    interests: ["Journalism", "Podcasts", "Rock climbing", "Chess", "Coffee shops", "Bookstores", "Live music", "Cycling"],
  },

  // 4 ── Cancer — Jul 10 ───────────────────────────────────────────────────────
  {
    email: "sophia.laurent@starcross.demo",
    name: "Sophia Laurent",
    birthDate: new Date("1995-07-10"),
    birthTime: "22:00",
    birthCity: "Paris",
    birthCountry: "France",
    gender: "Woman",
    bio: "Therapist and occasional novelist. I think a lot about what makes people feel safe — in therapy and in relationships. I'm deeply domestic and mildly unhinged about sourdough. My friends say I'm the one who remembers how you take your coffee without asking.",
    interests: ["Psychology", "Writing", "Sourdough", "Films", "Museums", "Gardening", "Swimming", "Cooking for others"],
  },

  // 5 ── Leo — Aug 5 ───────────────────────────────────────────────────────────
  {
    email: "zara.williams@starcross.demo",
    name: "Zara Williams",
    birthDate: new Date("1996-08-05"),
    birthTime: "06:30",
    birthCity: "London",
    birthCountry: "UK",
    gender: "Woman",
    bio: "Stage actress who moonlights as a very loud brunch enthusiast. I'll quote Shakespeare at you and mean it. I genuinely like karaoke. I make playlists for situations that haven't happened yet. Not everyone can handle that. You should be warned.",
    interests: ["Theatre", "Karaoke", "Brunch", "Screenwriting", "Dance", "Vintage clothes", "Travelling solo", "Podcasting"],
  },

  // 6 ── Virgo — Sep 5 ─────────────────────────────────────────────────────────
  {
    email: "isabel.torres@starcross.demo",
    name: "Isabel Torres",
    birthDate: new Date("1993-09-05"),
    birthTime: "11:00",
    birthCity: "Barcelona",
    birthCountry: "Spain",
    gender: "Woman",
    bio: "Architect who thinks about public space for a living and rearranges furniture for fun. I'm precise in the way that means I'll notice if something is two degrees off — but I'll also build you something beautiful from scratch. My love language is probably spreadsheets.",
    interests: ["Architecture", "Urban design", "Cycling", "Tapas", "Drawing", "Minimalism", "Running", "Philosophy books"],
  },

  // 7 ── Libra — Oct 10 ────────────────────────────────────────────────────────
  {
    email: "celeste.moreau@starcross.demo",
    name: "Celeste Moreau",
    birthDate: new Date("1999-10-10"),
    birthTime: "16:20",
    birthCity: "Montréal",
    birthCountry: "Canada",
    gender: "Woman",
    bio: "Art curator and recovering perfectionist. I spend my days thinking about how objects carry meaning across centuries and my evenings being completely unable to choose a restaurant. I am very good at making things look beautiful. I am less good at making decisions.",
    interests: ["Contemporary art", "Curating", "Vintage shopping", "Wine pairing", "Ballet", "French cinema", "Interior design", "Long dinners"],
  },

  // 8 ── Scorpio — Nov 10 ──────────────────────────────────────────────────────
  {
    email: "nadia.vasquez@starcross.demo",
    name: "Nadia Vasquez",
    birthDate: new Date("1995-11-10"),
    birthTime: "03:45",
    birthCity: "Buenos Aires",
    birthCountry: "Argentina",
    gender: "Woman",
    bio: "Documentary filmmaker. I mostly make films about things people would rather not talk about. I'm an excellent listener and a suspicious question-asker. My apartment has one very dramatic lamp and every book I've ever touched.",
    interests: ["Filmmaking", "Tango", "Investigative journalism", "Philosophy", "Late nights", "Reading", "Photography", "Political theory"],
  },

  // 9 ── Sagittarius — Dec 5 ───────────────────────────────────────────────────
  {
    email: "kai.nakamura@starcross.demo",
    name: "Kai Nakamura",
    birthDate: new Date("1994-12-05"),
    birthTime: "20:10",
    birthCity: "Tokyo",
    birthCountry: "Japan",
    gender: "Non-binary",
    bio: "Travel photographer and accidental philosopher. I've photographed 34 countries and still don't fully understand any of them. I'm happiest in transit — airports, overnight trains, anywhere that's between places. I'll always say yes to one more adventure.",
    interests: ["Photography", "Hiking", "Travel", "Street food", "Meditation", "Surfing", "Journalism", "Collecting maps"],
  },

  // 10 ── Capricorn — Jan 10 ───────────────────────────────────────────────────
  {
    email: "elena.petrov@starcross.demo",
    name: "Elena Petrov",
    birthDate: new Date("1992-01-10"),
    birthTime: "08:00",
    birthCity: "Berlin",
    birthCountry: "Germany",
    gender: "Woman",
    bio: "Climate tech founder. I spend most of my time trying to solve things and a smaller but meaningful amount of time trying not to take myself too seriously. I believe in cold plunges, strong coffee, and making things that last. Weekends are when I become a different and slightly better person.",
    interests: ["Climate tech", "Swimming", "Chess", "Sauna", "Business strategy", "Mountain climbing", "Documentary films", "Cooking German food"],
  },

  // 11 ── Aquarius — Feb 10 ────────────────────────────────────────────────────
  {
    email: "jasmine.osei@starcross.demo",
    name: "Jasmine Osei",
    birthDate: new Date("1998-02-10"),
    birthTime: "13:30",
    birthCity: "Accra",
    birthCountry: "Ghana",
    gender: "Woman",
    bio: "AI researcher and weekend DJ. I think about the future a lot — both professionally and, fine, existentially. I like ideas more than most people and find most ideas disappointing, so it evens out. I am surprisingly good company once you get past the part where I argue with everything you say.",
    interests: ["AI research", "DJing", "Afrobeats", "Football", "Writing", "Tech ethics", "Running", "Cooking Ghanaian food"],
  },

  // 12 ── Pisces — Mar 10 ──────────────────────────────────────────────────────
  {
    email: "river.santos@starcross.demo",
    name: "River Santos",
    birthDate: new Date("1997-03-10"),
    birthTime: "17:45",
    birthCity: "Rio de Janeiro",
    birthCountry: "Brazil",
    gender: "Non-binary",
    bio: "Composer and sound designer for film. I think music is how you say the thing you couldn't otherwise say. I spend a lot of time alone in the studio and a lot of time wanting not to be. I swim in the ocean before dawn when the city is quiet. It is the best decision I make every day.",
    interests: ["Music composition", "Film scoring", "Ocean swimming", "Poetry", "Yoga", "Philosophy", "Jazz", "Learning Portuguese literature"],
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌟 StarCross seed starting…\n");

  const passwordHash = await bcrypt.hash("starcross123", 10);
  const createdIds: string[] = [];

  for (const p of SEED_PROFILES) {
    const astro = buildAstroProfile(p.birthDate, p.birthTime);

    // Upsert: skip if user already exists
    const existing = await prisma.user.findUnique({ where: { email: p.email } });

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Update profile & astrology with fresh data
      await prisma.profile.updateMany({
        where: { userId },
        data: {
          name: p.name,
          birthDate: p.birthDate,
          birthTime: p.birthTime,
          birthCity: p.birthCity,
          birthCountry: p.birthCountry,
          gender: p.gender,
          prefGenders: "any",
          prefAgeMin: 18,
          prefAgeMax: 50,
          bio: p.bio,
          interests: JSON.stringify(p.interests),
        },
      });
      await prisma.astrologyProfile.updateMany({
        where: { userId },
        data: {
          sunSign: astro.sunSign,
          moonSign: astro.moonSign,
          risingSign: astro.risingSign,
          elementScores: JSON.stringify(astro.elementScores),
          modalScores: JSON.stringify(astro.modalScores),
          traits: JSON.stringify(astro.traits),
        },
      });
      console.log(`  ↩  ${p.name} — updated`);
    } else {
      const user = await prisma.user.create({
        data: {
          email: p.email,
          passwordHash,
          profile: {
            create: {
              name: p.name,
              birthDate: p.birthDate,
              birthTime: p.birthTime,
              birthCity: p.birthCity,
              birthCountry: p.birthCountry,
              gender: p.gender,
              prefGenders: "any",
              prefAgeMin: 18,
              prefAgeMax: 50,
              bio: p.bio,
              interests: JSON.stringify(p.interests),
            },
          },
          astrologyProfile: {
            create: {
              sunSign: astro.sunSign,
              moonSign: astro.moonSign,
              risingSign: astro.risingSign,
              elementScores: JSON.stringify(astro.elementScores),
              modalScores: JSON.stringify(astro.modalScores),
              traits: JSON.stringify(astro.traits),
            },
          },
        },
      });
      userId = user.id;
      console.log(`  ✦  ${p.name} (${astro.sunSign} ☉ / ${astro.moonSign} ☽ / ${astro.risingSign} ↑)`);
    }

    createdIds.push(userId);
  }

  // ── Pre-like all real (non-seed) users ───────────────────────────────────────
  const realUsers = await prisma.user.findMany({
    where: {
      email: { notIn: SEED_EMAILS },
      profile:          { isNot: null },
      astrologyProfile: { isNot: null },
    },
    select: { id: true, email: true },
  });

  if (realUsers.length > 0) {
    console.log(`\n  💫 Pre-liking ${realUsers.length} real user(s) from all seed profiles…`);
    for (const seedId of createdIds) {
      for (const real of realUsers) {
        await prisma.swipe.upsert({
          where: { fromUserId_toUserId: { fromUserId: seedId, toUserId: real.id } },
          create: { fromUserId: seedId, toUserId: real.id, direction: "like" },
          update: {},
        });
      }
    }
    console.log(`  ✓  Done — every seed profile has liked: ${realUsers.map((u) => u.email).join(", ")}`);
  } else {
    console.log("\n  ℹ  No real users found yet — sign up first, then re-run the seed to enable instant matching.");
  }

  console.log("\n✅ Seed complete!\n");
  console.log("  12 profiles created. Login password for any seed account: starcross123");
  console.log("  Emails: aria, luna, maya, sophia, zara, isabel, celeste, nadia, kai, elena, jasmine, river — all @starcross.demo\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
