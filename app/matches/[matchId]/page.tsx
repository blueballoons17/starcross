"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ZODIAC_PATHS } from "@/components/ui/zodiac-icon";

// ─── Lookup tables ─────────────────────────────────────────────────────────────

const SIGN_ELEMENT: Record<string, string> = {
  Aries:"fire", Leo:"fire", Sagittarius:"fire",
  Taurus:"earth", Virgo:"earth", Capricorn:"earth",
  Gemini:"air", Libra:"air", Aquarius:"air",
  Cancer:"water", Scorpio:"water", Pisces:"water",
};
const SIGN_MODALITY: Record<string, string> = {
  Aries:"Cardinal", Cancer:"Cardinal", Libra:"Cardinal", Capricorn:"Cardinal",
  Taurus:"Fixed", Leo:"Fixed", Scorpio:"Fixed", Aquarius:"Fixed",
  Gemini:"Mutable", Virgo:"Mutable", Sagittarius:"Mutable", Pisces:"Mutable",
};
const SIGN_PLANET: Record<string, string> = {
  Aries:"Mars", Taurus:"Venus", Gemini:"Mercury", Cancer:"Moon",
  Leo:"Sun", Virgo:"Mercury", Libra:"Venus", Scorpio:"Pluto",
  Sagittarius:"Jupiter", Capricorn:"Saturn", Aquarius:"Uranus", Pisces:"Neptune",
};
const EL: Record<string, { hex:string; name:string; quality:string }> = {
  fire:  { hex:"#b45309", name:"Fire",  quality:"Initiative, drive, passion"     },
  earth: { hex:"#166534", name:"Earth", quality:"Patience, form, reliability"    },
  air:   { hex:"#075985", name:"Air",   quality:"Thought, exchange, connection"  },
  water: { hex:"#5b21b6", name:"Water", quality:"Feeling, depth, memory"         },
};

// ─── Richer sign placement descriptions ───────────────────────────────────────

const SIGN_DESC: Record<string, { sun:string; moon:string; rising:string; keyword:string }> = {
  Aries: {
    keyword: "Initiative",
    sun: "Identity is built around action and the first move. There's a genuine need to be in motion toward something — not restlessness, but a fundamental belief that things happen through doing. The challenge is learning to finish what's started, and to value depth as much as speed.",
    moon: "Emotions are processed through action rather than reflection. Sitting with a feeling too long is uncomfortable; moving through it is instinctive. In relationships this reads as directness and intensity, sometimes as impatience with partners who need more processing time.",
    rising: "The first impression is immediate and forward-moving. People register energy before they register nuance. There's an openness here — you'll walk toward things most people approach cautiously — which comes across as confidence, and occasionally as a lack of filter.",
  },
  Taurus: {
    keyword: "Constancy",
    sun: "Identity is grounded in what's built, kept, and returned to. Stability isn't a comfort measure — it's the condition under which everything else becomes possible. The patience here is genuine, not performed, and it earns a loyalty that most people only approximate.",
    moon: "Needs physical comfort and emotional constancy. Sudden shifts in tone or plan register as threats, even small ones. In practice, this means showing love through presence and consistency, and needing the same in return — nothing elaborate, just reliable.",
    rising: "The first impression is unhurried and solid. People sense quickly that you won't be pushed into anything, which either reassures them or frustrates them depending on what they came for. The groundedness is real, not a pose.",
  },
  Gemini: {
    keyword: "Exchange",
    sun: "Identity is built in language and thought. The self becomes legible through conversation — talking isn't just communication, it's how ideas form. Boredom is a genuine threat. The need isn't novelty for its own sake, but the constant movement of ideas and people.",
    moon: "Emotions need to be articulated to be real. Talking through a feeling often matters more than resolving it. The emotional register is quick and variable, which can read as light, but the underlying need for intellectual intimacy is serious.",
    rising: "The first impression is quick, curious, and socially easy. People feel immediately at ease, which is both a gift and a kind of camouflage — the surface fluency can obscure how much is actually going on.",
  },
  Cancer: {
    keyword: "Belonging",
    sun: "Home, lineage, and protective love are at the center. Feelings are deep and retained long after the moment that generated them. The identity is shaped by what's been survived, cared for, and built into a sense of place — wherever that place is.",
    moon: "This is the Moon's home sign. The emotional world here is rich, porous, and long-memoried. Safety is required before full opening, and once it's established, the care given is total. The challenge is the boundary between empathy and absorption.",
    rising: "The first impression is warm and careful. People sense that closeness takes time and that once earned it's permanent. There's a quality of not-quite-available that draws people in — they want to be the one who gets through.",
  },
  Leo: {
    keyword: "Generosity",
    sun: "Needs to matter and to be seen doing so — not from vanity, but from a genuine understanding that contribution requires acknowledgment. When there's room to lead and be appreciated, the generosity this unlocks is real and sustaining.",
    moon: "Needs warmth and recognition, not in small doses. Is hurt more easily by indifference than by open conflict. In relationships, gives a great deal and watches closely for whether it's received. The vulnerability here is real, even if it rarely shows.",
    rising: "Enters with presence. People notice before anything is said. The first impression is warm and a little theatrical — not performed exactly, just large. People tend to remember the encounter.",
  },
  Virgo: {
    keyword: "Discernment",
    sun: "Identity is built around usefulness, precision, and the satisfaction of doing something well. The standard held for self is higher than the standard held for others, which is often invisible to the people who experience only the criticism.",
    moon: "Processes emotion by analysing it. A feeling without a cause is uncomfortable; once the cause is named, it becomes manageable. Needs order and quiet. Shows love through careful, specific, practical acts that often go unrecognised for what they are.",
    rising: "The first impression is composed and observant. People sense they're being read accurately, which is true. The watchfulness can read as coldness but is usually just the time taken before extending trust.",
  },
  Libra: {
    keyword: "Reciprocity",
    sun: "Relationships are the medium through which identity is understood. This isn't dependency — it's a genuine recognition that the self exists in context, and that balance and fairness are prerequisites for everything else.",
    moon: "Needs harmony as a baseline condition. Conflict is genuinely uncomfortable rather than just unpleasant, which means it gets avoided past the point of usefulness. Needs a partner who can name tensions so there's no pressure to be the one to raise them.",
    rising: "The first impression is graceful and easy to like. People feel comfortable very quickly, which is partly warmth and partly skill. The surface harmony is real enough — what takes longer to see is what's underneath it.",
  },
  Scorpio: {
    keyword: "Depth",
    sun: "Depth is the standard everything is held to. Surface-level connection has no appeal. The identity is shaped through transformation — what's been survived, what's been lost, what's been fundamentally changed by experience.",
    moon: "Feels everything completely and forgets nothing. Trust is built in geological time and breaks in a second. The intimacy needed is real and total — not approximate, not managed. The challenge is learning that not everyone who asks for less is settling.",
    rising: "The first impression is intense and self-contained. People sense there is more happening than what's visible, which is accurate. The magnetism is real and often unconscious — it's the impression of someone who has nothing to prove.",
  },
  Sagittarius: {
    keyword: "Meaning",
    sun: "Identity is organised around freedom and the question of whether the life being lived means something. The need isn't for constant travel — it's for the sense that expansion is always possible, that the horizon hasn't closed.",
    moon: "Needs lightness and space. Heavy, demanding emotional dynamics drain quickly. Processes feelings through movement, perspective, and the long view — which sometimes looks like avoidance and sometimes genuinely is.",
    rising: "The first impression is open, enthusiastic, and unjudging. People feel immediately received. The warmth is real; the depth takes longer to disclose, which surprises people who assumed from the openness that there was nothing more.",
  },
  Capricorn: {
    keyword: "Integrity",
    sun: "The sense of self is earned through work and responsibility. It isn't approval that matters — it's the private knowledge that obligations have been met and that what's been built is real. Takes commitment seriously and keeps it.",
    moon: "Self-contained and slow to show it. Was probably taught early that holding it together is the job. In a relationship, what's needed is a person who makes it feel safe not to. This can take a long time to arrive at.",
    rising: "The first impression is competent, steady, and a little guarded. People assume the person in front of them has their life sorted, which is often true and occasionally lonely. Trust is built through consistency, not charisma.",
  },
  Aquarius: {
    keyword: "Autonomy",
    sun: "Identity is individual, sometimes as a matter of principle. Thinking independently isn't just a preference — it's a kind of ethical commitment. Cares about the collective while needing freedom from it. Intellectual liberty is non-negotiable.",
    moon: "More comfortable with ideas than with feelings. Cares deeply but processes care through understanding rather than warmth. Space is not indifference — it's the condition for re-engagement. Needs a partner who can read the difference.",
    rising: "The first impression is unusual and hard to place. People sense they're encountering someone operating from a different set of values, which is interesting or unsettling depending on their tolerance for surprise. The distinctiveness is not a performance.",
  },
  Pisces: {
    keyword: "Porousness",
    sun: "The boundary between self and world is naturally thin. The identity is fluid, which makes for extraordinary empathy and an occasional difficulty locating the self when the world is very loud. The gift and the challenge are the same thing.",
    moon: "Needs softness, creativity, and transcendence — something that lifts the experience above the ordinary. Harsh or cynical environments deplete quickly. Needs a partner who understands sensitivity as a form of perception, not as a problem to manage.",
    rising: "The first impression is gentle, dreamlike, and easy to confide in. People feel immediately that they can say things. The openness is real, though what's behind it takes longer to understand — there is more structure there than the surface suggests.",
  },
};

