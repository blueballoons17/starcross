export interface AstrologyResult {
  signs: { sun: string; moon: string; rising: string };
  elements: { fire: number; earth: number; air: number; water: number };
  modals: { cardinal: number; fixed: number; mutable: number };
  traits: {
    emotionalStyle: string;
    communicationStyle: string;
    relationshipNeeds: string;
    conflictStyle: string;
  };
}

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];


export const SIGN_ELEMENTS: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

export const SIGN_MODALS: Record<string, "cardinal" | "fixed" | "mutable"> = {
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable",
};

// ─── Astronomical helpers ──────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Julian Day Number for a given UTC date. */
function getJulianDay(date: Date): number {
  let Y = date.getUTCFullYear();
  let M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

/** Normalize a value to [0, 360). */
function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

// ─── Sun sign ──────────────────────────────────────────────────────────────

/**
 * Compute ecliptic longitude of the Sun (low-precision, ±1°).
 * Uses UTC date so the timezone of the viewer doesn't shift the birthday.
 */
function getSunSign(date: Date): string {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  // Sun's mean longitude (Meeus Ch.25 low-precision)
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M  = toRad(norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T));
  // Equation of centre
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
           + 0.000289 * Math.sin(3 * M);
  const sunLon = norm360(L0 + C);

  // Tropical zodiac starts at Aries 0° = vernal equinox
  const idx = Math.floor(sunLon / 30);
  return SIGNS[idx];
}

// ─── Moon sign ─────────────────────────────────────────────────────────────

/**
 * Moon's apparent ecliptic longitude (Meeus Ch.47, accurate to ~0.3°).
 * Much more accurate than any day-of-year approximation.
 */
function getMoonSign(date: Date): string {
  const jd = getJulianDay(date);
  const T  = (jd - 2451545.0) / 36525;

  // Fundamental arguments (degrees)
  const Lm = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const Mm  = norm360(134.9633964 + 477198.8676313  * T + 0.0089970 * T * T);
  const Ms  = norm360(357.5291092 +  35999.0502909  * T - 0.0001536 * T * T);
  const F   = norm360( 93.2720950 + 483202.0175233  * T - 0.0036539 * T * T);
  const D   = norm360(297.8501921 + 445267.1114034  * T - 0.0018819 * T * T);

  // Perturbations in longitude (degrees) — first 15 terms of Meeus Table 47.A
  const dL =
      6.2888 * Math.sin(toRad(Mm))
    + 1.2740 * Math.sin(toRad(2 * D - Mm))
    + 0.6583 * Math.sin(toRad(2 * D))
    + 0.2136 * Math.sin(toRad(2 * Mm))
    - 0.1851 * Math.sin(toRad(Ms))
    - 0.1143 * Math.sin(toRad(2 * F))
    + 0.0588 * Math.sin(toRad(2 * D - 2 * Mm))
    + 0.0572 * Math.sin(toRad(2 * D - Ms - Mm))
    + 0.0533 * Math.sin(toRad(2 * D + Mm))
    + 0.0459 * Math.sin(toRad(2 * D - Ms))
    + 0.0410 * Math.sin(toRad(Mm - Ms))
    - 0.0348 * Math.sin(toRad(D))
    - 0.0306 * Math.sin(toRad(Mm + Ms))
    - 0.0153 * Math.sin(toRad(2 * F - 2 * D))
    + 0.0108 * Math.sin(toRad(2 * D - 2 * F));

  const moonLon = norm360(Lm + dL);
  return SIGNS[Math.floor(moonLon / 30)];
}

// ─── Rising sign ───────────────────────────────────────────────────────────

/**
 * Ascendant (rising sign) computed from Greenwich Mean Sidereal Time +
 * birth time.  Without geocoded coordinates we use a default latitude of
 * 40 °N and longitude 0 °.  Result is approximate (±1-2 signs) unless the
 * user's actual location is near those coordinates.
 */
