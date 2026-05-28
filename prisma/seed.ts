import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface SeedUser {
  email: string;
  name: string;
  birthDate: Date;
  birthTime?: string;
  birthCity: string;
  birthCountry: string;
  gender: string;
  prefGenders: string; // comma-separated string for SQLite
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const SIGN_MODALS: Record<string, string> = {
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable",
};

const TRAIT_PROFILES: Record<string, {
  emotionalStyle: string;
  communicationStyle: string;
  relationshipNeeds: string;
  conflictStyle: string;
}> = {
  Aries: {
    emotionalStyle: "You experience emotions with startling immediacy — joy arrives like a flash of lightning, and frustration burns just as bright before fading just as fast. Your emotional life is vivid and unfiltered, never lingering in ambiguity when action seems possible. You feel things fully in the moment, then move on with characteristic speed, rarely carrying grudges because life is simply too interesting to stay in one feeling for long.",
    communicationStyle: "You speak with the confidence of someone who has already made up their mind, which can be magnetic and occasionally alarming in equal measure. Directness is your native tongue — you find diplomatic hedging exhausting and would rather say the difficult thing plainly than dance around it for hours. You're energized by spirited debate and often think out loud, letting your ideas sharpen through collision with others.",
    relationshipNeeds: "You need a partner who can match your energy and hold their own ground — someone who will push back rather than simply agreeing, because for you, a little creative friction keeps the spark alive. Independence matters enormously to you, and you flourish when your partner trusts you rather than tries to contain you. You give fiercely and expect that fire to be returned.",
    conflictStyle: "You prefer to fight fast and make up faster. You say exactly what's bothering you — sometimes too bluntly — and genuinely don't understand why others hold onto grievances after the air is cleared.",
  },
  Taurus: {
    emotionalStyle: "Your emotional life is rich and steady, like a well-tended garden. You don't fall into feelings quickly, but once you do, they root deeply and hold. You are remarkably stable under pressure, offering others a sense of calm they didn't know they needed.",
    communicationStyle: "You are deliberate and unhurried in speech, choosing your words with the same care you choose everything else. You don't fill silence with empty words, which means when you do speak, people listen.",
    relationshipNeeds: "Security is the ground you build everything on — emotional security, physical presence, a sense that your partner is truly there and not going anywhere. You need loyalty demonstrated through action, not just words.",
    conflictStyle: "You avoid conflict instinctively and can hold your peace for longer than almost anyone — perhaps too long. When you do reach your limit, the response can surprise people who assumed your patience was infinite.",
  },
  Gemini: {
    emotionalStyle: "Your inner life is a conversation with yourself — quick, branching, perpetually interesting. You feel things intellectually as much as viscerally, reaching for language to understand what you're experiencing.",
    communicationStyle: "Words are your element and you move through them like water. You can talk to anyone about anything, and you genuinely mean it — you find most people interesting if you can find the right angle.",
    relationshipNeeds: "You need someone who can keep up mentally and who doesn't confuse your restlessness for inconsistency. Novelty matters — you want a partner who brings new ideas and new ways of seeing familiar things.",
    conflictStyle: "You tend to intellectualize conflict, analyzing what went wrong rather than sitting with the discomfort of having felt it. This is both a strength and an occasional weakness.",
  },
  Cancer: {
    emotionalStyle: "Your emotional life is vast and tidal — feelings arrive in waves, recede, and return changed. You are one of the most deeply feeling signs, with an intuitive attunement to the emotional temperature of any room.",
    communicationStyle: "You communicate through subtext as much as through direct speech — a carefully chosen word, a gesture, a thoughtful memory brought up at the right moment. In close relationships, you open fully and speak with remarkable vulnerability.",
    relationshipNeeds: "Emotional safety is not optional for you — it is the entire foundation. You need to know that your partner sees your sensitivity not as a liability but as one of your most remarkable qualities.",
    conflictStyle: "You tend to withdraw when hurt, retreating into yourself until you've processed enough to speak. This can be mistaken for sulking, but it's more like digestion — you need to understand what happened before you can discuss it.",
  },
  Leo: {
    emotionalStyle: "You feel everything with operatic intensity — love is luminous, disappointment is volcanic, and pride runs like bedrock underneath it all. You are not performative with your emotions so much as genuinely constitutionally unable to do small.",
    communicationStyle: "You command a room without trying, and it's not only charisma — it's the unmistakable sense that you actually mean what you're saying. You're an excellent storyteller, generous with praise.",
    relationshipNeeds: "You need a partner who sees you — really sees you — and isn't threatened by your shine. Admiration from someone you deeply respect means the world to you, and you return it generously.",
    conflictStyle: "You confront rather than avoid, and you do it with surprising directness. You need to know that the relationship is worth fighting for, so you fight. Your pride can make it difficult to initiate reconciliation even when you want to.",
  },
  Virgo: {
    emotionalStyle: "Your emotional life is conducted largely through action — you show what you feel by how carefully you attend to things. You feel deeply but process privately, often translating feeling into analysis before it reaches the surface.",
    communicationStyle: "You are precise and thoughtful, someone who actually means exactly what they say and notices when others don't. You have a dry wit that surfaces unexpectedly and a gift for articulating complexity.",
    relationshipNeeds: "You need a partner who appreciates the substance beneath your reserve — someone who understands that your gestures of service are love letters in disguise. You want to be genuinely useful to the people you care about.",
    conflictStyle: "You tend to critique before you comfort, which can complicate moments where a partner just needs to feel understood. You're drawn to solving problems, which is genuinely useful, but in conflict it can come across as clinical.",
  },
  Libra: {
    emotionalStyle: "You experience emotions through the lens of relationship — how you feel is often inseparable from how things are between you and someone you care about. You have a finely tuned sense of fairness.",
    communicationStyle: "You are a natural diplomat who finds the language that makes difficult things land well. You tend to present multiple sides before you land on your own, which can read as indecisive but is actually a genuine attempt to be fair.",
    relationshipNeeds: "Partnership is not a preference for you — it's a medium through which you understand yourself. You flourish with someone who values collaboration and beauty in the same breath.",
    conflictStyle: "You avoid direct confrontation instinctively, tending toward accommodation and hoping things will smooth themselves out. This can defer rather than resolve tension.",
  },
  Scorpio: {
    emotionalStyle: "Your emotional world is the deepest water — still on the surface, and essentially bottomless. You feel things with an intensity that would overwhelm most people, and you've learned to carry it quietly.",
    communicationStyle: "You say less than you know, always, and the gap between what you observe and what you reveal is significant and intentional. You ask questions that go to the heart of things.",
    relationshipNeeds: "You need total honesty — not just the performed version of it, but the kind that goes to uncomfortable places. Depth is non-negotiable: you'd rather have one true thing than a hundred pleasant surfaces.",
    conflictStyle: "You process conflict in private before you bring it to the surface, and by the time you do, you've understood it thoroughly. You can hold onto grievances for a long time, and you do not forgive quickly or superficially.",
  },
  Sagittarius: {
    emotionalStyle: "Your emotional nature is buoyant and expansive — you move toward joy the way a plant moves toward light, and you have a genuine philosophical resilience that lets you find meaning even in difficulty.",
    communicationStyle: "You speak with an enthusiasm that's completely genuine and occasionally completely overwhelming. You are the person who says the thing everyone else was thinking, with a bluntness that is equal parts liberating and alarming.",
    relationshipNeeds: "Freedom isn't a preference — it's a requirement. You need a partner who is expansive rather than restrictive, who has their own inner world and invites you into it.",
    conflictStyle: "You prefer to address conflict head-on and then put it behind you. You don't hold grudges because it feels genuinely like a waste of the time you could be spending on something interesting.",
  },
  Capricorn: {
    emotionalStyle: "Your emotional life is disciplined, purposeful, and deeply felt beneath a composed exterior. You tend to manage before you express — working through feelings privately, measuring them against your expectations.",
    communicationStyle: "You communicate with precision and economy — you say what you mean, mean what you say, and genuinely don't understand why others require three passes to arrive at a point.",
    relationshipNeeds: "You need a partner who takes the relationship as seriously as you do — someone who shows up, follows through, and understands that building something real takes time and intention.",
    conflictStyle: "You handle conflict with the same strategic patience you apply to everything else. You rarely explode, preferring to let things develop to the point where you have a full picture before speaking.",
  },
  Aquarius: {
    emotionalStyle: "Your emotional life is philosophically inflected — you tend to understand your feelings before you feel them, which is both a remarkable talent and an occasional way of keeping yourself at arm's length from the full experience.",
    communicationStyle: "You are a natural contrarian who follows an argument wherever it leads regardless of social comfort, which makes you either invigorating or exhausting depending on the day.",
    relationshipNeeds: "You need intellectual compatibility above almost everything else — a partner who can match you in ideas, challenge your thinking, and respect your need for autonomy.",
    conflictStyle: "You handle conflict conceptually, analyzing the situation from multiple angles with admirable objectivity — and then, occasionally, with a detachment that leaves partners wondering if you care at all.",
  },
  Pisces: {
    emotionalStyle: "Your emotional world has no hard edges — you feel other people's feelings almost as readily as your own, and the boundary between empathy and absorption is something you navigate daily.",
    communicationStyle: "You communicate in impressions as much as words — through metaphor, through the quality of your attention, through what you choose not to say. You are a listener of rare depth.",
    relationshipNeeds: "You need a partner who can hold you gently — someone who appreciates your sensitivity without trying to harden you, and who has enough groundedness to offer when the world becomes too much.",
    conflictStyle: "You tend to absorb rather than deflect — you take on the emotional weight of a conflict, often feeling responsible for things that aren't yours to carry. You may withdraw when hurt, not from strategy but from genuine need to recover.",
  },
};

function getSunSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function getMoonSign(date: Date): string {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const yearOffset = (date.getFullYear() * 7) % 12;
  const index = (Math.floor(dayOfYear / 2.275) + yearOffset) % 12;
  return SIGNS[Math.abs(index)];
}

function getRisingSign(date: Date, birthTime?: string): string {
  if (birthTime) {
    const parts = birthTime.split(":");
    const hour = parseInt(parts[0], 10);
    if (!isNaN(hour)) {
      const index = Math.floor(hour / 2) % 12;
      const dayOfYear = Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
      );
      return SIGNS[(index + Math.floor(dayOfYear / 30)) % 12];
    }
  }
  const dayOffset = (date.getDate() * 3) % 12;
  const monthOffset = date.getMonth();
  return SIGNS[(dayOffset + monthOffset) % 12];
}

