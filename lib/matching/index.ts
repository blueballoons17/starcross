import { type AstrologyResult } from "@/lib/astrology";

export interface MatchResult {
  matchScore: number;
  explanation: string;
  strengths: string[];
  frictionPoints: string[];
  breakdown: {
    elemental: number;
    emotional: number;
    communication: number;
    stability: number;
  };
}

type Element = "fire" | "earth" | "air" | "water";
type Modal = "cardinal" | "fixed" | "mutable";

const ELEMENT_COMPATIBILITY: Record<Element, Record<Element, number>> = {
  fire:  { fire: 65, earth: 40, air: 90, water: 45 },
  earth: { fire: 40, earth: 70, air: 55, water: 85 },
  air:   { fire: 90, earth: 55, air: 65, water: 50 },
  water: { fire: 45, earth: 85, air: 50, water: 75 },
};

const MODAL_COMPATIBILITY: Record<Modal, Record<Modal, number>> = {
  cardinal: { cardinal: 55, fixed: 70, mutable: 80 },
  fixed:    { cardinal: 70, fixed: 60, mutable: 75 },
  mutable:  { cardinal: 80, fixed: 75, mutable: 65 },
};

const SIGN_SYNASTRY: Record<string, Record<string, number>> = {
  Aries:       { Aries: 60, Taurus: 40, Gemini: 85, Cancer: 45, Leo: 90, Virgo: 50, Libra: 70, Scorpio: 55, Sagittarius: 88, Capricorn: 42, Aquarius: 80, Pisces: 48 },
  Taurus:      { Aries: 40, Taurus: 72, Gemini: 48, Cancer: 88, Leo: 55, Virgo: 90, Libra: 65, Scorpio: 80, Sagittarius: 42, Capricorn: 92, Aquarius: 45, Pisces: 82 },
  Gemini:      { Aries: 85, Taurus: 48, Gemini: 60, Cancer: 50, Leo: 82, Virgo: 58, Libra: 90, Scorpio: 48, Sagittarius: 75, Capricorn: 50, Aquarius: 88, Pisces: 52 },
  Cancer:      { Aries: 45, Taurus: 88, Gemini: 50, Cancer: 68, Leo: 60, Virgo: 78, Libra: 55, Scorpio: 90, Sagittarius: 45, Capricorn: 80, Aquarius: 48, Pisces: 92 },
  Leo:         { Aries: 90, Taurus: 55, Gemini: 82, Cancer: 60, Leo: 65, Virgo: 52, Libra: 85, Scorpio: 58, Sagittarius: 90, Capricorn: 48, Aquarius: 62, Pisces: 55 },
  Virgo:       { Aries: 50, Taurus: 90, Gemini: 58, Cancer: 78, Leo: 52, Virgo: 68, Libra: 60, Scorpio: 82, Sagittarius: 52, Capricorn: 88, Aquarius: 55, Pisces: 75 },
  Libra:       { Aries: 70, Taurus: 65, Gemini: 90, Cancer: 55, Leo: 85, Virgo: 60, Libra: 62, Scorpio: 60, Sagittarius: 80, Capricorn: 55, Aquarius: 88, Pisces: 58 },
  Scorpio:     { Aries: 55, Taurus: 80, Gemini: 48, Cancer: 90, Leo: 58, Virgo: 82, Libra: 60, Scorpio: 70, Sagittarius: 50, Capricorn: 82, Aquarius: 52, Pisces: 90 },
  Sagittarius: { Aries: 88, Taurus: 42, Gemini: 75, Cancer: 45, Leo: 90, Virgo: 52, Libra: 80, Scorpio: 50, Sagittarius: 65, Capricorn: 48, Aquarius: 82, Pisces: 55 },
  Capricorn:   { Aries: 42, Taurus: 92, Gemini: 50, Cancer: 80, Leo: 48, Virgo: 88, Libra: 55, Scorpio: 82, Sagittarius: 48, Capricorn: 70, Aquarius: 58, Pisces: 78 },
  Aquarius:    { Aries: 80, Taurus: 45, Gemini: 88, Cancer: 48, Leo: 62, Virgo: 55, Libra: 88, Scorpio: 52, Sagittarius: 82, Capricorn: 58, Aquarius: 65, Pisces: 62 },
  Pisces:      { Aries: 48, Taurus: 82, Gemini: 52, Cancer: 92, Leo: 55, Virgo: 75, Libra: 58, Scorpio: 90, Sagittarius: 55, Capricorn: 78, Aquarius: 62, Pisces: 70 },
};