// ─── Aspect metadata (deeper descriptions) ────────────────────────────────────

type AspectKind = "conjunction"|"trine"|"sextile"|"square"|"opposition"|"neutral";

const ASPECT: Record<AspectKind, {
  color:string; dash?:string; label:string; weight:number;
  desc:string; feel:string;
  sunDesc:string; moonDesc:string; risingDesc:string;
}> = {
  conjunction: {
    color:"#6d28d9", label:"Conjunction", weight:2,
    desc: "These energies merge into one — the most direct contact two charts can make. There is no negotiation here, no translation. The planets involved operate as one force, for better or worse. In synastry, a conjunction is immediately felt and impossible to ignore.",
    feel: "Fused, intense, immediate",
    sunDesc: "Two identities recognising each other at the root level. You'll often feel mirrored in the ways that matter most — your drives, your sense of self, what you're working toward. The risk is too much of the same thing with no balance provided.",
    moonDesc: "Emotional instincts are nearly identical. You react to the same things, need the same things from a partner. The comfort this creates is genuine. The risk is an emotional echo chamber — reinforcing each other's patterns without expanding them.",
    risingDesc: "The way you each enter a room, handle first impressions, and present to the world is deeply aligned. You'll move through social contexts in a similar register, which creates cohesion but can also mean neither of you compensates for the other's blind spots.",
  },
  trine: {
    color:"#15803d", label:"Trine", weight:1.5,
    desc: "Planets in trine share the same element, which means they operate from the same fundamental frequency. In synastry, this is the aspect of ease — not absence of complexity, but genuine natural alignment that doesn't require effort to sustain.",
    feel: "Natural, accepting, quietly sustaining",
    sunDesc: "Your core identities share an elemental foundation. There's a basic understanding of each other's drives and values that doesn't need explaining. The ease is real — the risk is taking it for granted and letting the relationship coast on affinity rather than deepening it.",
    moonDesc: "Your emotional languages are the same. The Moon trine is one of the quietest gifts in synastry. You can be together without performance, without translation, without effort. Long silences that would feel uncomfortable with others are simply comfortable here.",
    risingDesc: "The way you each navigate the world aligns naturally. Social contexts, first impressions, how you engage with strangers — these move in the same current. This creates an easy public-facing cohesion that others often notice before you do.",
  },
  sextile: {
    color:"#0369a1", dash:"6 3", label:"Sextile", weight:1,
    desc: "Planets 60 degrees apart run in compatible but distinct directions. In synastry, the sextile shows where two people's energies support each other without requiring them to be the same. It's a quiet aspect — it rarely announces itself, but it provides real texture to a relationship over time.",
    feel: "Supportive, complementary, low friction",
    sunDesc: "Your identities are compatible without being identical. You'll push each other forward without collision. This aspect tends to build over time rather than arriving fully-formed — the respect and support you find in each other will deepen as you grow.",
    moonDesc: "Your emotional styles are compatible without being mirrors. You'll find each other's ways of handling feelings familiar enough to be comfortable, different enough to be illuminating. This is a steady, sustaining Moon contact.",
    risingDesc: "How you each present to the world is complementary. You'll balance each other socially — one leading where the other holds back, without this feeling like a division of labour so much as a natural fit.",
  },
  square: {
    color:"#b45309", dash:"3 4", label:"Square", weight:1,
    desc: "Squares generate friction that demands resolution. In synastry, this is the aspect most associated with memorable, formative relationships — not because they're easy, but because they ask both people to grow. The most significant connections in a life often have squares.",
    feel: "Activating, demanding, genuinely growth-oriented",
    sunDesc: "Your identities push against each other in ways that require real negotiation. Your fundamental natures aren't incompatible — they're in creative tension. This relationship won't let either of you be passive about who you are or what you need.",
    moonDesc: "Your emotional rhythms are out of phase. One may need closeness when the other needs distance, words when the other needs silence. This is the relationship's most persistent negotiation — not fatal, but requiring the development of a shared language that neither of you carries naturally.",
    risingDesc: "The way you each navigate the world creates friction. Your instinctive approaches to situations are different enough that you'll sometimes feel like you're misreading each other's social moves. This resolves into complementarity with time, but not without work.",
  },
  opposition: {
    color:"#be123c", dash:"2 4", label:"Opposition", weight:1,
    desc: "Oppositions place two planets at maximum distance. In synastry, this is the aspect of attraction to your complement — the thing you hold differently, or don't hold at all. It creates genuine magnetism and genuine challenge: you are drawn to precisely what you find most foreign.",
    feel: "Magnetic, polarising, profoundly complementary",
    sunDesc: "You are drawn to something in their fundamental identity that you carry differently. This is the classic attraction-to-your-opposite dynamic — not superficial, but structural. At its best, you'll provide what the other needs. At its hardest, you'll seem to want irreconcilable things from the same relationship.",
    moonDesc: "You process emotion from different ends of the same axis. Your emotional defaults are in many ways each other's inverse. This creates a powerful pull and a persistent negotiation: you'll feel the other person emotionally in a way that's compelling and sometimes baffling.",
    risingDesc: "The way you enter the world is opposite in orientation. This creates a fascinating initial impression on both sides — you present what the other doesn't, which is magnetic in early contact. In practice, it requires learning to read each other's social register accurately.",
  },
  neutral: {
    color:"#9ca3af", dash:"2 6", label:"Neutral", weight:0.5,
    desc: "No strong aspect between these placements. The relationship's tone here will be set more by how the rest of the chart connects.", feel: "",
    sunDesc:"", moonDesc:"", risingDesc:"",
  },
};

