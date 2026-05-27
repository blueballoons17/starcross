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

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SIGN_ELEMENTS: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const SIGN_MODALS: Record<string, "cardinal" | "fixed" | "mutable"> = {
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable",
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
  // Moon moves through all 12 signs roughly every 27.3 days
  // Offset by year to avoid same sign for same birthday different years
  const yearOffset = (date.getFullYear() * 7) % 12;
  const index = (Math.floor(dayOfYear / 2.275) + yearOffset) % 12;
  return SIGNS[Math.abs(index)];
}

function getRisingSign(date: Date, birthTime?: string): string {
  if (birthTime) {
    const parts = birthTime.split(":");
    const hour = parseInt(parts[0], 10);
    if (!isNaN(hour)) {
      // Rising changes every ~2 hours, 12 signs per day
      const index = Math.floor(hour / 2) % 12;
      // Offset by day of year for variance
      const dayOfYear = Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
      );
      return SIGNS[(index + Math.floor(dayOfYear / 30)) % 12];
    }
  }
  // No birth time: use day of month to determine rising
  const dayOffset = (date.getDate() * 3) % 12;
  const monthOffset = date.getMonth();
  return SIGNS[(dayOffset + monthOffset) % 12];
}

function calculateElements(sun: string, moon: string, rising: string): { fire: number; earth: number; air: number; water: number } {
  const counts: { fire: number; earth: number; air: number; water: number } = { fire: 0, earth: 0, air: 0, water: 0 };
  const sunEl = SIGN_ELEMENTS[sun];
  const moonEl = SIGN_ELEMENTS[moon];
  const risingEl = SIGN_ELEMENTS[rising];
  // Sun counts double
  counts[sunEl] += 2;
  counts[moonEl] += 1;
  counts[risingEl] += 1;
  // Normalize to percentages
  const total = 4;
  return {
    fire: Math.round((counts.fire / total) * 100),
    earth: Math.round((counts.earth / total) * 100),
    air: Math.round((counts.air / total) * 100),
    water: Math.round((counts.water / total) * 100),
  };
}

function calculateModals(sun: string, moon: string, rising: string): { cardinal: number; fixed: number; mutable: number } {
  const counts: { cardinal: number; fixed: number; mutable: number } = { cardinal: 0, fixed: 0, mutable: 0 };
  counts[SIGN_MODALS[sun]] += 2;
  counts[SIGN_MODALS[moon]] += 1;
  counts[SIGN_MODALS[rising]] += 1;
  const total = 4;
  return {
    cardinal: Math.round((counts.cardinal / total) * 100),
    fixed: Math.round((counts.fixed / total) * 100),
    mutable: Math.round((counts.mutable / total) * 100),
  };
}

const TRAIT_PROFILES: Record<string, { emotionalStyle: string; communicationStyle: string; relationshipNeeds: string; conflictStyle: string }> = {
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

export function calculateAstrologyProfile(
  birthDate: Date,
  birthTime?: string,
  _birthCity?: string
): AstrologyResult {
  const sun = getSunSign(birthDate);
  const moon = getMoonSign(birthDate);
  const rising = getRisingSign(birthDate, birthTime);

  const elements = calculateElements(sun, moon, rising);
  const modals = calculateModals(sun, moon, rising);
  const traits = TRAIT_PROFILES[sun];

  return {
    signs: { sun, moon, rising },
    elements,
    modals,
    traits,
  };
}

export { SIGN_ELEMENTS, SIGN_MODALS, SIGNS };