function getDominantElement(elements: AstrologyResult["elements"]): Element {
  const entries = Object.entries(elements) as [Element, number][];
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

function getDominantModal(modals: AstrologyResult["modals"]): Modal {
  const entries = Object.entries(modals) as [Modal, number][];
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

function stringSimilarity(a: string, b: string): number {
  // Simple word overlap similarity
  const wordsA = new Set(a.toLowerCase().split(/\s+/).slice(0, 20));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).slice(0, 20));
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 50 : Math.round(30 + (intersection / union) * 70);
}

function buildExplanation(
  a: AstrologyResult,
  b: AstrologyResult,
  score: number
): string {
  const sunA = a.signs.sun;
  const sunB = b.signs.sun;
  const elemA = getDominantElement(a.elements);
  const elemB = getDominantElement(b.elements);

  const level = score >= 80 ? "exceptional" : score >= 65 ? "strong" : score >= 50 ? "promising" : "complex";
  const elemDesc =
    elemA === elemB
      ? `Both rooted in ${elemA} energy, you share a fundamental attunement`
      : elemA === "fire" && elemB === "air" || elemA === "air" && elemB === "fire"
        ? `Your ${elemA} and ${elemB} energies feed each other, creating a dynamic that feels alive`
        : elemA === "earth" && elemB === "water" || elemA === "water" && elemB === "earth"
          ? `${elemA} and ${elemB} work in quiet partnership — one provides form, the other fills it with feeling`
          : `The interplay between your ${elemA} and ${elemB} natures creates a tension worth exploring`;

  return `A ${sunA}–${sunB} pairing is one with ${level} potential. ${elemDesc}. Where one of you leads with instinct, the other brings something the first didn't know was missing. The compatibility here is not about being the same — it's about complementing in ways that matter.`;
}

function buildStrengths(a: AstrologyResult, b: AstrologyResult, score: number): string[] {
  const strengths: string[] = [];
  const sunA = a.signs.sun;
  const sunB = b.signs.sun;
  const elemA = getDominantElement(a.elements);
  const elemB = getDominantElement(b.elements);
  const modalA = getDominantModal(a.modals);
  const modalB = getDominantModal(b.modals);

  // Elemental harmony
  const elemScore = ELEMENT_COMPATIBILITY[elemA][elemB];
  if (elemScore >= 75) {
    if ((elemA === "fire" && elemB === "air") || (elemA === "air" && elemB === "fire")) {
      strengths.push("Elemental fire-air chemistry: your combined energy is spontaneous, exciting, and intellectually alive");
    } else if ((elemA === "earth" && elemB === "water") || (elemA === "water" && elemB === "earth")) {
      strengths.push("Deep elemental resonance: earth and water together build something lasting, felt, and real");
    } else {
      strengths.push(`Natural ${elemA} energy harmony — you understand each other's rhythm without having to explain it`);
    }
  }

  // Sign synastry
  const synScore = SIGN_SYNASTRY[sunA]?.[sunB] ?? 60;
  if (synScore >= 80) {
    strengths.push(`${sunA} and ${sunB} is a classically strong pairing — the contrast between your natures creates genuine magnetism`);
  } else if (synScore >= 65) {
    strengths.push(`${sunA}–${sunB} compatibility is well-documented: you bring out specific qualities in each other that are harder to access alone`);
  }

  // Modal compatibility
  if (modalA !== modalB) {
    const modalScore = MODAL_COMPATIBILITY[modalA][modalB];
    if (modalScore >= 75) {
      strengths.push(`Your ${modalA}/${modalB} modal dynamic creates useful balance — one of you initiates, the other sustains`);
    }
  }

  // Communication
  const commScore = stringSimilarity(a.traits.communicationStyle, b.traits.communicationStyle);
  if (commScore >= 55) {
    strengths.push("Complementary communication styles that tend toward understanding rather than talking past each other");
  }

  // Score-based override
  if (score >= 80 && strengths.length < 2) {
    strengths.push("A rare high-compatibility pairing where the differences enhance rather than erode the connection");
  }

  return strengths.slice(0, 4);
}