function getRisingSign(date: Date, birthTime?: string): string {
  if (!birthTime) {
    // No birth time — return a deterministic-but-arbitrary fallback based on
    // the moon sign index + day offset so it at least varies meaningfully.
    const jd = getJulianDay(date);
    return SIGNS[Math.floor(norm360(jd * 0.369) / 30)];
  }

  const parts  = birthTime.split(":");
  const hour   = parseInt(parts[0], 10);
  const minute = parseInt(parts[1] ?? "0", 10);
  if (isNaN(hour)) return SIGNS[0];

  // Julian day at birth (approximate UT)
  const jd = getJulianDay(date) + (hour - 12) / 24 + minute / 1440;
  const d  = jd - 2451545.0;

  // Greenwich Mean Sidereal Time in degrees
  const GMST = norm360(280.46061837 + 360.98564736629 * d);

  // Local Sidereal Time — assuming longitude 0 ° (best default without geocoding)
  const LST = GMST; // add birthplace longitude (°E) here if available

  // Ascendant for latitude φ = 40 °N (mid-latitude default)
  const e   = toRad(23.4393); // mean obliquity of the ecliptic
  const lat = toRad(40.0);
  const R   = toRad(LST);

  // Standard formula for the Ecliptic Ascendant
  let asc = Math.atan2(
    -Math.cos(R),
    Math.sin(R) * Math.cos(e) + Math.tan(lat) * Math.sin(e)
  ) * (180 / Math.PI);

  asc = norm360(asc);

  // Quadrant correction: the Ascendant must be in the eastern hemisphere
  // (between IC and MC, i.e. +180° from RAMC when MC is in the upper meridian)
  const MC = norm360(Math.atan2(Math.sin(R) / Math.cos(e), Math.cos(R)) * (180 / Math.PI));
  if (((asc - MC + 360) % 360) < 180) asc = norm360(asc + 180);

  return SIGNS[Math.floor(asc / 30)];
}

// ─── Elements & Modality ───────────────────────────────────────────────────

function calculateElements(
  sun: string, moon: string, rising: string
): AstrologyResult["elements"] {
  const c: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  c[SIGN_ELEMENTS[sun]]    += 2; // Sun weighted double
  c[SIGN_ELEMENTS[moon]]   += 1;
  c[SIGN_ELEMENTS[rising]] += 1;
  return {
    fire:  Math.round((c.fire  / 4) * 100),
    earth: Math.round((c.earth / 4) * 100),
    air:   Math.round((c.air   / 4) * 100),
    water: Math.round((c.water / 4) * 100),
  };
}

function calculateModals(
  sun: string, moon: string, rising: string
): AstrologyResult["modals"] {
  const c: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  c[SIGN_MODALS[sun]]    += 2;
  c[SIGN_MODALS[moon]]   += 1;
  c[SIGN_MODALS[rising]] += 1;
  return {
    cardinal: Math.round((c.cardinal / 4) * 100),
    fixed:    Math.round((c.fixed    / 4) * 100),
    mutable:  Math.round((c.mutable  / 4) * 100),
  };
}

// ─── Trait & description profiles ─────────────────────────────────────────

