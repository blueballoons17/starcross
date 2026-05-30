"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronRight, ChevronLeft, Check, Sun, Moon, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateAstrologyProfile,
  MOON_DESCRIPTIONS,
  RISING_DESCRIPTIONS,
  SUN_SUMMARIES,
  COMPATIBILITY,
  ELEMENT_DESCRIPTIONS,
  MODAL_DESCRIPTIONS,
  SIGN_ELEMENTS,
  SIGN_MODALS,
} from "@/lib/astrology";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Other", "Prefer not to say"];
const PREF_GENDER_OPTIONS = ["Women", "Men", "Non-binary people", "Everyone"];

interface FormData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  gender: string;
  prefGenders: string[];
  prefAgeMin: number;
  prefAgeMax: number;
}

const INITIAL_FORM: FormData = {
  name: "",
  birthDate: "",
  birthTime: "",
  birthCity: "",
  birthCountry: "",
  gender: "",
  prefGenders: [],
  prefAgeMin: 22,
  prefAgeMax: 40,
};

const STEPS = ["About You", "Preferences", "Your Chart"];

// ─── Step indicator ────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              i < current
                ? "bg-stone-900 text-white"
                : i === current
                ? "bg-stone-200 border-2 border-stone-700 text-stone-700"
                : "bg-stone-100 border border-stone-200 text-stone-400"
            )}
          >
            {i < current ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={cn("h-px w-8 transition-all", i < current ? "bg-stone-700" : "bg-stone-200")} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Sign badge ────────────────────────────────────────────────────────────

function SignBadge({ sign, size = "md" }: { sign: string; size?: "sm" | "md" | "lg" }) {
  const c = getZodiacColor(sign);
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        c.bg, c.text, c.border,
        size === "sm"  && "px-2.5 py-1 text-xs",
        size === "md"  && "px-3 py-1.5 text-sm",
        size === "lg"  && "px-4 py-2 text-base",
      )}
    >
      <ZodiacIcon sign={sign} size={size === "lg" ? 22 : size === "sm" ? 17 : 19} />
      {sign}
    </div>
  );
}

// ─── Chart carousel ────────────────────────────────────────────────────────

const SLIDE_COUNT = 6;

type AstroPreview = ReturnType<typeof calculateAstrologyProfile>;

