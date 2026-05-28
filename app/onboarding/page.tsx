"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateAstrologyProfile } from "@/lib/astrology";
import { getZodiacColor, ZODIAC_SYMBOLS } from "@/lib/zodiac-colors";
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
            <div
              className={cn(
                "h-px w-8 transition-all",
                i < current ? "bg-stone-700" : "bg-stone-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SignBadge({ label, sign }: { label: string; sign: string }) {
  const c = getZodiacColor(sign);
  return (
    <div className="text-center">
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium",
          c.bg, c.text, c.border
        )}
      >
        <span className="text-lg">{ZODIAC_SYMBOLS[sign]}</span>
        {sign}
      </div>
    </div>
  );
}

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
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.birthDate) newErrors.birthDate = "Birth date is required.";
    if (!form.birthCity.trim()) newErrors.birthCity = "Birth city is required.";
    if (!form.birthCountry.trim()) newErrors.birthCountry = "Birth country is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep1() {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (form.prefGenders.length === 0) newErrors.prefGenders = "Select at least one preference.";
    if (form.prefAgeMin < 18) newErrors.prefAgeMin = "Minimum age must be 18+.";
    if (form.prefAgeMax > 80) newErrors.prefAgeMax = "Maximum age must be 80 or below.";
    if (form.prefAgeMin >= form.prefAgeMax) newErrors.prefAgeMax = "Max age must be greater than min age.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      // Convert prefGenders array to comma-separated string for SQLite
      const payload = {
        ...form,
        prefGenders: form.prefGenders.join(","),
      };
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to save profile. Please try again.");
        return;
      }
      router.push("/discover");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Compute astrology preview for step 2
  const astrologyPreview =
    step === 2 && form.birthDate
      ? calculateAstrologyProfile(
          new Date(form.birthDate),
          form.birthTime || undefined,
          form.birthCity
        )
      : null;

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-stone-700 fill-stone-700/30" />
            <span className="font-serif text-xl font-semibold text-stone-900">
              StarCross
            </span>
          </div>
          <p className="text-stone-400 text-sm">
            {step === 2 ? "Your chart is ready" : "Tell us about yourself"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <StepIndicator current={step} total={STEPS.length} />
          <p className="text-stone-500 text-sm">{STEPS[step]}</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-100 rounded-2xl p-8 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-stone-700 text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="birthDate" className="text-stone-700 text-sm font-medium">Date of Birth</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => update("birthDate", e.target.value)}
                    className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                  />
                  {errors.birthDate && <p className="text-red-500 text-xs">{errors.birthDate}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="birthTime" className="text-stone-700 text-sm font-medium">
                    Time of Birth{" "}
                    <span className="text-stone-400 font-normal">(optional — for rising sign)</span>
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={form.birthTime}
                    onChange={(e) => update("birthTime", e.target.value)}
                    className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="birthCity" className="text-stone-700 text-sm font-medium">Birth City</Label>
                    <Input
                      id="birthCity"
                      placeholder="e.g. New York"
                      value={form.birthCity}
                      onChange={(e) => update("birthCity", e.target.value)}
                      className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                    />
                    {errors.birthCity && <p className="text-red-500 text-xs">{errors.birthCity}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birthCountry" className="text-stone-700 text-sm font-medium">Country</Label>
                    <Input
                      id="birthCountry"
                      placeholder="e.g. USA"
                      value={form.birthCountry}
                      onChange={(e) => update("birthCountry", e.target.value)}
                      className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                    />
                    {errors.birthCountry && <p className="text-red-500 text-xs">{errors.birthCountry}</p>}
                  </div>
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
                className="space-y-5"
              >
                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-stone-700 text-sm font-medium">
                    I identify as <span className="text-stone-400 font-normal">(optional)</span>
                  </Label>
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
                  <Label className="text-stone-700 text-sm font-medium">Interested in</Label>
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
                  <Label className="text-stone-700 text-sm font-medium">Age range</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="ageMin" className="text-xs text-stone-400">Minimum</Label>
                      <Input
                        id="ageMin"
                        type="number"
                        min={18}
                        max={79}
                        value={form.prefAgeMin}
                        onChange={(e) => update("prefAgeMin", parseInt(e.target.value) || 18)}
                        className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                      />
                      {errors.prefAgeMin && <p className="text-red-500 text-xs">{errors.prefAgeMin}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ageMax" className="text-xs text-stone-400">Maximum</Label>
                      <Input
                        id="ageMax"
                        type="number"
                        min={19}
                        max={80}
                        value={form.prefAgeMax}
                        onChange={(e) => update("prefAgeMax", parseInt(e.target.value) || 45)}
                        className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                      />
                      {errors.prefAgeMax && <p className="text-red-500 text-xs">{errors.prefAgeMax}</p>}
                    </div>
                  </div>
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
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 border border-stone-200 mb-3">
                    <Star className="h-7 w-7 text-stone-600 fill-stone-600/30" />
                  </div>
                  <h2 className="font-serif text-stone-900 font-semibold text-lg">{form.name}&apos;s Chart</h2>
                  <p className="text-stone-400 text-sm">{form.birthCity}, {form.birthCountry}</p>
                </div>

                {/* Sun/Moon/Rising */}
                <div className="grid grid-cols-3 gap-3">
                  <SignBadge label="Sun" sign={astrologyPreview.signs.sun} />
                  <SignBadge label="Moon" sign={astrologyPreview.signs.moon} />
                  <SignBadge label="Rising" sign={astrologyPreview.signs.rising} />
                </div>

                {/* Element distribution */}
                <div className="space-y-2">
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Element Balance</p>
                  {Object.entries(astrologyPreview.elements).map(([el, pct]) => (
                    <div key={el} className="flex items-center gap-3">
                      <span className="text-xs text-stone-500 w-10 capitalize">{el}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-stone-700 to-stone-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-400 w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Personality summary */}
                <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {astrologyPreview.traits.emotionalStyle.split(".")[0]}.
                  </p>
                </div>

                {submitError && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {submitError}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <Button variant="outline" onClick={handleBack} className="gap-2 border-stone-200 text-stone-600 hover:bg-stone-50">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <Button onClick={handleNext} className="gap-2 bg-stone-900 text-white hover:bg-stone-800">
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-stone-900 text-white hover:bg-stone-800">
              {submitting ? "Saving…" : "Complete Setup"}
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