const TRAIT_PROFILES: Record<string, AstrologyResult["traits"]> = {
  Aries: {
    emotionalStyle: "You experience emotions with startling immediacy — joy arrives like a flash of lightning, and frustration burns just as bright before fading just as fast. Your emotional life is vivid and unfiltered, never lingering in ambiguity when action seems possible. You feel things fully in the moment, then move on with characteristic speed, rarely carrying grudges because life is simply too interesting to stay in one feeling for long.",
    communicationStyle: "You speak with the confidence of someone who has already made up their mind, which can be magnetic and occasionally alarming in equal measure. Directness is your native tongue — you find diplomatic hedging exhausting and would rather say the difficult thing plainly than dance around it for hours. You're energized by spirited debate and often think out loud, letting your ideas sharpen through collision with others.",
    relationshipNeeds: "You need a partner who can match your energy and hold their own ground — someone who will push back rather than simply agreeing, because for you, a little creative friction keeps the spark alive. Independence matters enormously to you, and you flourish when your partner trusts you rather than tries to contain you. You give fiercely and expect that fire to be returned.",
    conflictStyle: "You prefer to fight fast and make up faster. You say exactly what's bothering you — sometimes too bluntly — and genuinely don't understand why others hold onto grievances after the air is cleared. You're not strategically cold; you simply move at a different speed from most, and waiting for resolution feels physically uncomfortable to you.",
  },
  Taurus: {
    emotionalStyle: "Your emotional life is rich and steady, like a well-tended garden. You don't fall into feelings quickly, but once you do, they root deeply and hold. You are remarkably stable under pressure, offering others a sense of calm they didn't know they needed. But beneath that serene surface there is tremendous depth — your attachments are real and abiding, and what you love, you love with your whole body.",
    communicationStyle: "You are deliberate and unhurried in speech, choosing your words with the same care you choose everything else. You don't fill silence with empty words, which means when you do speak, people listen. Patience is one of your great communicative gifts — you can hear someone out without rushing to fix or redirect, which makes you an unusually good confidant.",
    relationshipNeeds: "Security is the ground you build everything on — emotional security, physical presence, a sense that your partner is truly there and not going anywhere. You need loyalty demonstrated through action, not just words, and you'll notice the small gestures (a preferred meal prepared, a hand held during something hard) far more than grand declarations. Reliability is romance for you.",
    conflictStyle: "You avoid conflict instinctively and can hold your peace for longer than almost anyone — perhaps too long. When you do reach your limit, the response can surprise people who assumed your patience was infinite. You need time to process before you're ready to engage, and you're at your best in conflict when given space to collect yourself rather than being pressed for an immediate response.",
  },
  Gemini: {
    emotionalStyle: "Your inner life is a conversation with yourself — quick, branching, perpetually interesting. You feel things intellectually as much as viscerally, reaching for language to understand what you're experiencing, which gives your emotional expression an unusual clarity. You can shift between registers with baffling speed, not because you're shallow, but because you're genuinely responsive to the ever-changing present.",
    communicationStyle: "Words are your element and you move through them like water. You can talk to anyone about anything, and you genuinely mean it — you find most people interesting if you can find the right angle. Your mind makes connections others miss, and your humor tends to arrive at exactly the moment the tension needed releasing. You listen as actively as you speak, which makes you a genuinely magnetic conversationalist.",
    relationshipNeeds: "You need someone who can keep up mentally and who doesn't confuse your restlessness for inconsistency. Novelty matters — you want a partner who brings new ideas, new questions, new ways of seeing familiar things. You flourish when given freedom to be many versions of yourself, and you'll feel suffocated in a relationship that tries to hold you to one fixed shape.",
    conflictStyle: "You tend to intellectualize conflict, analyzing what went wrong rather than sitting with the discomfort of having felt it. This is both a strength (clarity, problem-solving) and an occasional weakness (partners who need more emotional acknowledgment may feel unseen). You're good at talking through issues and genuinely want resolution — you just sometimes need reminding that resolution isn't only cognitive.",
  },
  Cancer: {
    emotionalStyle: "Your emotional life is vast and tidal — feelings arrive in waves, recede, and return changed. You are one of the most deeply feeling signs, with an intuitive attunement to the emotional temperature of any room, any person, any silence. You tend to internalize before expressing, building a full picture privately before letting others in, which means people sometimes see only your composed exterior and miss the ocean underneath.",
    communicationStyle: "You communicate through subtext as much as through direct speech — a carefully chosen word, a gesture, a thoughtful memory brought up at the right moment. You are perceptive about what people need to hear versus what they want to hear, and you navigate that tension with care. In close relationships, you open fully and speak with remarkable vulnerability; with strangers you stay behind a pleasant and somewhat opaque warmth.",
    relationshipNeeds: "Emotional safety is not optional for you — it is the entire foundation. You need to know that your partner sees your sensitivity not as a liability but as one of your most remarkable qualities. You give with extraordinary generosity and depth, and you need that kind of return: not performance, but genuine presence, remembering, and warmth. A home life that feels like a sanctuary means more to you than almost anything external.",
    conflictStyle: "You tend to withdraw when hurt, retreating into yourself until you've processed enough to speak. This can be mistaken for sulking, but it's more like digestion — you need to understand what happened before you can discuss it. You forgive readily when you feel genuinely seen, but you hold onto emotional memories with exceptional vividness, which means old wounds can resurface long after you thought you'd moved past them.",
  },
  Leo: {
    emotionalStyle: "You feel everything with operatic intensity — love is luminous, disappointment is volcanic, and pride runs like bedrock underneath it all. You are not performative with your emotions so much as genuinely, constitutionally unable to do small. Joy wants to be shared. Hurt wants to be witnessed. When you are happy, you want everyone around you to feel that warmth, and you are genuinely upset when you can't give it properly.",
    communicationStyle: "You command a room without trying, and it's not only charisma — it's the unmistakable sense that you actually mean what you're saying. You're an excellent storyteller, generous with praise, and you have a gift for making people feel seen in conversation. You can struggle with shifting the spotlight, not from vanity but from genuine enthusiasm — you're rarely trying to dominate so much as to share.",
    relationshipNeeds: "You need a partner who sees you — really sees you — and isn't threatened by your shine. Admiration from someone you deeply respect means the world to you, and you return it generously. You want a relationship that feels like a celebration of both people, not a compromise of either. Loyalty is non-negotiable, and you'll repay it with a devotion that is completely, uncomplicatedly reliable.",
    conflictStyle: "You confront rather than avoid, and you do it with surprising directness for a sign so concerned with presentation. You need to know that the relationship is worth fighting for, so you fight. The risk is that your delivery can land harder than you intended, and your pride can make it difficult to initiate reconciliation even when you want to. But when you do apologize, it's genuine — and generous.",
  },
  Virgo: {
    emotionalStyle: "Your emotional life is conducted largely through action — you show what you feel by how carefully you attend to things. You feel deeply but process privately, often translating feeling into analysis before it reaches the surface. You are more anxious than most signs admit, and your mind can be an exacting critic. But you also possess a warmth and attentiveness that people in your inner circle experience as one of the most nourishing forms of love.",
    communicationStyle: "You are precise and thoughtful, someone who actually means exactly what they say and notices when others don't. You have a dry wit that surfaces unexpectedly and a gift for articulating complexity that others find confusing. You listen with unusual attentiveness and often remember things people said in passing because you were genuinely listening, not just waiting for your turn.",
    relationshipNeeds: "You need a partner who appreciates the substance beneath your reserve — someone who understands that your gestures of service are love letters in disguise. You want to be genuinely useful to the people you care about, and you need that care to be recognized rather than taken for granted. Thoughtfulness matters to you more than grand gestures, and you'll notice the gap when it's absent.",
    conflictStyle: "You tend to critique before you comfort, which can complicate moments where a partner just needs to feel understood. You're drawn to solving problems, which is genuinely useful, but in conflict it can come across as clinical when warmth is what's needed. You hold yourself to rigorous standards and can be harder on yourself than anyone else — a partner who recognizes this, and responds with patience, will earn your deepest trust.",
  },
  Libra: {
    emotionalStyle: "You experience emotions through the lens of relationship — how you feel is often inseparable from how things are between you and someone you care about. You have a finely tuned sense of fairness that makes injustice feel viscerally wrong, and a deep need for harmony that can sometimes lead you to smooth things over before they've been fully addressed. Your emotional life is rich with nuance, and you feel other people's experiences with unusual empathy.",
    communicationStyle: "You are a natural diplomat who finds the language that makes difficult things land well. You tend to present multiple sides before you land on your own, which can read as indecisive but is actually a genuine attempt to be fair. Your conversational style is elegant and collegial — you make people feel respected, and you have a subtle way of redirecting tension without anyone quite noticing you did it.",
    relationshipNeeds: "Partnership is not a preference for you — it's a medium through which you understand yourself. You flourish with someone who values collaboration and beauty in the same breath, who wants to build something together rather than occupying separate orbits. You need fairness and reciprocity, and you are generous with both when you feel them returned. A beautiful shared life is your deepest aspiration.",
    conflictStyle: "You avoid direct confrontation instinctively, tending toward accommodation and hoping things will smooth themselves out. This can defer rather than resolve tension, allowing resentment to build quietly below a surface that looks fine. When you do speak up, you do it with remarkable grace, but you often wait longer than you should. The right partner will create enough safety for you to say the difficult thing before it becomes a pressure cooker.",
  },
  Scorpio: {
    emotionalStyle: "Your emotional world is the deepest water — still on the surface, and essentially bottomless. You feel things with an intensity that would overwhelm most people, and you've learned to carry it quietly. Trust is not given lightly because, for you, opening yourself fully is an act of genuine vulnerability, not a social gesture. When you do let someone in, they will know a loyalty and depth of feeling that is unlike anything most people experience.",
    communicationStyle: "You say less than you know, always, and the gap between what you observe and what you reveal is significant and intentional. You ask questions that go to the heart of things and are remarkably perceptive about when someone is telling partial truths. You communicate directly when you choose to, and that directness can have a quality that others find unexpectedly confronting. You do not make small talk well, and you do not particularly want to.",
    relationshipNeeds: "You need total honesty — not just the performed version of it, but the kind that goes to uncomfortable places. You need a partner who is not frightened by your intensity and doesn't try to domesticate it. Depth is non-negotiable: you'd rather have one true thing than a hundred pleasant surfaces. You are looking for a merger of sorts — a relationship that transforms both people, not merely accompanies them.",
    conflictStyle: "You process conflict in private before you bring it to the surface, and by the time you do, you've understood it thoroughly. You can hold onto grievances for a long time, and you do not forgive quickly or superficially. But you're not petty — you need to know that a resolution is real, not cosmetic, before you release the weight of it. When you trust someone enough to fight with them, it's actually a sign of respect.",
  },
  Sagittarius: {
    emotionalStyle: "Your emotional nature is buoyant and expansive — you move toward joy the way a plant moves toward light, and you have a genuine philosophical resilience that lets you find meaning even in difficulty. You process feelings through movement, through conversation, through the act of reframing. You're not avoidant so much as restless: sitting in a feeling without doing something with it feels genuinely unnatural to you.",
    communicationStyle: "You speak with an enthusiasm that's completely genuine and occasionally completely overwhelming. You are the person who says the thing everyone else was thinking, with a bluntness that is equal parts liberating and alarming. Your stories are full of color and your humor is unforced. You're honest to the point of tactlessness sometimes, and while this is sometimes the thing people find most refreshing about you, it can also be the thing they need to brace for.",
    relationshipNeeds: "Freedom isn't a preference — it's a requirement. You need a partner who is expansive rather than restrictive, who has their own inner world and invites you into it. You want adventure, intellectual companionship, and the room to grow into someone neither of you can predict. The relationship that confines you will eventually lose you; the one that stretches you will have you forever.",
    conflictStyle: "You prefer to address conflict head-on and then put it behind you. You don't hold grudges because it feels genuinely like a waste of the time you could be spending on something interesting. You can be too quick to declare things resolved when your partner still needs more, and your philosophical reframes — however sincere — can sometimes land as dismissive. You're learning that some feelings need to be sat with, not solved.",
  },
  Capricorn: {
    emotionalStyle: "Your emotional life is disciplined, purposeful, and deeply felt beneath a composed exterior. You tend to manage before you express — working through feelings privately, measuring them against your expectations, deciding what to do with them before others even know they're happening. You are not cold; you are considered. The people who earn your trust eventually discover a warmth and dry humor that surprises them, because you are nothing like your surface.",
    communicationStyle: "You communicate with precision and economy — you say what you mean, mean what you say, and genuinely don't understand why others require three passes to arrive at a point. You're a natural authority figure, not because you assert dominance but because you give the impression of someone who has thought carefully about what they're saying. Your humor is dry, earned, and lands at exactly the right moment.",
    relationshipNeeds: "You need a partner who takes the relationship as seriously as you do — someone who shows up, follows through, and understands that building something real takes time and intention. Grand gestures mean less to you than consistent reliability. You are a devoted partner when you commit, and you expect the same. Shared ambition — or at least mutual respect for each other's ambitions — matters deeply.",
    conflictStyle: "You handle conflict with the same strategic patience you apply to everything else. You rarely explode, preferring to let things develop to the point where you have a full picture before speaking. This can make you seem unbothered when you are very much bothered. You expect constructive outcomes from difficult conversations, not just emotional release, and you're at your best when conflict feels like problem-solving rather than personal attack.",
  },
  Aquarius: {
    emotionalStyle: "Your emotional life is philosophically inflected — you tend to understand your feelings before you feel them, which is both a remarkable talent and an occasional way of keeping yourself at arm's length from the full experience. You care deeply about people in the aggregate and can be slower to show that care in the intimate, particular ways that individual relationships require. But your loyalty, once engaged, is unwavering and genuinely rare.",
    communicationStyle: "You are a natural contrarian who follows an argument wherever it leads regardless of social comfort, which makes you either invigorating or exhausting depending on the day. You think at angles others don't naturally explore and you express those ideas with a clarity and confidence that can border on certainty. You're genuinely interested in other perspectives, but you need them to be rigorously held to take them seriously.",
    relationshipNeeds: "You need intellectual compatibility above almost everything else — a partner who can match you in ideas, challenge your thinking, and respect your need for autonomy without making it a referendum on their importance to you. Possessiveness is your particular allergy. You want a relationship that makes both people more themselves, not a merger that requires anyone to disappear.",
    conflictStyle: "You handle conflict conceptually, analyzing the situation from multiple angles with admirable objectivity — and then, occasionally, with a detachment that leaves partners wondering if you care at all. You do care. You just express it differently. You're at your best in conflict when you can stay engaged emotionally without retreating entirely into your head, and you need a partner who will meet you somewhere in the middle.",
  },
  Pisces: {
    emotionalStyle: "Your emotional world has no hard edges — you feel other people's feelings almost as readily as your own, and the boundary between empathy and absorption is something you navigate daily. You have an inner life of unusual richness, fueled by intuition, dream, and a sensitivity to things others walk past without noticing. You can be overwhelmed by the world, which is why you need refuge — beautiful things, quiet places, people who feel safe.",
    communicationStyle: "You communicate in impressions as much as words — through metaphor, through the quality of your attention, through what you choose not to say. You are a listener of rare depth, genuinely absorbed in what someone is telling you, and people feel this. You can be vague when precision is called for, and you sometimes say yes when you mean something more ambiguous, which requires partners who are willing to read between the lines.",
    relationshipNeeds: "You need a partner who can hold you gently — someone who appreciates your sensitivity without trying to harden you, and who has enough groundedness to offer when the world becomes too much. You give love the way you do everything: completely, with your whole self, blurring the edges. You need that returned with care rather than taken for granted, and you thrive when the relationship feels like a sanctuary you've built together.",
    conflictStyle: "You tend to absorb rather than deflect — you take on the emotional weight of a conflict, often feeling responsible for things that aren't yours to carry. You may withdraw when hurt, not from strategy but from genuine need to recover. Direct confrontation doesn't come naturally, but when you do speak from that place of quiet certainty, it lands with unmistakable weight. You need resolution that feels emotionally true, not just logically settled.",
  },
};