function calculateProfile(birthDate: Date, birthTime?: string) {
  const sun = getSunSign(birthDate);
  const moon = getMoonSign(birthDate);
  const rising = getRisingSign(birthDate, birthTime);

  const elementCounts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  elementCounts[SIGN_ELEMENTS[sun]] += 2;
  elementCounts[SIGN_ELEMENTS[moon]] += 1;
  elementCounts[SIGN_ELEMENTS[rising]] += 1;
  const elementScores = {
    fire: Math.round((elementCounts.fire / 4) * 100),
    earth: Math.round((elementCounts.earth / 4) * 100),
    air: Math.round((elementCounts.air / 4) * 100),
    water: Math.round((elementCounts.water / 4) * 100),
  };

  const modalCounts: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  modalCounts[SIGN_MODALS[sun]] += 2;
  modalCounts[SIGN_MODALS[moon]] += 1;
  modalCounts[SIGN_MODALS[rising]] += 1;
  const modalScores = {
    cardinal: Math.round((modalCounts.cardinal / 4) * 100),
    fixed: Math.round((modalCounts.fixed / 4) * 100),
    mutable: Math.round((modalCounts.mutable / 4) * 100),
  };

  const traits = TRAIT_PROFILES[sun];

  return { sunSign: sun, moonSign: moon, risingSign: rising, elementScores, modalScores, traits };
}