function aspectKind(a:string, b:string): AspectKind {
  if (!a||!b||a==="Unknown"||b==="Unknown") return "neutral";
  if (a===b) return "conjunction";
  const eA=SIGN_ELEMENT[a], eB=SIGN_ELEMENT[b];
  const mA=SIGN_MODALITY[a], mB=SIGN_MODALITY[b];
  if (!eA||!eB) return "neutral";
  if ((eA==="fire"&&eB==="water")||(eA==="water"&&eB==="fire")) return "opposition";
  if ((eA==="earth"&&eB==="air")||(eA==="air"&&eB==="earth")) return "opposition";
  if (eA===eB) return "trine";
  if ((eA==="fire"&&eB==="air")||(eA==="air"&&eB==="fire")) return "sextile";
  if ((eA==="earth"&&eB==="water")||(eA==="water"&&eB==="earth")) return "sextile";
  if (mA===mB) return "square";
  return "neutral";
}

// ─── Relationship analysis engine ─────────────────────────────────────────────

const BOTH_EL: Record<string, { heading:string; body:string }> = {
  fire:  { heading:"You both lead with fire", body:"Shared fire means the relationship will have real energy — initiative, momentum, directness. You'll understand each other's urgency and the need for forward motion. The risk isn't too little energy; it's too much of the same kind. Without an earth or water counterbalance, things can flare and burn rather than build." },
  earth: { heading:"You both carry earth energy", body:"Patience, practicality, and reliability run through both charts. The relationship will be stable and self-sustaining — built on what you do rather than what you declare. The risk is calcification: mutual comfort shading into mutual inertia when neither person pushes the other toward something new." },
  air:   { heading:"You're both air-dominant", body:"Conversation and ideas are your shared native language. Expect genuine intellectual connection, hours of talking, a relationship that operates largely in the realm of thought. The risk is living too much in your heads — air-heavy connections sometimes avoid the emotional and physical depths that give relationships texture and durability." },
  water: { heading:"You both move through water", body:"Deep feeling, intuitive connection, and emotional memory characterise both charts. You'll understand each other's inner worlds without explanation. The risk is amplification without grounding — two water charts together can reinforce each other's sensitivities without providing the structure needed to move through them." },
};
const NEITHER_EL: Record<string, { heading:string; body:string }> = {
  fire:  { heading:"Neither brings natural fire", body:"Motivation, directness, and spontaneity don't come instinctively to either chart. This doesn't mean the relationship lacks energy — but initiating action, taking risks, and recovering quickly from setbacks may require more conscious effort than feels natural. You may both find yourselves waiting for the other to go first." },
  earth: { heading:"Neither brings much earth", body:"Stability, practicality, and patience with the material world are underrepresented in both charts. The relationship may feel alive and emotionally rich, but building something durable — routines, shared finances, long-term plans — will take intention. Without it, there's a risk of something genuinely good remaining unbuilt." },
  air:   { heading:"Neither brings strong air", body:"Verbal detachment, intellectual lightness, and easy surface-level exchange aren't natural to either chart. Your conversations may go deep immediately, which is a gift — but breadth and levity in communication require more work. Processing disagreements in real time, without emotional charge, may be harder than you'd expect." },
  water: { heading:"Neither defaults to water", body:"Neither chart leads with emotional depth, intuitive connection, or feelings-first processing. The relationship will likely be practical and clear-headed, but emotional intimacy won't cultivate itself — it needs deliberate attention. Long pauses in emotional closeness may pass without either of you naming them, which over time creates distance that feels inexplicable." },
};
const BOTH_MOD: Record<string, { heading:string; body:string }> = {
  Cardinal: { heading:"Both of you initiate", body:"Cardinal energy runs through both charts — you're both starters, initiators, people who begin things. Expect a relationship with real momentum and genuine mutual drive. The challenge is follow-through: Cardinal signs often move to the next thing before the current one is finished. Neither of you will naturally be the one to sustain and consolidate." },
  Fixed:    { heading:"You're both fixed in nature", body:"Fixed energy characterises both charts — persistence, commitment, and a resistance to being redirected. The relationship will be built to last, but not quickly. Trust is earned slowly and held onto tightly. The challenge is stubbornness: when you disagree, neither of you will naturally be the one to yield." },
  Mutable:  { heading:"You're both highly adaptable", body:"Mutable energy fills both charts — flexibility, adaptability, and a preference for movement over structure. You'll move with each other easily and handle change well together. The challenge is grounding: without a Fixed or Cardinal anchor, the relationship can remain perpetually in motion, changing form before it settles into anything." },
};
const NEITHER_MOD: Record<string, { heading:string; body:string }> = {
  Cardinal: { heading:"Neither tends to initiate", body:"The impulse to begin new things, set direction, and push forward isn't prominent in either chart. The relationship will be warm and deep, but choosing to act — starting new phases, addressing things directly, making decisions — may require more activation energy than feels natural for either of you." },
  Fixed:    { heading:"Neither holds firm naturally", body:"Fixed determination — the capacity to stay with something past the point where it stops being exciting — isn't native to either chart. The relationship will move well, but building something that truly lasts may require consciously developing the kind of commitment and follow-through that neither of you defaults to." },
  Mutable:  { heading:"Neither is particularly adaptable", body:"Flexibility and adaptability aren't the dominant notes in either chart. This means the relationship will have a strong, consistent character — but may struggle with change, disruption, and the unexpected. When life requires pivoting, you may both find yourselves more resistant than the situation calls for." },
};