// ─── Moon sign descriptions ────────────────────────────────────────────────

export const MOON_DESCRIPTIONS: Record<string, string> = {
  Aries: "Emotions arrive fast and leave just as fast. You're quick to feel hurt or inspired but rarely hold grudges — the moment passes and you're already looking forward. You need emotional honesty and space to express feelings without preamble or apology.",
  Taurus: "Emotionally, you need stability above almost everything else. Your feelings are deep and slow-forming, but once rooted they hold with extraordinary tenacity. Security isn't just nice to have — it's the ground you stand on, the thing you return to after every storm.",
  Gemini: "You process emotion through words — yours and other people's. Talking through how you feel is often how you figure out what you feel. You can seem emotionally inconsistent, but you're really just responsive: quick to absorb the room, quick to shift with new information.",
  Cancer: "You are one of the most emotionally attuned placements in the chart. Your intuition about people's inner states borders on psychic, and you absorb the emotional atmosphere wherever you go. Home — as a feeling, not just a place — is the thing you're always quietly seeking.",
  Leo: "You need to feel special to the people you love — not flattered, but genuinely seen and treasured. Your emotional expression is warm, generous, sometimes theatrical, always sincere. When you feel loved, you radiate; when you feel overlooked, the withdrawal is unmistakable.",
  Virgo: "Your emotional processing tends to run through your mind before it reaches your heart. You show love through careful attention to detail — noticing what someone needs, doing the thing before being asked. But you carry a quiet anxiety that benefits enormously from having somewhere safe to set it down.",
  Libra: "You feel most yourself when things are in balance — in relationships, in your environment, in your internal world. Conflict unsettles you in a visceral way. You may defer your own emotional needs to keep the harmony, which eventually tips the very balance you were trying to protect.",
  Scorpio: "Emotional depth is non-negotiable. You feel everything intensely and rarely share the full weight of it — you wait to see if someone is worthy of that trust. When they prove they are, your loyalty is absolute and your care runs to a depth few people can match or even perceive.",
  Sagittarius: "You process emotion by moving — philosophically, physically, forward. You resist staying in a difficult feeling longer than necessary, which is both a resilience and occasionally an avoidance. Your optimism is a genuine quality that people are drawn to, not a performance you put on.",
  Capricorn: "Emotionally, you tend to manage before you express. You're more comfortable offering support than asking for it, and genuine vulnerability requires real trust that you build slowly. The warmth inside you is real — it just takes time, and the right person, to coax it out.",
  Aquarius: "You understand your feelings analytically before you fully inhabit them, which gives you unusual emotional perspective — and occasional emotional distance. You care deeply about people, just sometimes more in the abstract than in the intimate, particular ways that relationships require most.",
  Pisces: "Your emotional world has no clear borders — you feel other people's feelings almost as readily as your own, and your empathy is one of your most profound gifts. You need regular time away from the noise of the world to find your own center and hear yourself clearly again.",
};

