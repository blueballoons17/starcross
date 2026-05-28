"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedHeroProps {
  words: string[];
  /** Optional static text before the animated word */
  prefix?: string;
  /** Optional static text after the animated word */
  suffix?: string;
}

/**
 * Cycles through `words`, animating each in/out.
 * The word slot is FULL WIDTH so long phrases ("cosmically aligned") never wrap.
 * The container height is set via the parent — pass a className/style with an
 * explicit height so the parent layout is never affected by font metrics.
 */
export function AnimatedHero({
  words,
  prefix = "",
  suffix = "",
}: AnimatedHeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2600);
    return () => clearTimeout(t);
  }, [index, words.length]);

  return (
    <span className="inline-flex items-baseline flex-wrap justify-center gap-2 w-full">
      {prefix && <span>{prefix}</span>}

      {/*
        Full-width slot — no fixed height here, height is controlled by the
        wrapper in the parent so we never mis-size it with em units.
        `position: relative` allows the absolute child to size against it.
      */}
      <span className="relative flex-1 min-w-0 w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            className="font-serif italic"
            style={{ display: "block", textAlign: "center", width: "100%" }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
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