const SEED_USERS: SeedUser[] = [
  {
    email: "maya.chen@example.com",
    name: "Maya Chen",
    birthDate: new Date("1997-04-15"),
    birthTime: "14:30",
    birthCity: "San Francisco",
    birthCountry: "USA",
    gender: "Woman",
    prefGenders: "Men",
  },
  {
    email: "isabelle.martin@example.com",
    name: "Isabelle Martin",
    birthDate: new Date("1994-08-03"),
    birthTime: "09:15",
    birthCity: "Paris",
    birthCountry: "France",
    gender: "Woman",
    prefGenders: "Men,Non-binary people",
  },
  {
    email: "priya.sharma@example.com",
    name: "Priya Sharma",
    birthDate: new Date("1999-11-22"),
    birthTime: "21:00",
    birthCity: "Mumbai",
    birthCountry: "India",
    gender: "Woman",
    prefGenders: "Men",
  },
  {
    email: "sofia.reyes@example.com",
    name: "Sofia Reyes",
    birthDate: new Date("1996-02-14"),
    birthTime: "07:45",
    birthCity: "Buenos Aires",
    birthCountry: "Argentina",
    gender: "Woman",
    prefGenders: "Men,Women",
  },
  {
    email: "alice.nakamura@example.com",
    name: "Alice Nakamura",
    birthDate: new Date("1993-06-30"),
    birthTime: "16:20",
    birthCity: "Tokyo",
    birthCountry: "Japan",
    gender: "Woman",
    prefGenders: "Men",
  },
  {
    email: "zara.okonkwo@example.com",
    name: "Zara Okonkwo",
    birthDate: new Date("2000-09-08"),
    birthTime: "11:00",
    birthCity: "Lagos",
    birthCountry: "Nigeria",
    gender: "Woman",
    prefGenders: "Men",
  },
  {
    email: "james.carter@example.com",
    name: "James Carter",
    birthDate: new Date("1995-03-28"),
    birthTime: "18:00",
    birthCity: "London",
    birthCountry: "UK",
    gender: "Man",
    prefGenders: "Women",
  },
  {
    email: "lucas.dubois@example.com",
    name: "Lucas Dubois",
    birthDate: new Date("1992-07-19"),
    birthTime: "06:30",
    birthCity: "Lyon",
    birthCountry: "France",
    gender: "Man",
    prefGenders: "Women,Non-binary people",
  },
  {
    email: "ethan.walsh@example.com",
    name: "Ethan Walsh",
    birthDate: new Date("1998-01-05"),
    birthTime: "23:15",
    birthCity: "Dublin",
    birthCountry: "Ireland",
    gender: "Man",
    prefGenders: "Women",
  },
  {
    email: "ravi.patel@example.com",
    name: "Ravi Patel",
    birthDate: new Date("1991-12-12"),
    birthTime: "08:00",
    birthCity: "Ahmedabad",
    birthCountry: "India",
    gender: "Man",
    prefGenders: "Women",
  },
  {
    email: "marco.ferrari@example.com",
    name: "Marco Ferrari",
    birthDate: new Date("1997-05-21"),
    birthTime: "12:00",
    birthCity: "Milan",
    birthCountry: "Italy",
    gender: "Man",
    prefGenders: "Women",
  },
  {
    email: "alex.kim@example.com",
    name: "Alex Kim",
    birthDate: new Date("1994-10-17"),
    birthTime: "15:45",
    birthCity: "Seoul",
    birthCountry: "South Korea",
    gender: "Non-binary",
    prefGenders: "Everyone",
  },
];

async function main() {
  console.log("Seeding database...");
  const passwordHash = await bcrypt.hash("password123", 12);

  for (const seedUser of SEED_USERS) {
    const astro = calculateProfile(seedUser.birthDate, seedUser.birthTime);

    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {},
      create: {
        email: seedUser.email,
        passwordHash,
        profile: {
          create: {
            name: seedUser.name,
            birthDate: seedUser.birthDate,
            birthTime: seedUser.birthTime ?? null,
            birthCity: seedUser.birthCity,
            birthCountry: seedUser.birthCountry,
            gender: seedUser.gender,
            prefGenders: seedUser.prefGenders,
            prefAgeMin: 21,
            prefAgeMax: 40,
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

    console.log(
      `  ✓ ${seedUser.name} (${seedUser.email}) — ${astro.sunSign} Sun / ${astro.moonSign} Moon / ${astro.risingSign} Rising`
    );
  }

  console.log("\nSeed complete! 12 users created.");
  console.log("All passwords: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