// ─── Rising sign descriptions ──────────────────────────────────────────────

export const RISING_DESCRIPTIONS: Record<string, string> = {
  Aries: "You enter a room and something shifts. There's a directness about you — you make eye contact, you take up space, you give the impression of someone who knows where they're going. People notice you without always being able to say why.",
  Taurus: "You project calm and groundedness in a way people find immediately reassuring. Your physical presence is deliberate — you don't rush. People tend to feel safer and more settled in your company than in most, often without knowing why.",
  Gemini: "You come across as quick-minded and curious, someone who's interested in whatever's happening. You're easy to talk to — you have a way of making the other person feel like the most interesting thing in the room, at least in that moment.",
  Cancer: "You have a quality that makes people want to both take care of you and feel cared for by you. There's a softness and emotional attunement to your manner that puts people at ease almost immediately. Your first impression is warmth.",
  Leo: "You have natural magnetism — the kind that's difficult to explain and impossible to fake. Your warmth and confidence make people feel welcome, and you often become the social anchor of whatever room you're in, drawing others into your orbit.",
  Virgo: "Your first impression is thoughtful, measured, and a little quiet — someone who pays close attention and forms careful opinions. People trust you because you seem to actually see things rather than filtering everything through what you want to see.",
  Libra: "You're effortlessly pleasant and socially graceful in a way people notice immediately. Your manners are instinctive, your presence balanced, and you give off the impression of someone who genuinely enjoys other people — because, on balance, you do.",
  Scorpio: "You project an intensity that precedes you. There's a quiet power to your manner that people find either compelling or unsettling, often both. You don't reveal much in early encounters, which tends to make people want to know more.",
  Sagittarius: "You read as open, warm, and confident — someone who has a lot of world in them. There's an easiness to you, an impression of freedom and expansiveness, that makes people feel invited into a conversation that might go anywhere.",
  Capricorn: "You project composure and quiet authority before you've said a word. People treat you as someone worth listening to even before you've earned it, which gives you a head start in almost every room you walk into.",
  Aquarius: "You have an energy that's distinctly your own — something a little different, a little ahead. People aren't always sure what to make of you at first, which is partly the point. You don't need to be immediately understood.",
  Pisces: "Your first impression is soft, dreamlike, and somehow deeply intuitive. People feel understood by you before you've said much. There's a quality of genuine attention about you — like you're really present, not just performing presence.",
};