function buildFrictionPoints(a: AstrologyResult, b: AstrologyResult): string[] {
  const friction: string[] = [];
  const elemA = getDominantElement(a.elements);
  const elemB = getDominantElement(b.elements);
  const modalA = getDominantModal(a.modals);
  const modalB = getDominantModal(b.modals);

  const elemScore = ELEMENT_COMPATIBILITY[elemA][elemB];
  if (elemScore < 55) {
    friction.push(`${elemA} and ${elemB} energies can feel mismatched in pace — one craves movement when the other craves stillness`);
  }

  if (modalA === modalB && modalA === "cardinal") {
    friction.push("Two cardinal signs can clash over direction — both want to lead, and neither naturally defers");
  } else if (modalA === modalB && modalA === "fixed") {
    friction.push("Fixed energy doubled means stubbornness squared — both of you hold your positions long after flexibility would serve you better");
  }

  const conflictA = a.traits.conflictStyle.toLowerCase();
  const conflictB = b.traits.conflictStyle.toLowerCase();
  const conflictDiff = !conflictA.includes("direct") && conflictB.includes("direct") ||
    conflictA.includes("direct") && !conflictB.includes("direct");
  if (conflictDiff) {
    friction.push("Mismatched conflict styles: one prefers to address things head-on while the other needs more processing time before engaging");
  }

  if (friction.length === 0) {
    friction.push("The main challenge here is complacency — high compatibility can breed assumption, and this pairing benefits from staying intentional");
  }

  return friction.slice(0, 3);
}

export function calculateCompatibility(
  profileA: AstrologyResult,
  profileB: AstrologyResult
): MatchResult {
  const elemA = getDominantElement(profileA.elements);
  const elemB = getDominantElement(profileB.elements);
  const modalA = getDominantModal(profileA.modals);
  const modalB = getDominantModal(profileB.modals);

  const sunA = profileA.signs.sun;
  const sunB = profileB.signs.sun;

  // Component scores
  const elemental = ELEMENT_COMPATIBILITY[elemA][elemB];
  const synastry = SIGN_SYNASTRY[sunA]?.[sunB] ?? 60;
  const modalScore = MODAL_COMPATIBILITY[modalA][modalB];
  const emotional = stringSimilarity(profileA.traits.emotionalStyle, profileB.traits.emotionalStyle);
  const communication = stringSimilarity(profileA.traits.communicationStyle, profileB.traits.communicationStyle);
  const stability = Math.round((elemental + modalScore) / 2);

  // Weighted overall score
  const matchScore = Math.round(
    synastry * 0.30 +
    elemental * 0.25 +
    emotional * 0.20 +
    communication * 0.15 +
    stability * 0.10
  );

  const clampedScore = Math.min(98, Math.max(15, matchScore));

  const breakdown = {
    elemental: Math.min(100, elemental),
    emotional: Math.min(100, emotional),
    communication: Math.min(100, communication),
    stability: Math.min(100, stability),
  };

  return {
    matchScore: clampedScore,
    explanation: buildExplanation(profileA, profileB, clampedScore),
    strengths: buildStrengths(profileA, profileB, clampedScore),
    frictionPoints: buildFrictionPoints(profileA, profileB),
    breakdown,
  };
}
