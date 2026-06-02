"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sparkles, AlertTriangle, Lock, Flag } from "lucide-react";
import Link from "next/link";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { AstroGraph } from "@/components/AstroGraph";
import { UpgradeModal } from "@/components/UpgradeModal";
import { cn } from "@/lib/utils";

export interface ProfileDrawerMatch {
  id: string;
  matchScore: number;
  breakdown: {
    elemental: number;
    emotional: number;
    communication: number;
    stability: number;
  };
  explanation: string;
  strengths: string[];
  frictionPoints: string[];
  otherUser: {
    id: string;
    name: string;
    birthDate: string;
    birthCity: string;
    birthCountry: string;
    avatarUrl?: string | null;
    photos?: string[] | null;
  };
  otherAstro: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
  };
  currentAstro?: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
  };
}

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  match: ProfileDrawerMatch | null;
  isPremium?: boolean | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function ScoreArc({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const arcColor =
    score >= 80 ? "#fbbf24" : score >= 65 ? "#a78bfa" : "#6b7280";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="5"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
        <span className="text-2xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] text-stone-400 tracking-wide">% match</span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  arcColor,
}: {
  label: string;
  value: number;
  arcColor: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-stone-500">{label}</span>
        <span className="text-stone-300 font-medium">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: arcColor }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ── Review helpers ──────────────────────────────────────────────────────────

interface ReviewData {
  averageRating: number | null;
  count: number;
  comments: string[];
  myReview: { rating: number; comment: string | null } | null;
}

function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-px" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={s <= Math.round(value) ? "#fbbf24" : "none"}
          stroke={s <= Math.round(value) ? "#fbbf24" : "#57534e"}
          strokeWidth="1.5"
        >
          <path d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78z" />
        </svg>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["Terrible", "Poor", "Okay", "Good", "Great"];
  const active = hovered || value;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-125 focus:outline-none"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 20 20"
              fill={active >= s ? "#fbbf24" : "none"}
              stroke={active >= s ? "#fbbf24" : "#44403c"}
              strokeWidth="1.5"
              className="transition-colors duration-100"
            >
              <path d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78z" />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="text-[11px] text-stone-400">{labels[active - 1]}</span>
      )}
    </div>
  );
}

const REPORT_REASONS = [
  { value: "spam",                  label: "Spam or scam" },
  { value: "harassment",            label: "Harassment or mean behavior" },
  { value: "fake_profile",          label: "Fake or impersonation account" },
  { value: "inappropriate_content", label: "Inappropriate photos or content" },
  { value: "underage",              label: "Appears to be underage" },
  { value: "other",                 label: "Other" },
] as const;

type ReportReason = typeof REPORT_REASONS[number]["value"];