// ─── Sun sign summary (one-liner for Big Three slide) ──────────────────────

export const SUN_SUMMARIES: Record<string, string> = {
  Aries:       "Bold, direct, and first to move. You lead with instinct and recover from setbacks faster than anyone.",
  Taurus:      "Grounded, sensual, and deeply loyal. You build things meant to last and love with your whole body.",
  Gemini:      "Quick-minded, curious, and endlessly adaptable. You think in connections and light up every room.",
  Cancer:      "Deeply intuitive, fiercely protective, and quietly powerful. You feel everything and remember it all.",
  Leo:         "Radiant, generous, and impossible to ignore. You were made to be seen — and to make others feel seen.",
  Virgo:       "Precise, caring, and quietly indispensable. Your love shows in the details others walk past without noticing.",
  Libra:       "Elegant, fair-minded, and socially gifted. You see all sides and bring harmony wherever you go.",
  Scorpio:     "Intense, perceptive, and magnetically private. You see through surfaces and never forget what you find.",
  Sagittarius: "Expansive, honest, and always reaching. You chase meaning and bring others along for the journey.",
  Capricorn:   "Disciplined, ambitious, and quietly devoted. You build slowly and make things built to last.",
  Aquarius:    "Original, independent, and genuinely ahead of your time. You think differently and mean it.",
  Pisces:      "Dreamy, empathic, and boundlessly imaginative. You feel the world more deeply than most dare to.",
};

