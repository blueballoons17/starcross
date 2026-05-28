"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, X } from "lucide-react";

interface TimelineItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  icon: string;
  relatedIds: number[];
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.22) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  function calculatePosition(index: number, total: number) {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 162;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, zIndex, opacity };
  }

  function handleNodeClick(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      setAutoRotate(true);
    } else {
      setExpandedId(id);
      setAutoRotate(false);
    }
  }

  function handleClose() {
    setExpandedId(null);
    setAutoRotate(true);
  }

  const expandedItem = timelineData.find((t) => t.id === expandedId) ?? null;

  return (
    <div className="w-full flex flex-col items-center">

      {/* ── Orbital ring ─────────────────────────────────────────────────── */}
      <div className="relative w-full flex items-center justify-center" style={{ height: 420 }}>
        {/* Guide rings */}
        <div className="absolute w-[360px] h-[360px] rounded-full border border-stone-200" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-stone-100" />

        {/* Center orb */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-stone-800 to-stone-600 flex items-center justify-center shadow-lg">
          <div className="absolute w-20 h-20 rounded-full border border-stone-300/50 animate-ping opacity-25" />
          <span className="text-2xl text-white select-none">✦</span>
        </div>

        {/* Nodes — no expanded cards here */}
        {timelineData.map((item, index) => {
          const pos = calculatePosition(index, timelineData.length);
          const isActive = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="absolute transition-all duration-700 cursor-pointer"
              style={{
                transform: `translate(${pos.x.toFixed(3)}px, ${pos.y.toFixed(3)}px)`,
                zIndex: isActive ? 50 : pos.zIndex,
                opacity: isActive ? 1 : parseFloat(pos.opacity.toFixed(6)),
              }}
              suppressHydrationWarning
              onClick={() => handleNodeClick(item.id)}
            >
              {/* Node circle */}
              <div
                className={[
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl",
                  "border-2 transition-all duration-300 shadow-sm select-none",
                  isActive
                    ? "bg-stone-900 border-stone-900 scale-125 shadow-lg text-white"
                    : "bg-white border-stone-200 hover:border-stone-400 hover:shadow-md",
                ].join(" ")}
              >
                <span>{item.icon}</span>
              </div>

              {/* Label — always below the node, never clipped because container has no overflow-hidden */}
              <div
                className={[
                  "absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap",
                  "text-xs font-medium tracking-wide transition-all duration-300",
                  isActive ? "text-stone-900 scale-110" : "text-stone-500",
                ].join(" ")}
              >
                {item.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail card — rendered BELOW the orbit, never overlaps ───────── */}
      <div className="w-full max-w-sm px-4">
        <AnimatePresence mode="wait">
          {expandedItem && (
            <motion.div
              key={expandedItem.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 8,  scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden mb-8"
            >
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center text-base text-white shrink-0">
                      {expandedItem.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block">
                        {expandedItem.subtitle}
                      </span>
                      <h4 className="font-serif text-base font-semibold text-stone-900 leading-tight">
                        {expandedItem.title}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-2 shrink-0 w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                  >
                    <X size={12} className="text-stone-500" />
                  </button>
                </div>

                {/* Body */}
                <p className="text-sm text-stone-500 leading-relaxed">
                  {expandedItem.content}
                </p>


                {/* Related links */}
                {expandedItem.relatedIds.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-1 mb-2">
                      <Link size={9} className="text-stone-400" />
                      <span className="text-[10px] uppercase tracking-widest text-stone-400">Connects to</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {expandedItem.relatedIds.map((rid) => {
                        const related = timelineData.find((t) => t.id === rid);
                        return related ? (
                          <button
                            key={rid}
                            onClick={() => handleNodeClick(rid)}
                            className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 text-stone-500 hover:border-stone-700 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            {related.title}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Placeholder hint when nothing is selected */}
          {!expandedItem && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-xs text-stone-400 pb-8 tracking-wide"
            >
              Click any node to learn more
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
