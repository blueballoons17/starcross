"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedHeroProps {
  words: string[];
  prefix?: string;
  suffix?: string;
}

export function AnimatedHero({ words, prefix = "Find someone", suffix = "" }: AnimatedHeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2400);
    return () => clearTimeout(t);
  }, [index, words.length]);

  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap justify-center">
      {prefix && <span>{prefix}</span>}
      <span className="relative inline-block overflow-hidden h-[1.15em] min-w-[200px] text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            className="absolute left-0 right-0 text-center font-serif italic text-stone-600"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
