"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getZodiacColor, ZODIAC_SYMBOLS } from "@/lib/zodiac-colors";
import { cn } from "@/lib/utils";
import { Star, Sparkles, AlertTriangle, MessageCircle } from "lucide-react";

interface BreakdownData {
  elemental: number;
  emotional: number;
  communication: number;
  stability: number;
}

interface CompatibilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: {
    otherUser: {
      name: string;
      birthCity: string;
      birthCountry: string;
      avatarUrl?: string | null;
    };
    otherAstro: {
      sunSign: string;
      moonSign: string;
      risingSign: string;
    };
    currentAstro: {
      sunSign: string;
      moonSign: string;
      risingSign: string;
    };
    matchScore: number;
    breakdown: BreakdownData;
    explanation: string;
    strengths: string[];
    frictionPoints: string[];
  };
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getScoreGradient(score: number) {
  if (score >= 70) return "from-amber-500 to-yellow-400";
  if (score >= 50) return "from-violet-600 to-indigo-500";
  return "from-slate-500 to-slate-400";
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400 font-medium">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function SignPair({
  label,
  signA,
  signB,
}: {
  label: string;
  signA: string;
  signB: string;
}) {
  const colA = getZodiacColor(signA);
  const colB = getZodiacColor(signB);
  return (
    <div className="text-center space-y-1">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 justify-center">
        <span className={cn("px-2 py-0.5 rounded-full text-xs border", colA.bg, colA.text, colA.border)}>
          {ZODIAC_SYMBOLS[signA]} {signA}
        </span>
        <span className="text-slate-600">×</span>
        <span className={cn("px-2 py-0.5 rounded-full text-xs border", colB.bg, colB.text, colB.border)}>
          {ZODIAC_SYMBOLS[signB]} {signB}
        </span>
      </div>
    </div>
  );
}

export function CompatibilityModal({ open, onOpenChange, match }: CompatibilityModalProps) {
  const scoreGrad = getScoreGradient(match.matchScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg text-slate-300 font-normal">
            Your Cosmic Connection
          </DialogTitle>
        </DialogHeader>

        {/* Match score ring */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-2xl bg-gradient-to-br",
              scoreGrad
            )}
          >
            {match.matchScore}
            <span className="text-sm font-normal ml-0.5">%</span>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">{match.otherUser.name}</p>
            <p className="text-slate-400 text-sm">
              {match.otherUser.birthCity}, {match.otherUser.birthCountry}
            </p>
          </div>
        </div>

        {/* Signs side by side */}
        <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 text-center">Placements</h4>
          <SignPair label="Sun" signA={match.currentAstro.sunSign} signB={match.otherAstro.sunSign} />
          <SignPair label="Moon" signA={match.currentAstro.moonSign} signB={match.otherAstro.moonSign} />
          <SignPair label="Rising" signA={match.currentAstro.risingSign} signB={match.otherAstro.risingSign} />
        </div>

        {/* Compatibility breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Star className="h-4 w-4 text-violet-400" />
            Compatibility Breakdown
          </h4>
          <BreakdownBar label="Elemental" value={match.breakdown.elemental} />
          <BreakdownBar label="Emotional" value={match.breakdown.emotional} />
          <BreakdownBar label="Communication" value={match.breakdown.communication} />
          <BreakdownBar label="Stability" value={match.breakdown.stability} />
        </div>

        {/* Explanation */}
        <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-violet-500/50 pl-3">
          {match.explanation}
        </p>

        {/* Strengths */}
        {match.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Why This Works
            </h4>
            <ul className="space-y-1.5">
              {match.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Friction points */}
        {match.frictionPoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Navigate With Awareness
            </h4>
            <ul className="space-y-1.5">
              {match.frictionPoints.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-400">
                  <span className="text-amber-400 mt-0.5 shrink-0">△</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <Button className="w-full gap-2" disabled>
          <MessageCircle className="h-4 w-4" />
          Start a Conversation
          <span className="text-xs opacity-60">(coming soon)</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