// ─── Compatibility ─────────────────────────────────────────────────────────

export const COMPATIBILITY: Record<string, { bestWith: string[]; insight: string }> = {
  Aries:       { bestWith: ["Leo", "Sagittarius", "Gemini", "Aquarius"],     insight: "Fire and air feed your need for momentum, freedom, and a partner who matches your pace without needing you to slow down." },
  Taurus:      { bestWith: ["Virgo", "Capricorn", "Cancer", "Pisces"],       insight: "Earth and water ground your need for security, sensory richness, and a love that grows deeper with time." },
  Gemini:      { bestWith: ["Libra", "Aquarius", "Aries", "Leo"],            insight: "Air and fire keep your mind alive — you need someone who brings ideas, wit, and the willingness to be surprised." },
  Cancer:      { bestWith: ["Scorpio", "Pisces", "Taurus", "Virgo"],         insight: "Water and earth meet your need for emotional depth, loyalty, and the quiet safety of being truly known." },
  Leo:         { bestWith: ["Aries", "Sagittarius", "Gemini", "Libra"],      insight: "Fire and air fan your flame — you thrive with someone who celebrates you and brings enough sparkle of their own." },
  Virgo:       { bestWith: ["Taurus", "Capricorn", "Cancer", "Scorpio"],     insight: "Earth and water complement your careful nature — you need someone who appreciates depth over flash and shows love through consistency." },
  Libra:       { bestWith: ["Gemini", "Aquarius", "Leo", "Sagittarius"],     insight: "Air and fire engage your mind and sense of beauty — you need a partner who values fairness, elegance, and the art of conversation." },
  Scorpio:     { bestWith: ["Cancer", "Pisces", "Virgo", "Capricorn"],       insight: "Water and earth can hold your depth — you need someone who doesn't flinch at intensity and offers total emotional honesty in return." },
  Sagittarius: { bestWith: ["Aries", "Leo", "Libra", "Aquarius"],            insight: "Fire and air match your horizons — you need someone who wants to grow, explore, and never make the relationship feel like a cage." },
  Capricorn:   { bestWith: ["Taurus", "Virgo", "Scorpio", "Pisces"],         insight: "Earth and water build with you — you need someone equally serious about creating something real, who values action over words." },
  Aquarius:    { bestWith: ["Gemini", "Libra", "Aries", "Sagittarius"],      insight: "Air and fire challenge you intellectually and honor your independence — you need someone who is interesting before they are comfortable." },
  Pisces:      { bestWith: ["Cancer", "Scorpio", "Taurus", "Capricorn"],     insight: "Water and earth cradle your sensitivity — you need someone grounded enough to anchor you and gentle enough to not break what's beautiful about you." },
};

