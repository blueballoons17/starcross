"use client";
import { useState, useEffect, useRef } from "react";
import { Zap, Link } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.25) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  function calculatePosition(index: number, total: number) {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 170;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
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

  function handleContainerClick(e: React.MouseEvent) {
    if (e.target === containerRef.current) {
      setExpandedId(null);
      setAutoRotate(true);
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full h-[520px] flex items-center justify-center overflow-hidden"
    >
      {/* Orbit ring */}
      <div className="absolute w-[380px] h-[380px] rounded-full border border-stone-200" />
      <div className="absolute w-[320px] h-[320px] rounded-full border border-stone-100" />

      {/* Center orb */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-stone-800 to-stone-600 flex items-center justify-center shadow-lg">
        <div className="absolute w-20 h-20 rounded-full border border-stone-300/50 animate-ping opacity-30" />
        <span className="text-2xl">✦</span>
      </div>

      {/* Nodes */}
      {timelineData.map((item, index) => {
        const pos = calculatePosition(index, timelineData.length);
        const isExpanded = expandedId === item.id;

        return (
          <div
            key={item.id}
            className="absolute transition-all duration-700 cursor-pointer"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              zIndex: isExpanded ? 200 : pos.zIndex,
              opacity: isExpanded ? 1 : pos.opacity,
            }}
            onClick={(e) => { e.stopPropagation(); handleNodeClick(item.id); }}
          >
            {/* Node circle */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-xl
              border-2 transition-all duration-300 shadow-sm
              ${isExpanded
                ? "bg-stone-900 border-stone-900 scale-125 shadow-lg"
                : "bg-white border-stone-200 hover:border-stone-400 hover:shadow-md"
              }
            `}>
              <span>{item.icon}</span>
            </div>

            {/* Label */}
            <div className={`
              absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap
              text-xs font-medium tracking-wide transition-all duration-300
              ${isExpanded ? "text-stone-900 scale-110" : "text-stone-500"}
            `}>
              {item.title}
            </div>

            {/* Expanded card */}
            {isExpanded && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-60 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-px h-2 bg-stone-200" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{item.subtitle}</span>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-stone-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.content}</p>

                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1 text-stone-400">
                        <Zap size={9} /> Relevance
                      </span>
                      <span className="font-mono text-stone-600">{item.energy}%</span>
                    </div>
                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-stone-600 to-stone-400 rounded-full"
                        style={{ width: `${item.energy}%` }}
                      />
                    </div>
                  </div>

                  {item.relatedIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-1 mb-2">
                        <Link size={9} className="text-stone-400" />
                        <span className="text-[10px] uppercase tracking-wider text-stone-400">Connects to</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.relatedIds.map((rid) => {
                          const related = timelineData.find((t) => t.id === rid);
                          return related ? (
                            <button
                              key={rid}
                              onClick={(e) => { e.stopPropagation(); handleNodeClick(rid); }}
                              className="text-[10px] px-2 py-0.5 rounded-full border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors"
                            >
                              {related.title}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
