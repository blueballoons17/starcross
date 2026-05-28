"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { AnimatedHero } from "@/components/ui/animated-hero";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { Button } from "@/components/ui/button";

const HERO_WORDS = ["truly compatible", "written for you", "cosmically aligned", "deeply resonant", "meant to last"];

const HOW_IT_WORKS = [
  {
    id: 1,
    title: "Birth Chart",
    subtitle: "Step 1",
    content: "Enter your date, time, and place of birth. We calculate your Sun, Moon, and Rising signs to form your unique astrological fingerprint.",
    icon: "⊙",
    relatedIds: [2],
    energy: 100,
  },
  {
    id: 2,
    title: "Elements",
    subtitle: "Step 2",
    content: "We map your elemental makeup — fire, earth, air, water — and modal tendencies across cardinal, fixed, and mutable energies.",
    icon: "◈",
    relatedIds: [1, 3],
    energy: 90,
  },
  {
    id: 3,
    title: "Personality",
    subtitle: "Step 3",
    content: "Your chart generates a structured personality profile: emotional style, communication tendencies, relationship needs, and conflict patterns.",
    icon: "❋",
    relatedIds: [2, 4],
    energy: 85,
  },
  {
    id: 4,
    title: "Matching",
    subtitle: "Step 4",
    content: "Our engine scores compatibility across elemental harmony, sign synastry, emotional alignment, and communication style. 0–100.",
    icon: "◎",
    relatedIds: [3, 5],
    energy: 80,
  },
  {
    id: 5,
    title: "Connection",
    subtitle: "Step 5",
    content: "See why each match works, what to navigate, and shared traits — so you start every conversation with context, not guesswork.",
    icon: "✦",
    relatedIds: [4],
    energy: 75,
  },
];

const FEATURES = [
  {
    symbol: "⊙",
    title: "Three-Sign Matching",
    description: "Your Sun sign is just the beginning. We use your Sun, Moon, and Rising together — the way astrology was always meant to be read.",
  },
  {
    symbol: "◈",
    title: "Elemental Harmony",
    description: "Fire and air feed each other. Earth and water ground each other. We weight elemental affinity as the backbone of every compatibility score.",
  },
  {
    symbol: "✦",
    title: "Human Explanations",
    description: "Every match comes with a plain-language breakdown of what works, what to navigate, and which traits you share. No cryptic jargon.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-light">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-stone-700 fill-stone-700/30" />
            <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight">StarCross</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-stone-900 text-white hover:bg-stone-800">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-stone-200/60" />
          <div className="absolute w-[400px] h-[400px] rounded-full border border-stone-200/40" />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-stone-200/20" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-3xl"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white/60 text-stone-500 text-xs tracking-widest uppercase mb-10">
            <Star className="h-3 w-3 fill-stone-400" />
            Astrology-based compatibility
          </div>

          {/* Main headline */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-semibold text-stone-900 leading-[1.08] tracking-tight mb-8">
            <AnimatedHero words={HERO_WORDS} prefix="" suffix="" />
          </h1>

          <p className="text-lg text-stone-500 max-w-lg mx-auto leading-relaxed mb-12">
            StarCross maps your birth chart into a compatibility fingerprint — then finds the people who match it most deeply.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="bg-stone-900 text-white hover:bg-stone-800 px-10 rounded-full h-12">
              <Link href="/signup">Begin your journey <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-stone-300 text-stone-700 hover:bg-stone-50 rounded-full h-12 px-8">
              <Link href="/login">Already a member</Link>
            </Button>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400 text-xs"
        >
          <span className="tracking-widest uppercase">Discover how</span>
          <div className="w-px h-8 bg-gradient-to-b from-stone-300 to-transparent" />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-4"
          >
            <span className="text-xs tracking-widest uppercase text-stone-400">The system</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 text-center tracking-tight mb-4"
          >
            How StarCross works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-stone-500 text-center max-w-md mx-auto mb-2 text-base"
          >
            Click any node to explore each step. Watch the orbit to see how the pieces connect.
          </motion.p>
          <RadialOrbitalTimeline timelineData={HOW_IT_WORKS} />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#FAF8F4]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs tracking-widest uppercase text-stone-400 block mb-3">The difference</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight">
              Built for depth,<br />
              <span className="italic text-stone-500">not novelty</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl mb-6">
                  {f.symbol}
                </div>
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-stone-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border-2 border-white" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-white" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <p className="font-serif text-sm italic text-stone-400 mb-4">Your chart is waiting</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
            The stars have always<br />known your story.
          </h2>
          <p className="text-stone-400 mb-10 text-base leading-relaxed">
            Create your birth profile in two minutes. Discover who you&apos;re cosmically aligned with.
          </p>
          <Button size="lg" asChild className="bg-white text-stone-900 hover:bg-stone-100 rounded-full px-12 h-12">
            <Link href="/signup">Begin your journey <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-stone-950 text-stone-500 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Star className="h-3 w-3 fill-stone-500" />
          <span className="font-serif text-stone-300">StarCross</span>
        </div>
        <p>&copy; {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>
    </div>
  );
}