function buildRelationshipAnalysis(self: ChartData, other: ChartData) {
  const selfEls  = [SIGN_ELEMENT[self.sunSign], SIGN_ELEMENT[self.moonSign], SIGN_ELEMENT[self.risingSign]].filter(Boolean);
  const otherEls = [SIGN_ELEMENT[other.sunSign], SIGN_ELEMENT[other.moonSign], SIGN_ELEMENT[other.risingSign]].filter(Boolean);
  const selfMods  = [SIGN_MODALITY[self.sunSign], SIGN_MODALITY[self.moonSign], SIGN_MODALITY[self.risingSign]].filter(Boolean);
  const otherMods = [SIGN_MODALITY[other.sunSign], SIGN_MODALITY[other.moonSign], SIGN_MODALITY[other.risingSign]].filter(Boolean);

  const allEls  = ["fire","earth","air","water"] as const;
  const allMods = ["Cardinal","Fixed","Mutable"] as const;

  const sharedEls  = allEls.filter(e => selfEls.includes(e) && otherEls.includes(e));
  const missingEls = allEls.filter(e => !selfEls.includes(e) && !otherEls.includes(e));
  const sharedMods  = allMods.filter(m => selfMods.includes(m) && otherMods.includes(m));
  const missingMods = allMods.filter(m => !selfMods.includes(m) && !otherMods.includes(m));

  const sunA     = aspectKind(self.sunSign, other.sunSign);
  const moonA    = aspectKind(self.moonSign, other.moonSign);
  const risingA  = aspectKind(self.risingSign, other.risingSign);

  const both: { heading:string; body:string }[] = [
    ...sharedEls.map(e => BOTH_EL[e]),
    ...sharedMods.map(m => BOTH_MOD[m]),
  ].filter(Boolean).slice(0, 3);

  const neither: { heading:string; body:string }[] = [
    ...missingEls.map(e => NEITHER_EL[e]),
    ...missingMods.map(m => NEITHER_MOD[m]),
  ].filter(Boolean).slice(0, 2);

  // Trajectory: Sun layer → Moon layer → synthesis
  const trajectory: string[] = [];

  // Sun-Sun paragraph
  const ss = self.sunSign, os = other.sunSign;
  const sunMap: Partial<Record<AspectKind,string>> = {
    conjunction: `Your ${ss} Sun meeting their ${os} Sun directly is one of the cleaner forms of recognition in synastry. You see each other quickly — identity-level resonance that creates immediate comfort. The risk is a mirror that only validates: same-sign Sun contacts can reinforce who you already are rather than calling you toward who you're becoming. Staying distinct within the closeness requires some effort.`,
    trine: `Your ${ss} Sun and their ${os} Sun are in trine — same element, different expression. Your core identities move in the same current without being identical. There's a basic understanding of each other's drives that doesn't need to be explained. This is a gift, but gifts get taken for granted: the ease of this contact can make the relationship comfortable before it becomes deep.`,
    sextile: `Your ${ss} Sun and their ${os} Sun are in sextile. Your identities are compatible without being mirrors — you'll push each other forward without friction. This is an aspect that builds quietly over time rather than arriving complete. The respect you develop for each other will increase as you grow together and see how the differences complement.`,
    square: `Your ${ss} Sun squares their ${os} Sun — your identities are in fundamental creative tension. This doesn't mean opposition so much as dynamic friction: you each push on something real in the other. The most memorable relationships often carry a Sun-Sun square. It won't let you be passive about who you are, and it will ask both of you to grow past comfortable positions.`,
    opposition: `Your ${ss} Sun sits opposite their ${os} Sun — you are drawn to something in their identity that you hold differently or don't hold at all. This is the original attraction pattern. Each person represents something the other finds compelling and partly foreign. At its best, this polarity creates real balance. The challenge is that what draws you together also describes where you most fundamentally differ.`,
  };
  trajectory.push(sunMap[sunA] ?? `Your ${ss} Sun and their ${os} Sun meet without a strong aspect — the relationship's identity-level tone will be set less by Sun contact and more by how Moon and Rising connect.`);

  // Moon-Moon paragraph
  const sm = self.moonSign, om = other.moonSign;
  const moonMap: Partial<Record<AspectKind,string>> = {
    conjunction: `Emotionally, your ${sm} Moon and their ${om} Moon are in the same sign — your instinctive responses, what you need when things are hard, and how you recover are nearly identical. The comfort this creates is real and deep. The challenge is the echo chamber effect: two people with the same Moon can amplify each other's emotional patterns rather than expanding them. Growth may require reaching outside what feels naturally familiar.`,
    trine: `Your ${sm} Moon and their ${om} Moon are in trine. Emotionally, you speak the same language without having learned it together. This is one of the quieter gifts in synastry — not dramatic, but deeply sustaining. You can be in the same space without performance, without explanation, without effort. The long silences that would feel awkward with others simply feel right here.`,
    sextile: `Your ${sm} Moon and their ${om} Moon are in sextile — emotionally compatible without being identical. Your emotional styles will feel familiar enough to be comfortable and different enough to be interesting. This is a steady, sustaining Moon contact that tends to deepen with time rather than peaking early.`,
    square: `Your ${sm} Moon and their ${om} Moon are in square, which is where the relationship does most of its real work. You have different emotional rhythms: different defaults for how much closeness feels right, how much space, how long to sit with something before naming it. This isn't incompatibility — it's the relationship's most persistent negotiation, and how you handle it will determine more than almost anything else.`,
    opposition: `Your ${sm} Moon and their ${om} Moon oppose each other — you process emotion from different ends of the same axis. This is both the source of genuine fascination and the relationship's most demanding dynamic. You'll find each other's emotional styles compelling and occasionally baffling. At its best, each of you provides what the other's emotional nature lacks. At its most difficult, you'll feel like you're feeling the same things in completely different languages.`,
  };
  trajectory.push(moonMap[moonA] ?? `Your ${sm} Moon and their ${om} Moon meet without a strong aspect. Emotional compatibility will be built more through shared experience than chart-level resonance — a slower build, but no less real.`);

  // Synthesis paragraph
  const aspects = [sunA, moonA, risingA];
  const trineCount = aspects.filter(a=>a==="trine").length;
  const squareCount = aspects.filter(a=>a==="square").length;
  const conjCount = aspects.filter(a=>a==="conjunction").length;
  const oppCount = aspects.filter(a=>a==="opposition").length;

  let synthesis = "";
  if (trineCount >= 2) {
    synthesis = "Across the primary contacts, this chart leans toward natural ease. The relationship will feel sustaining and comfortable from early on. The thing to watch is whether ease becomes complacency — charts this harmonious sometimes lack the friction that drives individual growth. The relationship is a gift; the work is staying curious within it.";
  } else if (squareCount >= 2) {
    synthesis = "Multiple squares across the primary contacts means this is a relationship that will ask a great deal of both people. Not ask in a punishing way, but in the way a serious thing asks — it won't let you coast. The challenge and the depth are inseparable here. What's built through the friction will be real in a way that easier connections sometimes aren't.";
  } else if (conjCount >= 2) {
    synthesis = "Strong conjunction energy across the chart means you'll feel immediately and persistently recognised by each other. There's a directness to this connection that can feel rare. The work is maintaining distinctness — in relationships with this much merger, it's possible to lose track of where one person ends and the other begins, which ultimately serves neither.";
  } else if (oppCount >= 2) {
    synthesis = "Opposition contacts dominate the primary aspects, which means this is a relationship shaped by polarity. You each represent something the other needs, and the attraction runs deep for exactly that reason. The challenge is learning to hold your own position while genuinely making room for theirs — the magnetism is real, but so is the distance it can create when either person feels unseen.";
  } else {
    synthesis = "The primary aspects here are mixed — some ease, some friction, some polarity. That balance tends to create relationships that are interesting and durable: not so harmonious that nothing is asked, not so difficult that the cost outweighs the connection. The texture will shift depending on which layer of the relationship is most active at a given time.";
  }
  trajectory.push(synthesis);

  return { both, neither, trajectory };
}

// ─── SVG layout ────────────────────────────────────────────────────────────────

const W = 640, H = 380;
const SELF_HUB  = { x:140, y:190 };
const OTHER_HUB = { x:500, y:190 };
const CENTER    = { x:320, y:190 };
const CIRCLE_R  = 135;

const SELF_PLANETS = [
  { planet:"Sun",    x:60,  y:68  },
  { planet:"Moon",   x:26,  y:192 },
  { planet:"Rising", x:60,  y:316 },
];
const OTHER_PLANETS = [
  { planet:"Sun",    x:580, y:68  },
  { planet:"Moon",   x:614, y:192 },
  { planet:"Rising", x:580, y:316 },
];
const PRIMARY_CTRL: Record<string,{cx:number;cy:number}> = {
  Sun:    { cx:320, cy:14  },
  Moon:   { cx:320, cy:192 },
  Rising: { cx:320, cy:366 },
};
const CROSS_CTRL: Record<string,{cx:number;cy:number}> = {
  "Sun-Moon":    { cx:320, cy:108 }, "Moon-Sun":    { cx:320, cy:98  },
  "Sun-Rising":  { cx:320, cy:182 }, "Rising-Sun":  { cx:320, cy:172 },
  "Moon-Rising": { cx:320, cy:264 }, "Rising-Moon": { cx:320, cy:256 },
};