export function ProfileDrawer({ open, onClose, match, isPremium }: ProfileDrawerProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Review state
  const [reviews, setReviews]             = useState<ReviewData | null>(null);
  const [reviewRating, setReviewRating]   = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewStatus, setReviewStatus]   = useState<"idle" | "submitting" | "done" | "error">("idle");

  const fetchReviews = useCallback((userId: string) => {
    fetch(`/api/review/${userId}`)
      .then((r) => r.json())
      .then((d: ReviewData) => {
        setReviews(d);
        if (d.myReview) {
          setReviewRating(d.myReview.rating);
          setReviewComment(d.myReview.comment ?? "");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open && match?.otherUser.id) fetchReviews(match.otherUser.id);
  }, [open, match?.otherUser.id, fetchReviews]);

  // Report state
  const [reportOpen, setReportOpen]     = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | "">("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  useEffect(() => { setPhotoIdx(0); }, [match?.id]);

  // Reset forms when drawer closes or switches to a new profile
  useEffect(() => {
    if (!open) {
      setReportOpen(false); setReportReason(""); setReportDetails(""); setReportStatus("idle");
      setReviews(null); setReviewRating(0); setReviewComment(""); setReviewFormOpen(false); setReviewStatus("idle");
    }
  }, [open, match?.id]);
  if (!match) return null;

  async function submitReview() {
    if (!reviewRating || !match) return;
    setReviewStatus("submitting");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewedUserId: match.otherUser.id,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setReviewStatus("done");
      setReviewFormOpen(false);
      // Refresh reviews to show updated data
      fetchReviews(match.otherUser.id);
    } catch {
      setReviewStatus("error");
    }
  }

  async function submitReport() {
    if (!reportReason || !match) return;
    setReportStatus("submitting");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId: match.otherUser.id,
          reason: reportReason,
          details: reportDetails.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setReportStatus("done");
    } catch {
      setReportStatus("error");
    }
  }

  const allPhotos = [
    match.otherUser.avatarUrl,
    ...(match.otherUser.photos ?? []),
  ].filter((url): url is string => Boolean(url));

  const sunColor = getZodiacColor(match.otherAstro.sunSign);
  const moonColor = getZodiacColor(match.otherAstro.moonSign);
  const risingColor = getZodiacColor(match.otherAstro.risingSign);
  const age = getAge(match.otherUser.birthDate);
  const arcColor =
    match.matchScore >= 80
      ? "#fbbf24"
      : match.matchScore >= 65
      ? "#a78bfa"
      : "#6b7280";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-stone-950/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-sm flex flex-col bg-stone-950 border-l border-white/8 shadow-2xl overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Photo carousel */}
              <div className="relative shrink-0 overflow-hidden" style={{ height: 300 }}>
                {allPhotos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allPhotos[photoIdx]}
                    alt={match.otherUser.name}
                    className="w-full h-full object-cover object-top select-none"
                    draggable={false}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full flex items-center justify-center text-6xl font-bold",
                      sunColor.bg,
                      sunColor.text
                    )}
                  >
                    {getInitials(match.otherUser.name)}
                  </div>
                )}

                {/* Top fade for indicators/close button legibility */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-stone-950/60 to-transparent pointer-events-none" />
                {/* Bottom fade for name legibility */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stone-950 via-stone-950/55 to-transparent pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Story-style photo progress bars */}
                {allPhotos.length > 1 && (
                  <div className="absolute top-3 left-4 right-14 flex gap-1.5 pointer-events-none">
                    {allPhotos.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-[2px] rounded-full transition-colors duration-200",
                          i === photoIdx ? "bg-white" : "bg-white/30"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Tap zones: left third = previous, right two-thirds = next */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx((p) => Math.max(0, p - 1))}
                      className="absolute left-0 top-0 bottom-0 w-1/3"
                      aria-label="Previous photo"
                    />
                    <button
                      onClick={() => setPhotoIdx((p) => Math.min(allPhotos.length - 1, p + 1))}
                      className="absolute right-0 top-0 bottom-0 w-2/3"
                      aria-label="Next photo"
                    />
                  </>
                )}

                {/* Name / location overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pointer-events-none">
                  <h2 className="font-serif text-2xl font-semibold text-white leading-tight">
                    {match.otherUser.name}, {age}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-white/60 text-sm">
                      {match.otherUser.birthCity}, {match.otherUser.birthCountry}
                    </p>
                    {reviews && reviews.averageRating !== null && (
                      <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <StarDisplay value={reviews.averageRating} size={11} />
                        <span className="text-white/80 text-[11px] font-medium">{reviews.averageRating}</span>
                        <span className="text-white/40 text-[10px]">({reviews.count})</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Signs trinity */}
              <div className="px-6 pb-5">
                <div className="flex flex-wrap justify-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border",
                      sunColor.bg,
                      sunColor.text,
                      sunColor.border
                    )}
                  >
                    <ZodiacIcon
                      sign={match.otherAstro.sunSign}
                      size={13}
                      className="bg-transparent border-0"
                    />
                    <span className="opacity-55 text-[9px] uppercase tracking-wider">☉</span>
                    {match.otherAstro.sunSign}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border",
                      moonColor.bg,
                      moonColor.text,
                      moonColor.border
                    )}
                  >
                    <ZodiacIcon
                      sign={match.otherAstro.moonSign}
                      size={13}
                      className="bg-transparent border-0"
                    />
                    <span className="opacity-55 text-[9px] uppercase tracking-wider">☽</span>
                    {match.otherAstro.moonSign}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border",
                      risingColor.bg,
                      risingColor.text,
                      risingColor.border
                    )}
                  >
                    <ZodiacIcon
                      sign={match.otherAstro.risingSign}
                      size={13}
                      className="bg-transparent border-0"
                    />
                    <span className="opacity-55 text-[9px] uppercase tracking-wider">↑</span>
                    {match.otherAstro.risingSign}
                  </span>
                </div>
              </div>

              {/* Synastry graph: StarCross+ only */}
              {isPremium !== false && match.currentAstro && (
                <div className="mx-6 mb-2 rounded-2xl bg-[#f7f4ef] px-4 py-4">
                  <AstroGraph
                    selfName="You"
                    otherName={match.otherUser.name}
                    self={match.currentAstro}
                    other={match.otherAstro}
                  />
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-white/6 mx-6 mb-5 mt-4" />

              {/* Compatibility */}
              <div className="px-6 pb-5 flex items-start gap-4">
                <ScoreArc score={match.matchScore} />
                {isPremium !== false ? (
                  <div className="flex-1 space-y-2.5 pt-1">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3">
                      Compatibility
                    </p>
                    <BreakdownBar
                      label="Elemental"
                      value={match.breakdown.elemental}
                      arcColor={arcColor}
                    />
                    <BreakdownBar
                      label="Emotional"
                      value={match.breakdown.emotional}
                      arcColor={arcColor}
                    />
                    <BreakdownBar
                      label="Communication"
                      value={match.breakdown.communication}
                      arcColor={arcColor}
                    />
                    <BreakdownBar
                      label="Stability"
                      value={match.breakdown.stability}
                      arcColor={arcColor}
                    />
                  </div>
                ) : (
                  <div className="flex-1 pt-1">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3">
                      Compatibility
                    </p>
                    <button
                      onClick={() => setUpgradeOpen(true)}
                      className="w-full rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-4 py-4 text-left hover:bg-indigo-500/12 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span className="text-indigo-300 text-xs font-medium tracking-wide">
                          StarCross+
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs leading-relaxed">
                        Unlock the full elemental breakdown, synastry chart, and what makes this connection tick.
                      </p>
                      <span className="mt-3 inline-block text-[10px] text-indigo-400 font-medium tracking-wide">
                        Upgrade to see →
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Explanation, always visible */}
              {match.explanation && (
                <div className="px-6 pb-5">
                  <div className="h-px bg-white/6 mb-5" />
                  <p
                    className="text-stone-400 text-sm leading-relaxed pl-3"
                    style={{ borderLeft: `2px solid ${arcColor}55` }}
                  >
                    {match.explanation}
                  </p>
                </div>
              )}

              {/* ── Community reviews ─────────────────────────────────── */}
              <div className="px-6 pb-5">
                <div className="h-px bg-white/6 mb-5" />

                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    Community Reviews
                  </h4>
                  {reviews && reviews.count > 0 && (
                    <div className="flex items-center gap-1.5">
                      <StarDisplay value={reviews.averageRating ?? 0} size={12} />
                      <span className="text-stone-300 text-xs font-medium">{reviews.averageRating}</span>
                      <span className="text-stone-600 text-xs">/ {reviews.count} review{reviews.count !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>

                {/* Anonymous comments from other users */}
                {reviews && reviews.comments.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {reviews.comments.map((c, i) => (
                      <div key={i} className="bg-white/4 rounded-xl px-3 py-2.5 border border-white/6">
                        <p className="text-stone-300 text-xs leading-relaxed">&ldquo;{c}&rdquo;</p>
                        <p className="text-stone-600 text-[10px] mt-1.5">— StarCross user</p>
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.count === 0 ? (
                  <p className="text-stone-600 text-xs mb-4">
                    No reviews yet. Be the first!
                  </p>
                ) : null}

                {/* Leave / edit a review */}
                {!reviewFormOpen && !reviewStatus.startsWith("done") ? (
                  <button
                    onClick={() => setReviewFormOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-400 transition-colors"
                  >
                    <span className="text-amber-500">★</span>
                    {reviews?.myReview ? "Edit your review" : `Rate ${match.otherUser.name}`}
                  </button>
                ) : reviewStatus === "done" ? (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/15 px-4 py-2.5 text-center">
                    <p className="text-amber-300 text-xs font-medium">Review saved ✦</p>
                  </div>
                ) : reviewFormOpen ? (
                  /* Review form */
                  <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
                    {/* Form header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                      <span className="text-sm font-medium text-stone-200">
                        {reviews?.myReview ? "Update your review" : `Rate ${match.otherUser.name}`}
                      </span>
                      <button
                        onClick={() => { setReviewFormOpen(false); setReviewStatus("idle"); }}
                        className="text-stone-500 hover:text-stone-300 transition-colors"
                        aria-label="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="px-4 pt-4 pb-2">
                      {/* Context note */}
                      <p className="text-[10px] text-stone-500 text-center mb-3 leading-relaxed">
                        How was chatting with {match.otherUser.name}?<br />
                        Reviews are shown anonymously to help everyone feel safe.
                      </p>

                      {/* Star picker */}
                      <div className="flex justify-center mb-3">
                        <StarPicker value={reviewRating} onChange={setReviewRating} />
                      </div>

                      {/* Comment */}
                      <textarea
                        rows={2}
                        maxLength={300}
                        placeholder={`Optional — e.g. "Very kind and easy to talk to" (public, anonymous)`}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full rounded-lg bg-white/5 border border-white/8 text-stone-300 placeholder-stone-600 text-xs px-3 py-2 resize-none focus:outline-none focus:border-white/20 transition-colors"
                      />
                      <p className="text-[10px] text-stone-600 mt-1 text-right">
                        {reviewComment.length}/300
                      </p>
                    </div>

                    <div className="px-4 pb-4">
                      {reviewStatus === "error" && (
                        <p className="text-red-400 text-xs mb-2">Something went wrong — please try again.</p>
                      )}
                      <button
                        onClick={submitReview}
                        disabled={!reviewRating || reviewStatus === "submitting"}
                        className={cn(
                          "w-full py-2.5 rounded-lg text-xs font-semibold transition-colors",
                          reviewRating && reviewStatus !== "submitting"
                            ? "bg-amber-500 hover:bg-amber-400 text-stone-950"
                            : "bg-white/5 text-stone-600 cursor-not-allowed"
                        )}
                      >
                        {reviewStatus === "submitting" ? "Saving…" : reviews?.myReview ? "Update review" : "Submit review"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Strengths: StarCross+ only */}
              {isPremium !== false && match.strengths.length > 0 && (
                <div className="px-6 pb-4">
                  <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    Why This Works
                  </h4>
                  <div className="space-y-2">
                    {match.strengths.map((s, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 bg-emerald-500/8 rounded-xl px-3 py-2.5 border border-emerald-500/15"
                      >
                        <span className="text-emerald-400 shrink-0 text-xs mt-0.5">✦</span>
                        <p className="text-stone-300 text-xs leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friction: StarCross+ only */}
              {isPremium !== false && match.frictionPoints.length > 0 && (
                <div className="px-6 pb-5">
                  <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    Navigate With Awareness
                  </h4>
                  <div className="space-y-2">
                    {match.frictionPoints.map((f, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 bg-amber-500/8 rounded-xl px-3 py-2.5 border border-amber-500/15"
                      >
                        <span className="text-amber-400 shrink-0 text-xs mt-0.5">△</span>
                        <p className="text-stone-400 text-xs leading-relaxed">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Report section ─────────────────────────────────────────── */}
              <div className="px-6 pb-8">
                <div className="h-px bg-white/6 mb-5" />

                {!reportOpen ? (
                  /* Collapsed: just a small link */
                  <button
                    onClick={() => setReportOpen(true)}
                    className="flex items-center gap-1.5 text-stone-600 hover:text-red-400 text-xs transition-colors"
                  >
                    <Flag className="h-3 w-3" />
                    Report {match.otherUser.name}
                  </button>
                ) : reportStatus === "done" ? (
                  /* Success state */
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-center">
                    <p className="text-emerald-400 text-sm font-medium">Report submitted</p>
                    <p className="text-stone-500 text-xs mt-1">
                      Thanks for letting us know. We review every report and will take action if needed.
                    </p>
                  </div>
                ) : (
                  /* Expanded form */
                  <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                      <div className="flex items-center gap-2">
                        <Flag className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-sm font-medium text-stone-200">
                          Report {match.otherUser.name}
                        </span>
                      </div>
                      <button
                        onClick={() => setReportOpen(false)}
                        className="text-stone-500 hover:text-stone-300 transition-colors"
                        aria-label="Cancel report"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Reason picker */}
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
                        Why are you reporting this account?
                      </p>
                      <div className="space-y-1">
                        {REPORT_REASONS.map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setReportReason(value)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                              reportReason === value
                                ? "bg-red-500/15 text-red-300 border border-red-500/25"
                                : "text-stone-400 hover:bg-white/5 hover:text-stone-200 border border-transparent"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional details */}
                    <div className="px-4 pb-3">
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder="Add details (optional)"
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        className="w-full mt-1.5 rounded-lg bg-white/5 border border-white/8 text-stone-300 placeholder-stone-600 text-xs px-3 py-2 resize-none focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    {/* Submit */}
                    <div className="px-4 pb-4">
                      {reportStatus === "error" && (
                        <p className="text-red-400 text-xs mb-2">
                          Something went wrong — please try again.
                        </p>
                      )}
                      <button
                        onClick={submitReport}
                        disabled={!reportReason || reportStatus === "submitting"}
                        className={cn(
                          "w-full py-2.5 rounded-lg text-xs font-semibold transition-colors",
                          reportReason && reportStatus !== "submitting"
                            ? "bg-red-600 hover:bg-red-500 text-white"
                            : "bg-white/5 text-stone-600 cursor-not-allowed"
                        )}
                      >
                        {reportStatus === "submitting" ? "Submitting…" : "Submit report"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky CTA */}
            <div className="shrink-0 px-6 py-4 bg-stone-950/90 backdrop-blur-sm border-t border-white/8">
              {isPremium !== false ? (
                <Link
                  href={`/messages/${match.id}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-full py-3.5 transition-colors text-sm shadow-lg shadow-indigo-500/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send a Message
                </Link>
              ) : (
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-full py-3.5 transition-colors text-sm shadow-lg shadow-indigo-500/20"
                >
                  <Lock className="h-4 w-4" />
                  Unlock messaging: StarCross+
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="synastry"
      />
    </AnimatePresence>
  );
}