// ─── Element descriptions ──────────────────────────────────────────────────

export const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  fire:  "Energy, initiative, and passion. Fire in your chart means you lead with enthusiasm and carry an inner warmth that others feel drawn to. You act from instinct, thrive on inspiration, and have a natural ability to ignite things — projects, rooms, relationships.",
  earth: "Stability, resourcefulness, and embodied intelligence. Earth in your chart means you build things designed to last. You trust what you can touch, hold, or measure, and you express care through practical devotion rather than grand declarations.",
  air:   "Thought, connection, and communication. Air in your chart means you live largely in ideas — making connections, asking questions, finding patterns others miss. Your mind is one of your most defining features, and you need mental stimulation the way others need warmth.",
  water: "Emotion, intuition, and depth. Water in your chart means you navigate life by feeling. Your emotional intelligence is extraordinary — you sense what's unsaid, remember the texture of every experience, and love with a depth that is difficult to adequately describe.",
};

export const MODAL_DESCRIPTIONS: Record<string, string> = {
  cardinal: "You initiate. Cardinal energy means you are drawn to beginnings — you see what could be, take the first step, and bring others along with your momentum. You have a native restlessness that keeps things moving forward.",
  fixed:    "You sustain. Fixed energy means you have extraordinary staying power — you commit deeply, resist change that feels arbitrary, and build your life on loyalty and consistency. Your strength lies in your refusal to let go of what matters.",
  mutable:  "You adapt. Mutable energy means you are responsive to change in a way that others find either enviable or baffling. You see the full picture, hold multiple perspectives at once, and move through transitions with unusual flexibility.",
};

// ─── Main export ───────────────────────────────────────────────────────────

export function calculateAstrologyProfile(
  birthDate: Date,
  birthTime?: string,
  _birthCity?: string
): AstrologyResult {
  const sun    = getSunSign(birthDate);
  const moon   = getMoonSign(birthDate);
  const rising = getRisingSign(birthDate, birthTime);

  return {
    signs:  { sun, moon, rising },
    elements: calculateElements(sun, moon, rising),
    modals:   calculateModals(sun, moon, rising),
    traits:   TRAIT_PROFILES[sun],
  };
}