// Quadratic bezier midpoint
function qMid(x1:number,y1:number,cx:number,cy:number,x2:number,y2:number) {
  return {
    x: 0.25*x1 + 0.5*cx + 0.25*x2,
    y: 0.25*y1 + 0.5*cy + 0.25*y2,
  };
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChartData { sunSign:string; moonSign:string; risingSign:string }
interface MatchDetail {
  id:string; matchScore:number;
  breakdown:{ elemental:number; emotional:number; communication:number; stability:number };
  explanation:string; strengths:string[]; frictionPoints:string[];
  otherUser:{ name:string; birthDate:string; birthCity:string; birthCountry:string; avatarUrl?:string|null };
  otherAstro:ChartData; currentAstro:ChartData|null;
}

type NodeType = "hub"|"planet"|"relationship";
interface NodeDef {
  id:string; label:string; sign:string; x:number; y:number;
  person:"self"|"other"|"both"; type:NodeType; planet?:string; floatD:number;
}
interface EdgeDef {
  id:string; fromX:number; fromY:number; toX:number; toY:number; cx:number; cy:number;
  kind:AspectKind; isPrimary:boolean; planetLabel:string;
  selfPlanet:string; otherPlanet:string; selfSign:string; otherSign:string;
  fromId:string; toId:string;
}

// ─── Build graph ───────────────────────────────────────────────────────────────

function buildGraph(selfName:string, otherName:string, self:ChartData, other:ChartData) {
  const ss = { Sun:self.sunSign, Moon:self.moonSign, Rising:self.risingSign };
  const os = { Sun:other.sunSign, Moon:other.moonSign, Rising:other.risingSign };

  const nodes: NodeDef[] = [
    { id:"sh", label:selfName.split(" ")[0].slice(0,5),  sign:self.sunSign,  ...SELF_HUB,  person:"self",  type:"hub",          floatD:0   },
    { id:"oh", label:otherName.split(" ")[0].slice(0,5), sign:other.sunSign, ...OTHER_HUB, person:"other", type:"hub",          floatD:0.5 },
    { id:"rel", label:"us",                              sign:"",            ...CENTER,    person:"both",  type:"relationship", floatD:0.2 },
    ...SELF_PLANETS.map( ({planet,x,y},i) => ({ id:`s-${planet.toLowerCase()}`, label:planet, sign:ss[planet as keyof typeof ss], x, y, person:"self"  as const, type:"planet" as const, planet, floatD:i*0.3      })),
    ...OTHER_PLANETS.map(({planet,x,y},i) => ({ id:`o-${planet.toLowerCase()}`, label:planet, sign:os[planet as keyof typeof os], x, y, person:"other" as const, type:"planet" as const, planet, floatD:i*0.3+0.4  })),
  ];

  const nm = Object.fromEntries(nodes.map(n=>[n.id,n]));
  const edges: EdgeDef[] = [];

  (["Sun","Moon","Rising"] as const).forEach(p => {
    const a=nm[`s-${p.toLowerCase()}`], b=nm[`o-${p.toLowerCase()}`];
    if (!a||!b) return;
    edges.push({ id:`cross-${p}`, fromX:a.x, fromY:a.y, toX:b.x, toY:b.y, ...PRIMARY_CTRL[p], kind:aspectKind(ss[p],os[p]), isPrimary:true, planetLabel:p, selfPlanet:p, otherPlanet:p, selfSign:ss[p], otherSign:os[p], fromId:a.id, toId:b.id });
  });

  const pairs: [keyof typeof ss, keyof typeof os][] = [["Sun","Moon"],["Moon","Sun"],["Sun","Rising"],["Rising","Sun"],["Moon","Rising"],["Rising","Moon"]];
  pairs.forEach(([a,b]) => {
    const k=aspectKind(ss[a],os[b]);
    if (k==="neutral") return;
    const ctrl=CROSS_CTRL[`${a}-${b}`]??{cx:320,cy:192};
    const na=nm[`s-${a.toLowerCase()}`], nb=nm[`o-${b.toLowerCase()}`];
    if (!na||!nb) return;
    edges.push({ id:`cross-${a}-${b}`, fromX:na.x, fromY:na.y, toX:nb.x, toY:nb.y, ...ctrl, kind:k, isPrimary:false, planetLabel:`${a} — ${b}`, selfPlanet:a, otherPlanet:b, selfSign:ss[a], otherSign:os[b], fromId:na.id, toId:nb.id });
  });

  return { nodes, edges, nm };
}

// ─── Glyph ─────────────────────────────────────────────────────────────────────

function Glyph({sign,cx,cy,r,color,opacity=1}:{sign:string;cx:number;cy:number;r:number;color:string;opacity?:number}) {
  if (!ZODIAC_PATHS[sign]) return null;
  const s=(r*1.1)/24;
  return (
    <g transform={`translate(${cx-r*1.1/2},${cy-r*1.1/2}) scale(${s})`}
      fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={1.8/s} style={{color,pointerEvents:"none",opacity}}>
      {ZODIAC_PATHS[sign]}
    </g>
  );
}

// ─── SVG chart ─────────────────────────────────────────────────────────────────

interface ChartProps {
  selfName:string; otherName:string; self:ChartData; other:ChartData;
  hoveredNodeId:string|null; hoveredEdgeId:string|null;
  onHoverNode:(id:string|null,node:NodeDef|null)=>void;
  onHoverEdge:(id:string|null,edge:EdgeDef|null)=>void;
}

function SynastryChart({selfName,otherName,self,other,hoveredNodeId,hoveredEdgeId,onHoverNode,onHoverEdge}:ChartProps) {
  const {nodes,edges,nm} = buildGraph(selfName,otherName,self,other);

  const connectedIds = new Set<string>();
  const activeEdgeIds = new Set<string>();
  if (hoveredNodeId==="rel") {
    // relationship node: treat all nodes+edges as connected
    nodes.forEach(n=>connectedIds.add(n.id));
    edges.forEach(e=>activeEdgeIds.add(e.id));
  } else {
    if (hoveredNodeId) {
      edges.forEach(e=>{
        if (e.fromId===hoveredNodeId||e.toId===hoveredNodeId) {
          activeEdgeIds.add(e.id); connectedIds.add(e.fromId); connectedIds.add(e.toId);
        }
      });
    }
    if (hoveredEdgeId) {
      const e=edges.find(x=>x.id===hoveredEdgeId);
      if (e) { connectedIds.add(e.fromId); connectedIds.add(e.toId); activeEdgeIds.add(e.id); }
    }
  }
  const anyH = hoveredNodeId!==null||hoveredEdgeId!==null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:"auto",overflow:"visible"}}>
      {/* Territory rings */}
      <circle cx={SELF_HUB.x}  cy={SELF_HUB.y}  r={CIRCLE_R} fill="none" stroke="#d8d4ce" strokeWidth="0.5" strokeDasharray="4 7"/>
      <circle cx={OTHER_HUB.x} cy={OTHER_HUB.y} r={CIRCLE_R} fill="none" stroke="#d8d4ce" strokeWidth="0.5" strokeDasharray="4 7"/>
      {/* Centre lines */}
      <line x1={320} y1={28} x2={320} y2={H-28} stroke="#ebe7e1" strokeWidth="0.5"/>
      {/* Hub → center spokes */}
      <line x1={SELF_HUB.x} y1={SELF_HUB.y} x2={CENTER.x} y2={CENTER.y} stroke="#d4cfc8" strokeWidth="0.6" strokeDasharray="3 5" opacity={anyH&&hoveredNodeId!=="rel"?0.2:0.6} style={{transition:"opacity 0.18s"}}/>
      <line x1={OTHER_HUB.x} y1={OTHER_HUB.y} x2={CENTER.x} y2={CENTER.y} stroke="#d4cfc8" strokeWidth="0.6" strokeDasharray="3 5" opacity={anyH&&hoveredNodeId!=="rel"?0.2:0.6} style={{transition:"opacity 0.18s"}}/>

      {/* Planet spokes */}
      {(["Sun","Moon","Rising"] as const).map(p=>{
        const sp=SELF_PLANETS.find(x=>x.planet===p)!;
        const op=OTHER_PLANETS.find(x=>x.planet===p)!;
        const sDim=anyH&&!connectedIds.has(`s-${p.toLowerCase()}`)&&hoveredNodeId!=="sh";
        const oDim=anyH&&!connectedIds.has(`o-${p.toLowerCase()}`)&&hoveredNodeId!=="oh";
        return (
          <g key={p}>
            <line x1={SELF_HUB.x}  y1={SELF_HUB.y}  x2={sp.x} y2={sp.y} stroke="#ccc8c0" strokeWidth="0.6" strokeDasharray="2 5" opacity={sDim?0.15:0.65} style={{transition:"opacity 0.18s"}}/>
            <line x1={OTHER_HUB.x} y1={OTHER_HUB.y} x2={op.x} y2={op.y} stroke="#ccc8c0" strokeWidth="0.6" strokeDasharray="2 5" opacity={oDim?0.15:0.65} style={{transition:"opacity 0.18s"}}/>
          </g>
        );
      })}

      {/* Aspect arcs */}
      {edges.map(e=>{
        const meta=ASPECT[e.kind];
        const isAct=activeEdgeIds.has(e.id);
        const isDim=anyH&&!isAct;
        return (
          <path key={e.id}
            d={`M ${e.fromX} ${e.fromY} Q ${e.cx} ${e.cy} ${e.toX} ${e.toY}`}
            fill="none" stroke={meta.color}
            strokeWidth={isAct?(e.isPrimary?2.1:1.5):e.isPrimary?1.2:0.6}
            strokeDasharray={meta.dash}
            strokeOpacity={isDim?0.05:isAct?0.88:e.isPrimary?0.42:0.2}
            strokeLinecap="round"
            style={{transition:"stroke-opacity 0.18s,stroke-width 0.15s",cursor:"pointer"}}
            onMouseEnter={()=>onHoverEdge(e.id,e)}
            onMouseLeave={()=>onHoverEdge(null,null)}
          />
        );
      })}

      {/* Arc midpoint markers for primary aspects */}
      {edges.filter(e=>e.isPrimary&&e.kind!=="neutral").map(e=>{
        const {x:mx,y:my}=qMid(e.fromX,e.fromY,e.cx,e.cy,e.toX,e.toY);
        const meta=ASPECT[e.kind];
        const isAct=activeEdgeIds.has(e.id);
        const isDim=anyH&&!isAct;
        return (
          <g key={`mid-${e.id}`} style={{pointerEvents:"none"}}>
            <circle cx={mx} cy={my} r={5} fill="white" stroke={meta.color}
              strokeWidth={isAct?1.5:0.8} opacity={isDim?0.15:isAct?1:0.55}
              style={{transition:"opacity 0.18s"}}/>
            <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="central"
              fill={meta.color} fontSize="4.5" fontFamily="ui-sans-serif"
              opacity={isDim?0.1:isAct?0.9:0.45}
              style={{transition:"opacity 0.18s",userSelect:"none"}}>
              {meta.label.slice(0,3).toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(n=>{
        const isAct=hoveredNodeId===n.id;
        const isCon=connectedIds.has(n.id);
        const isDim=anyH&&!isAct&&!isCon;
        const el=SIGN_ELEMENT[n.sign]??"air";
        const hex=EL[el]?.hex??"#075985";
        const r=n.type==="hub"?22:n.type==="relationship"?11:14;
        const isRel=n.type==="relationship";

        return (
          <motion.g key={n.id}
            animate={{y:[0,-(2+n.floatD),0]}}
            transition={{duration:3.5+n.floatD*0.8,repeat:Infinity,ease:"easeInOut",delay:n.floatD*0.6}}
            style={{cursor:"pointer"}}
            onMouseEnter={()=>onHoverNode(n.id,n)}
            onMouseLeave={()=>onHoverNode(null,null)}
          >
            {isAct&&!isRel&&<circle cx={n.x} cy={n.y} r={r+8} fill={hex} fillOpacity={0.07} stroke={hex} strokeOpacity={0.15} strokeWidth={0.6}/>}

            <circle cx={n.x} cy={n.y} r={r}
              fill={isRel?"#f7f4ef":"#ffffff"}
              stroke={isAct||(isCon&&!isRel)?hex:isRel?(isAct?"#6b7280":"#b8b0a6"):"#d4cfc8"}
              strokeWidth={isAct?1.8:isRel?0.8:1}
              strokeDasharray={isRel?"3 3":undefined}
              opacity={isDim?0.25:1}
              style={{transition:"stroke 0.18s,opacity 0.18s"}}
            />
            {n.type==="hub"&&<circle cx={n.x} cy={n.y} r={r-5} fill="none" stroke={isDim?"#ede9e3":"#e5e1db"} strokeWidth="0.5"/>}

            {n.type==="planet"&&n.sign&&(
              <Glyph sign={n.sign} cx={n.x} cy={n.y} r={r*0.85} color={isDim?"#ccc8c0":hex} opacity={isDim?0.35:0.82}/>
            )}
            {n.type==="hub"&&(
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="central"
                fill={isDim?"#ccc8c0":"#44403c"} fontSize="8" fontWeight="600"
                fontFamily="ui-serif,Georgia,serif" style={{pointerEvents:"none",userSelect:"none"}}>
                {n.label}
              </text>
            )}
            {isRel&&(
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="central"
                fill={isDim?"#ccc8c0":isAct?"#44403c":"#9c9086"} fontSize="5.5"
                fontFamily="ui-sans-serif,system-ui" letterSpacing="0.1em"
                style={{pointerEvents:"none",userSelect:"none"}}>
                US
              </text>
            )}
            {n.type==="planet"&&(
              <>
                <text x={n.x} y={n.y-r-5} textAnchor="middle"
                  fill={isDim?"#d8d3cc":"#a09890"} fontSize="5.5"
                  fontFamily="ui-sans-serif,system-ui" letterSpacing="0.04em"
                  style={{pointerEvents:"none",userSelect:"none"}}>
                  {n.sign}
                </text>
                <text x={n.person==="self"?n.x+r+4:n.x-r-4} y={n.y+1}
                  textAnchor={n.person==="self"?"start":"end"} dominantBaseline="central"
                  fill={isDim?"#d8d3cc":"#78716c"} fontSize="5.5"
                  fontFamily="ui-sans-serif,system-ui" letterSpacing="0.1em"
                  style={{pointerEvents:"none",userSelect:"none"}}>
                  {n.label.toUpperCase()}
                </text>
              </>
            )}
          </motion.g>
        );
      })}

      <text x={SELF_HUB.x}  y={H-10} textAnchor="middle" fill="#a09890" fontSize="7" fontFamily="ui-sans-serif" letterSpacing="0.14em">YOU</text>
      <text x={OTHER_HUB.x} y={H-10} textAnchor="middle" fill="#a09890" fontSize="7" fontFamily="ui-sans-serif" letterSpacing="0.14em">{(nm["oh"]?.label??"").toUpperCase()}</text>
      <text x={CENTER.x} y={H-10} textAnchor="middle" fill="#c4beb7" fontSize="6" fontFamily="ui-sans-serif" letterSpacing="0.1em">RELATIONSHIP</text>
    </svg>
  );
}

// ─── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({hoveredNode,hoveredEdge,match,self,other}:{
  hoveredNode:NodeDef|null; hoveredEdge:EdgeDef|null;
  match:MatchDetail; self:ChartData; other:ChartData;
}) {
  const analysis = useMemo(()=>buildRelationshipAnalysis(self,other),[self.sunSign,self.moonSign,self.risingSign,other.sunSign,other.moonSign,other.risingSign]);
  const ss = { Sun:self.sunSign, Moon:self.moonSign, Rising:self.risingSign };
  const os = { Sun:other.sunSign, Moon:other.moonSign, Rising:other.risingSign };
  const primaries = (["Sun","Moon","Rising"] as const).map(p=>({ planet:p, kind:aspectKind(ss[p],os[p]), selfSign:ss[p], otherSign:os[p] }));

  const showRelationship = !hoveredNode || hoveredNode.type==="relationship";

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Scrollable dynamic section ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">

          {/* Planet node detail */}
          {hoveredNode&&hoveredNode.type==="planet"&&hoveredNode.planet&&(
            <motion.div key={`node-${hoveredNode.id}`}
              initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              transition={{duration:0.18,ease:[0.22,1,0.36,1]}}
              className="p-6"
            >
              {(()=>{
                const el=SIGN_ELEMENT[hoveredNode.sign]??"air";
                const hex=EL[el]?.hex??"#075985";
                const desc=SIGN_DESC[hoveredNode.sign];
                const pKey=hoveredNode.planet.toLowerCase() as "sun"|"moon"|"rising";
                const isOwn=hoveredNode.person==="self";
                const aspectForThisPlanet = primaries.find(p=>p.planet===hoveredNode.planet);
                const planetAspectDesc = aspectForThisPlanet && ASPECT[aspectForThisPlanet.kind][`${pKey}Desc` as "sunDesc"|"moonDesc"|"risingDesc"];
                return (
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      {ZODIAC_PATHS[hoveredNode.sign]&&(
                        <svg viewBox="0 0 24 24" width={34} height={34} fill="none"
                          stroke={hex} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                          {ZODIAC_PATHS[hoveredNode.sign]}
                        </svg>
                      )}
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">
                          {isOwn?"Your":match.otherUser.name.split(" ")[0]+"'s"} {hoveredNode.planet}
                        </p>
                        <p className="font-serif text-stone-800 text-xl font-semibold leading-none">{hoveredNode.sign}</p>
                        <p className="text-[10px] text-stone-400 mt-1">{SIGN_DESC[hoveredNode.sign]?.keyword}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{color:hex,borderColor:hex+"40",background:hex+"0d"}}>{EL[el]?.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-stone-200 text-stone-500">{SIGN_MODALITY[hoveredNode.sign]}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-stone-200 text-stone-500">{SIGN_PLANET[hoveredNode.sign]}</span>
                    </div>

                    {desc&&<p className="text-stone-600 text-[13px] leading-relaxed mb-5">{desc[pKey]}</p>}

                    {planetAspectDesc&&aspectForThisPlanet&&ASPECT[aspectForThisPlanet.kind].label&&(
                      <div className="border-t border-stone-100 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{background:ASPECT[aspectForThisPlanet.kind].color}}/>
                          <p className="text-[9px] tracking-[0.16em] uppercase text-stone-400">
                            {hoveredNode.planet} {ASPECT[aspectForThisPlanet.kind].label} in synastry
                          </p>
                        </div>
                        <p className="text-stone-500 text-[12px] leading-relaxed">{planetAspectDesc}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* Hub node detail */}
          {hoveredNode&&hoveredNode.type==="hub"&&(
            <motion.div key={`hub-${hoveredNode.id}`}
              initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              transition={{duration:0.18}} className="p-6"
            >
              <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-4">
                {hoveredNode.person==="self"?"Your chart":`${match.otherUser.name.split(" ")[0]}'s chart`}
              </p>
              <div className="space-y-4">
                {(["Sun","Moon","Rising"] as const).map(p=>{
                  const sign=hoveredNode.person==="self"?ss[p]:os[p];
                  const el=SIGN_ELEMENT[sign]??"air";
                  const hex=EL[el]?.hex??"#075985";
                  return (
                    <div key={p} className="flex items-start gap-2.5">
                      {ZODIAC_PATHS[sign]&&(
                        <svg viewBox="0 0 24 24" width={18} height={18} fill="none"
                          stroke={hex} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                          {ZODIAC_PATHS[sign]}
                        </svg>
                      )}
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-stone-400 text-xs">{p}</span>
                          <span className="text-stone-800 text-sm font-medium">{sign}</span>
                        </div>
                        <p className="text-stone-400 text-[11px] mt-0.5 leading-snug">{SIGN_DESC[sign]?.keyword} · {EL[el]?.name} · {SIGN_MODALITY[sign]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Edge detail */}
          {hoveredEdge&&!hoveredNode&&ASPECT[hoveredEdge.kind].desc&&(
            <motion.div key={`edge-${hoveredEdge.id}`}
              initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              transition={{duration:0.18}} className="p-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{background:ASPECT[hoveredEdge.kind].color}}/>
                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">Aspect</p>
                  <p className="font-serif text-stone-800 text-xl font-semibold leading-none">{ASPECT[hoveredEdge.kind].label}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-5 text-sm flex-wrap">
                {(()=>{
                  const eA=SIGN_ELEMENT[hoveredEdge.selfSign]??"air";
                  const eB=SIGN_ELEMENT[hoveredEdge.otherSign]??"air";
                  return (
                    <>
                      <span>
                        <span className="text-stone-400 text-xs">Your {hoveredEdge.selfPlanet} · </span>
                        <span className="font-medium" style={{color:EL[eA]?.hex}}>{hoveredEdge.selfSign}</span>
                      </span>
                      <span className="text-stone-300">×</span>
                      <span>
                        <span className="text-stone-400 text-xs">their {hoveredEdge.otherPlanet} · </span>
                        <span className="font-medium" style={{color:EL[eB]?.hex}}>{hoveredEdge.otherSign}</span>
                      </span>
                    </>
                  );
                })()}
              </div>

              <p className="text-stone-600 text-[13px] leading-relaxed mb-3">{ASPECT[hoveredEdge.kind].desc}</p>
              <p className="text-stone-400 text-xs italic mb-4">{ASPECT[hoveredEdge.kind].feel}</p>

              {/* Planet-specific reading */}
              {(()=>{
                const pKey = (hoveredEdge.selfPlanet===hoveredEdge.otherPlanet
                  ? hoveredEdge.selfPlanet.toLowerCase()
                  : "sun") as "sun"|"moon"|"rising";
                const pDesc = ASPECT[hoveredEdge.kind][`${pKey}Desc` as "sunDesc"|"moonDesc"|"risingDesc"];
                if (!pDesc||!hoveredEdge.isPrimary) return null;
                return (
                  <div className="border-t border-stone-100 pt-4">
                    <p className="text-[9px] tracking-[0.16em] uppercase text-stone-400 mb-2">What this means for you</p>
                    <p className="text-stone-500 text-[12px] leading-relaxed">{pDesc}</p>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Relationship / default view */}
          {showRelationship&&(
            <motion.div key="relationship"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              transition={{duration:0.2}} className="p-6"
            >
              {/* Score */}
              <div className="mb-5">
                <p className="font-serif text-stone-800 text-5xl font-light leading-none">{match.matchScore}</p>
                <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mt-1">% compatibility</p>
              </div>
              <p className="font-serif text-stone-700 text-base mb-1">{match.otherUser.name.split(" ")[0]} × You</p>
              <p className="text-stone-400 text-xs mb-6">{match.otherUser.birthCity}</p>

              {/* Both bring */}
              {analysis.both.length>0&&(
                <div className="mb-5">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-3">What you both bring</p>
                  <div className="space-y-3.5">
                    {analysis.both.map((item,i)=>(
                      <div key={i} className="pl-3 border-l-2 border-stone-200">
                        <p className="text-stone-700 text-xs font-semibold mb-1">{item.heading}</p>
                        <p className="text-stone-500 text-[12px] leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Neither brings */}
              {analysis.neither.length>0&&(
                <div className="mb-5">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-3">What neither brings naturally</p>
                  <div className="space-y-3.5">
                    {analysis.neither.map((item,i)=>(
                      <div key={i} className="pl-3 border-l-2 border-stone-100">
                        <p className="text-stone-600 text-xs font-semibold mb-1">{item.heading}</p>
                        <p className="text-stone-400 text-[12px] leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What will happen */}
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-3">What this relationship creates</p>
                <div className="space-y-3">
                  {analysis.trajectory.map((para,i)=>(
                    <p key={i} className="text-stone-500 text-[12px] leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-stone-300 mt-5">Hover nodes and lines to explore specific placements.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Fixed bottom: primary aspects summary + CTA ── */}
      <div className="shrink-0 border-t border-stone-150 bg-[#faf8f5]">
        <div className="px-5 py-3.5">
          <p className="text-[8px] tracking-[0.2em] uppercase text-stone-400 mb-2">Primary connections</p>
          <div className="space-y-1.5">
            {primaries.filter(p=>p.kind!=="neutral").map(({planet,kind,selfSign,otherSign})=>(
              <div key={planet} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:ASPECT[kind].color}}/>
                <span className="text-[10px] text-stone-500 flex-1 truncate">
                  <span style={{color:EL[SIGN_ELEMENT[selfSign]]?.hex}}>{selfSign}</span>
                  <span className="text-stone-300 mx-1">×</span>
                  <span style={{color:EL[SIGN_ELEMENT[otherSign]]?.hex}}>{otherSign}</span>
                </span>
                <span className="text-[9px] tracking-wide shrink-0" style={{color:ASPECT[kind].color}}>
                  {planet} · {ASPECT[kind].label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 pb-4">
          <Link href={`/messages/${match.id}`}
            className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-stone-700 text-white text-xs font-medium py-2.5 rounded-full transition-colors">
            <MessageCircle className="h-3.5 w-3.5"/>
            Send a message
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Aspect legend ─────────────────────────────────────────────────────────────

function AspectLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {(["conjunction","trine","sextile","square","opposition"] as AspectKind[]).map(k=>(
        <div key={k} className="flex items-center gap-1.5">
          <svg width="14" height="3"><line x1="0" y1="1.5" x2="14" y2="1.5" stroke={ASPECT[k].color} strokeWidth="1.5" strokeDasharray={ASPECT[k].dash}/></svg>
          <span className="text-[9px] text-stone-400 tracking-wide">{ASPECT[k].label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function getAge(d:string) {
  const b=new Date(d),t=new Date();
  let a=t.getFullYear()-b.getFullYear();
  if (t.getMonth()-b.getMonth()<0||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate())) a--;
  return a;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MatchSynastryPage() {
  const {status}=useSession();
  const router=useRouter();
  const params=useParams<{matchId:string}>();
  const [match,setMatch]=useState<MatchDetail|null>(null);
  const [loading,setLoading]=useState(true);
  const [hoveredNode,setHoveredNode]=useState<NodeDef|null>(null);
  const [hoveredEdge,setHoveredEdge]=useState<EdgeDef|null>(null);

  useEffect(()=>{ if(status==="unauthenticated") router.push("/login"); },[status,router]);

  useEffect(()=>{
    if(status!=="authenticated"||!params.matchId) return;
    fetch(`/api/matches/${params.matchId}`)
      .then(r=>r.json()).then(d=>{ if(!d.error) setMatch(d); })
      .catch(console.error).finally(()=>setLoading(false));
  },[status,params.matchId]);

  const handleHoverNode=useCallback((id:string|null,node:NodeDef|null)=>{ setHoveredNode(node); if(node) setHoveredEdge(null); },[]);
  const handleHoverEdge=useCallback((id:string|null,edge:EdgeDef|null)=>{ setHoveredEdge(edge); if(edge) setHoveredNode(null); },[]);

  if(status==="loading"||loading) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin"/>
    </div>
  );
  if(!match) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <p className="text-stone-500 text-sm">Match not found. <Link href="/matches" className="underline">Back</Link></p>
    </div>
  );

  const selfChart=match.currentAstro??{sunSign:"Unknown",moonSign:"Unknown",risingSign:"Unknown"};
  const otherChart=match.otherAstro;
  const age=getAge(match.otherUser.birthDate);
  const hasAstro=match.currentAstro!==null;

  return (
    <div className="h-screen bg-[#f7f4ef] flex flex-col overflow-hidden" style={{fontFamily:"ui-sans-serif,system-ui,sans-serif"}}>

      {/* Header */}
      <header className="shrink-0 bg-[#f7f4ef]/95 backdrop-blur-sm border-b border-stone-200/70 z-10" style={{height:52}}>
        <div className="px-6 h-full flex items-center justify-between gap-4">
          <Link href="/matches" className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4"/>
            <span>Matches</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            {match.otherUser.avatarUrl?(
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.otherUser.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover"/>
            ):(
              <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-500">
                {match.otherUser.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
            )}
            <span className="font-serif font-medium">{match.otherUser.name.split(" ")[0]}, {age}</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-400">{match.otherUser.birthCity}</span>
          </div>
          <div className="w-24"/>
        </div>
      </header>

      {/* Two-column body */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Graph */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4 overflow-hidden min-w-0">
          {hasAstro?(
            <>
              <SynastryChart
                selfName="You" otherName={match.otherUser.name}
                self={selfChart} other={otherChart}
                hoveredNodeId={hoveredNode?.id??null}
                hoveredEdgeId={hoveredEdge?.id??null}
                onHoverNode={handleHoverNode}
                onHoverEdge={handleHoverEdge}
              />
              <div className="mt-3 pl-1"><AspectLegend/></div>
            </>
          ):(
            <div className="border border-dashed border-stone-300 rounded-xl py-16 text-center max-w-lg mx-auto">
              <p className="text-stone-500 text-sm mb-3">Add your birth chart to see the synastry web</p>
              <Link href="/onboarding" className="text-stone-700 text-sm font-medium underline">Set up your chart</Link>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <aside className="w-72 shrink-0 border-l border-stone-200 bg-white overflow-hidden flex flex-col">
          <DetailPanel hoveredNode={hoveredNode} hoveredEdge={hoveredEdge} match={match} self={selfChart} other={otherChart}/>
        </aside>

      </div>
    </div>
  );
}