function ChartCarousel({
  form,
  astro,
  submitError,
  submitting,
  onSubmit,
}: {
  form: FormData;
  astro: AstroPreview;
  submitError: string;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > slide ? 1 : -1);
    setSlide(idx);
  }, [slide]);

  const prev = () => slide > 0 && goTo(slide - 1);
  const next = () => slide < SLIDE_COUNT - 1 && goTo(slide + 1);

  const dominantEl = (Object.entries(astro.elements) as [string, number][])
    .reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const dominantModal = (Object.entries(astro.modals) as [string, number][])
    .reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  const compat = COMPATIBILITY[astro.signs.sun];

  const slides = [
    // 0 ── Big Three
    <div key="big3" className="space-y-5">
      <div className="text-center space-y-1">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Big Three</p>
        <h2 className="font-serif text-stone-900 font-semibold text-lg">{form.name}&apos;s Chart</h2>
        <p className="text-stone-400 text-sm">{form.birthCity}, {form.birthCountry}</p>
      </div>

      {(
        [
          { label: "Sun", Icon: Sun, sign: astro.signs.sun,    tagline: "Your core identity" },
          { label: "Moon", Icon: Moon, sign: astro.signs.moon,  tagline: "Your inner world" },
          { label: "Rising", Icon: ArrowUp, sign: astro.signs.rising, tagline: "Your first impression" },
        ] as const
      ).map(({ label, Icon, sign, tagline }) => (
        <div key={label} className="flex items-center gap-4 bg-stone-50 rounded-xl p-4 border border-stone-100">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center">
            <Icon className="h-4 w-4 text-stone-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-400 mb-1">{label} · {tagline}</p>
            <SignBadge sign={sign} size="sm" />
          </div>
          <p className="text-xs text-stone-500 text-right max-w-[140px] leading-relaxed hidden sm:block">
            {SUN_SUMMARIES[sign]?.split(".")[0]}.
          </p>
        </div>
      ))}

      <p className="text-xs text-stone-400 text-center">
        Swipe through the slides to explore your full chart →
      </p>
    </div>,

    // 1 ── Sun sign deep dive
    <div key="sun" className="space-y-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border border-amber-100 mb-1">
          <Sun className="h-5 w-5 text-amber-600" />
        </div>
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Sun Sign</p>
        <SignBadge sign={astro.signs.sun} size="lg" />
        <p className="text-stone-500 text-sm">{SUN_SUMMARIES[astro.signs.sun]}</p>
      </div>

      <div className="space-y-3">
        {(
          [
            { label: "Emotional style", text: astro.traits.emotionalStyle },
            { label: "How you communicate", text: astro.traits.communicationStyle },
            { label: "What you need in love", text: astro.traits.relationshipNeeds },
            { label: "How you handle conflict", text: astro.traits.conflictStyle },
          ] as const
        ).map(({ label, text }) => (
          <details key={label} className="group rounded-xl border border-stone-100 bg-stone-50 overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none select-none text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors">
              {label}
              <ChevronRight className="h-3.5 w-3.5 text-stone-400 transition-transform group-open:rotate-90" />
            </summary>
            <p className="px-4 pb-4 pt-1 text-sm text-stone-600 leading-relaxed">{text}</p>
          </details>
        ))}
      </div>
    </div>,

    // 2 ── Moon sign
    <div key="moon" className="space-y-5">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 mb-1">
          <Moon className="h-5 w-5 text-indigo-500" />
        </div>
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Moon Sign</p>
        <SignBadge sign={astro.signs.moon} size="lg" />
        <p className="text-xs text-stone-400">Your inner emotional world</p>
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 space-y-3">
        <p className="text-sm text-stone-700 leading-relaxed font-medium">
          Moon in {astro.signs.moon}
        </p>
        <p className="text-sm text-stone-600 leading-relaxed">
          {MOON_DESCRIPTIONS[astro.signs.moon]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Element</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_ELEMENTS[astro.signs.moon]}</p>
        </div>
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Modality</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_MODALS[astro.signs.moon]}</p>
        </div>
      </div>

      <p className="text-xs text-stone-400 text-center leading-relaxed">
        The Moon governs your emotional instincts, inner needs, and the self you reveal only to those closest to you.
      </p>
    </div>,

    // 3 ── Rising sign
    <div key="rising" className="space-y-5">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 mb-1">
          <ArrowUp className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Rising Sign</p>
        <SignBadge sign={astro.signs.rising} size="lg" />
        <p className="text-xs text-stone-400">Your first impression on the world</p>
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 space-y-3">
        <p className="text-sm text-stone-700 leading-relaxed font-medium">
          {astro.signs.rising} Rising
        </p>
        <p className="text-sm text-stone-600 leading-relaxed">
          {RISING_DESCRIPTIONS[astro.signs.rising]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Element</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_ELEMENTS[astro.signs.rising]}</p>
        </div>
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Modality</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_MODALS[astro.signs.rising]}</p>
        </div>
      </div>

      {!form.birthTime && (
        <p className="text-xs text-stone-400 text-center leading-relaxed bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          Rising sign is approximate — add your birth time for a more accurate reading.
        </p>
      )}
    </div>,

    // 4 ── Elements & modality
    <div key="elements" className="space-y-5">
      <div className="text-center space-y-1">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Elements</p>
        <p className="text-stone-500 text-sm">How fire, earth, air & water shape you</p>
      </div>

      <div className="space-y-3">
        {(["fire", "earth", "air", "water"] as const).map((el) => {
          const pct = astro.elements[el];
          const colors: Record<string, string> = {
            fire: "from-orange-400 to-red-400",
            earth: "from-green-600 to-emerald-500",
            air: "from-sky-400 to-blue-400",
            water: "from-indigo-400 to-blue-500",
          };
          return (
            <div key={el}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-stone-500 capitalize font-medium">{el}</span>
                <span className="text-xs text-stone-400">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full bg-gradient-to-r", colors[el])}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <p className="text-xs text-stone-400 mb-1.5 font-medium uppercase tracking-wider">
          Dominant: {dominantEl.charAt(0).toUpperCase() + dominantEl.slice(1)}
        </p>
        <p className="text-sm text-stone-600 leading-relaxed">
          {ELEMENT_DESCRIPTIONS[dominantEl]}
        </p>
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <p className="text-xs text-stone-400 mb-1.5 font-medium uppercase tracking-wider">
          Modality: {dominantModal.charAt(0).toUpperCase() + dominantModal.slice(1)}
        </p>
        <p className="text-sm text-stone-600 leading-relaxed">
          {MODAL_DESCRIPTIONS[dominantModal]}
        </p>
      </div>
    </div>,

    // 5 ── Compatibility
    <div key="compat" className="space-y-5">
      <div className="text-center space-y-1">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Compatibility</p>
        <p className="text-stone-500 text-sm">Signs that harmonise with {astro.signs.sun}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {compat.bestWith.map((s) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <ZodiacIcon sign={s} size={34} />
            <SignBadge sign={s} size="sm" />
          </div>
        ))}
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <p className="text-sm text-stone-600 leading-relaxed">{compat.insight}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Your Big Three Summary</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(["sun", "moon", "rising"] as const).map((k) => (
            <div key={k} className="bg-stone-50 rounded-xl border border-stone-100 p-2.5">
              <p className="text-xs text-stone-400 capitalize mb-1">{k}</p>
              <p className="text-xs font-medium text-stone-700">{astro.signs[k]}</p>
              <ZodiacIcon sign={astro.signs[k]} size={22} className="mx-auto mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {submitError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {submitError}
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full h-11 bg-stone-900 text-white hover:bg-stone-800 rounded-xl gap-2"
      >
        {submitting ? "Saving…" : "Complete Setup"}
        <Check className="h-4 w-4" />
      </Button>
    </div>,
  ];

  return (
    <div className="space-y-4">
      {/* Slide content */}
      <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm overflow-hidden min-h-[360px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {slides[slide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          disabled={slide === 0}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors",
            slide === 0 ? "text-stone-300 cursor-default" : "text-stone-600 hover:text-stone-900"
          )}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "rounded-full transition-all",
                i === slide ? "w-4 h-2 bg-stone-700" : "w-2 h-2 bg-stone-200 hover:bg-stone-300"
              )}
            />
          ))}
        </div>

        {slide < SLIDE_COUNT - 1 ? (
          <button
            onClick={next}
            className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-14" /> // spacer to keep dots centred
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function togglePrefGender(option: string) {
    setForm((f) => ({
      ...f,
      prefGenders: f.prefGenders.includes(option)
        ? f.prefGenders.filter((g) => g !== option)
        : [...f.prefGenders, option],
    }));
  }

  function validateStep0() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim())        e.name        = "Name is required.";
    if (!form.birthDate)          e.birthDate   = "Birth date is required.";
    if (!form.birthCity.trim())   e.birthCity   = "Birth city is required.";
    if (!form.birthCountry.trim()) e.birthCountry = "Birth country is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (form.prefGenders.length === 0) e.prefGenders = "Select at least one preference.";
    if (form.prefAgeMin < 18)          e.prefAgeMin  = "Minimum age must be 18+.";
    if (form.prefAgeMax > 80)          e.prefAgeMax  = "Maximum age must be 80 or below.";
    if (form.prefAgeMin >= form.prefAgeMax) e.prefAgeMax = "Max age must be greater than min age.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, prefGenders: form.prefGenders.join(",") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to save profile. Please try again.");
        return;
      }
      router.push("/pricing");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const astrologyPreview =
    step === 2 && form.birthDate
      ? calculateAstrologyProfile(new Date(form.birthDate), form.birthTime || undefined, form.birthCity)
      : null;

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-stone-700 fill-stone-700/30" />
            <span className="font-serif text-xl font-semibold text-stone-900">StarCross</span>
          </div>
          <p className="text-stone-400 text-sm">
            {step === 2 ? "Your cosmic profile" : "Tell us about yourself"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <StepIndicator current={step} total={STEPS.length} />
          <p className="text-stone-500 text-sm">{STEPS[step]}</p>
        </div>

        {/* Steps 0 & 1 — wrapped in a card */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white border border-stone-100 rounded-2xl p-8 shadow-sm space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-11" />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="birthDate">Date of Birth</Label>
                  <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} className="h-11" />
                  {errors.birthDate && <p className="text-red-500 text-xs">{errors.birthDate}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="birthTime">
                    Time of Birth{" "}
                    <span className="text-stone-400 font-normal">(optional — improves rising sign accuracy)</span>
                  </Label>
                  <Input id="birthTime" type="time" value={form.birthTime} onChange={(e) => update("birthTime", e.target.value)} className="h-11" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="birthCity">Birth City</Label>
                    <Input id="birthCity" placeholder="e.g. New York" value={form.birthCity} onChange={(e) => update("birthCity", e.target.value)} className="h-11" />
                    {errors.birthCity && <p className="text-red-500 text-xs">{errors.birthCity}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birthCountry">Country</Label>
                    <Input id="birthCountry" placeholder="e.g. USA" value={form.birthCountry} onChange={(e) => update("birthCountry", e.target.value)} className="h-11" />
                    {errors.birthCountry && <p className="text-red-500 text-xs">{errors.birthCountry}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleNext} className="gap-2 bg-stone-900 text-white hover:bg-stone-800">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white border border-stone-100 rounded-2xl p-8 shadow-sm space-y-5">
                {/* Gender */}
                <div className="space-y-2">
                  <Label>I identify as <span className="text-stone-400 font-normal">(optional)</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => update("gender", form.gender === g ? "" : g)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-all",
                          form.gender === g
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pref genders */}
                <div className="space-y-2">
                  <Label>Interested in</Label>
                  <div className="flex flex-wrap gap-2">
                    {PREF_GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => togglePrefGender(g)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-all",
                          form.prefGenders.includes(g)
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.prefGenders && <p className="text-red-500 text-xs">{errors.prefGenders}</p>}
                </div>

                {/* Age range */}
                <div className="space-y-3">
                  <Label>Age range</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="ageMin" className="text-xs text-stone-400">Minimum</Label>
                      <Input id="ageMin" type="number" min={18} max={79} value={form.prefAgeMin} onChange={(e) => update("prefAgeMin", parseInt(e.target.value) || 18)} className="h-11" />
                      {errors.prefAgeMin && <p className="text-red-500 text-xs">{errors.prefAgeMin}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ageMax" className="text-xs text-stone-400">Maximum</Label>
                      <Input id="ageMax" type="number" min={19} max={80} value={form.prefAgeMax} onChange={(e) => update("prefAgeMax", parseInt(e.target.value) || 45)} className="h-11" />
                      {errors.prefAgeMax && <p className="text-red-500 text-xs">{errors.prefAgeMax}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <Button variant="outline" onClick={handleBack} className="gap-2 border-stone-200 text-stone-600">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} className="gap-2 bg-stone-900 text-white hover:bg-stone-800">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && astrologyPreview && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ChartCarousel
                form={form}
                astro={astrologyPreview}
                submitError={submitError}
                submitting={submitting}
                onSubmit={handleSubmit}
              />

              <div className="flex justify-start mt-4">
                <Button variant="outline" onClick={handleBack} className="gap-2 border-stone-200 text-stone-600">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
