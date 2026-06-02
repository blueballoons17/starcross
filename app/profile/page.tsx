"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Moon,
  Plus,
  Star,
  Sun,
  X,
} from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { PageStars } from "@/components/PageStars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getZodiacColor } from "@/lib/zodiac-colors";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import {
  COMPATIBILITY,
  ELEMENT_DESCRIPTIONS,
  MODAL_DESCRIPTIONS,
  MOON_DESCRIPTIONS,
  RISING_DESCRIPTIONS,
  SIGN_ELEMENTS,
  SIGN_MODALS,
  SUN_SUMMARIES,
} from "@/lib/astrology";
import { cn } from "@/lib/utils";
import { PERSONALITY_QUESTIONS } from "@/lib/personality-questions";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ProfileData {
  profile: {
    name: string;
    birthDate: string;
    birthCity: string;
    birthCountry: string;
    gender?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    interests?: string | null;
    photos?: string | null;
    answers?: string | null;
  };
  astrologyProfile: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    elementScores: { fire: number; earth: number; air: number; water: number };
    modalScores: { cardinal: number; fixed: number; mutable: number };
    traits: {
      emotionalStyle: string;
      communicationStyle: string;
      relationshipNeeds: string;
      conflictStyle: string;
    };
  } | null;
}

const PRESET_INTERESTS = [
  "Astrology", "Meditation", "Yoga", "Reading", "Hiking", "Travel",
  "Cooking", "Music", "Art", "Film", "Fitness", "Coffee", "Wine",
  "Brunch", "Photography", "Dancing", "Gaming", "Concerts", "Museums",
  "Vintage Fashion", "Skincare", "Plants", "Cats", "Dogs", "Tarot",
  "Crystals", "Journaling", "Podcasts", "Theatre",
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function getAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function parseJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

// ─── Sign badge ────────────────────────────────────────────────────────────

function SignBadge({ sign, size = "md" }: { sign: string; size?: "sm" | "md" | "lg" }) {
  const c = getZodiacColor(sign);
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full border font-medium", c.bg, c.text, c.border,
      size === "sm" && "px-2.5 py-1 text-xs",
      size === "md" && "px-3 py-1.5 text-sm",
      size === "lg" && "px-4 py-2 text-base",
    )}>
      <ZodiacIcon sign={sign} size={size === "lg" ? 22 : size === "sm" ? 17 : 19} />
      {sign}
    </div>
  );
}

// ─── Client-side image compression ────────────────────────────────────────

async function compressImage(file: File, maxDimension = 900, quality = 0.75): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      // Scale down if larger than maxDimension, never upscale
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not available")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      // Try WebP first (best compression), fall back to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], `photo.webp`, { type: "image/webp" }));
          } else {
            // WebP not supported, try JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) resolve(new File([jpegBlob], `photo.jpg`, { type: "image/jpeg" }));
                else reject(new Error("Compression failed"));
              },
              "image/jpeg",
              quality
            );
          }
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

// ─── Avatar upload ──────────────────────────────────────────────────────────

function AvatarUpload({
  name,
  avatarUrl,
  onUploaded,
}: {
  name: string;
  avatarUrl?: string | null;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const compressed = await compressImage(file, 800); // avatars: 800px max
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        onUploaded(data.url);
      } else {
        setUploadError(data.error ?? "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Network error. please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-stone-700 to-stone-900 shadow-md">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(name)}
            </div>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-stone-900 border-2 border-white flex items-center justify-center shadow-sm hover:bg-stone-700 transition-colors"
          title="Change photo"
        >
          {uploading ? (
            <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
          ) : (
            <Camera className="h-3 w-3 text-white" />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {uploadError && (
        <p className="text-red-500 text-xs text-center max-w-[120px] leading-tight">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Photos grid ────────────────────────────────────────────────────────────

function PhotosGrid({
  photos,
  onAdd,
  onRemove,
}: {
  photos: string[];
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const MAX_PHOTOS = 6;

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const compressed = await compressImage(file, 900); // gallery: 900px max
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        onAdd(data.url);
      } else {
        setUploadError(data.error ?? "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Network error. please try again.");
    } finally {
      setUploading(false);
    }
  }

  const slots = Array.from({ length: MAX_PHOTOS });

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((_, i) => {
        const photo = photos[i];
        if (photo) {
          return (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onRemove(photo)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-stone-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
              {i === 0 && (
                <div className="absolute bottom-1 left-1 bg-stone-900/60 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Main
                </div>
              )}
            </div>
          );
        }
        // Empty slot
        if (photos.length < MAX_PHOTOS && i === photos.length) {
          return (
            <button
              key={i}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1 hover:border-stone-400 hover:bg-stone-50 transition-colors"
            >
              {uploading ? (
                <div className="w-4 h-4 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
              ) : (
                <>
                  <Plus className="h-5 w-5 text-stone-400" />
                  <span className="text-xs text-stone-400">Add photo</span>
                </>
              )}
            </button>
          );
        }
        return (
          <div key={i} className="aspect-square rounded-xl bg-stone-50 border border-stone-100" />
        );
      })}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {uploadError && (
        <p className="col-span-3 text-red-500 text-xs text-center mt-1">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Interests editor ──────────────────────────────────────────────────────

function InterestsEditor({
  interests,
  onChange,
}: {
  interests: string[];
  onChange: (updated: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle(tag: string) {
    if (interests.includes(tag)) {
      onChange(interests.filter((t) => t !== tag));
    } else if (interests.length < 12) {
      onChange([...interests, tag]);
    }
  }

  function addCustom() {
    const v = custom.trim();
    if (v && !interests.includes(v) && interests.length < 12) {
      onChange([...interests, v]);
      setCustom("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-stone-900 font-semibold text-sm">Interests</h3>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
        >
          <Edit2 className="h-3 w-3" />
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Current interests */}
      <div className="flex flex-wrap gap-2">
        {interests.length === 0 && !editing && (
          <p className="text-xs text-stone-400 italic">No interests added yet, tap Edit to add some.</p>
        )}
        {interests.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              editing
                ? "bg-stone-900 text-white border-stone-900 pr-2"
                : "bg-stone-100 text-stone-700 border-stone-200"
            )}
          >
            {tag}
            {editing && (
              <button onClick={() => toggle(tag)} className="ml-0.5 hover:text-red-300 transition-colors">
                <X className="h-3 w-3" />
              </button>
            )}
          </motion.span>
        ))}
        {interests.length < 12 && !editing && interests.length > 0 && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add more
          </button>
        )}
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-3">
              {/* Preset chips */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {PRESET_INTERESTS.map((tag) => {
                  const active = interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggle(tag)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs border transition-all",
                        active
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                      )}
                    >
                      {active && <Check className="h-2.5 w-2.5 inline mr-1" />}
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add your own…"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  className="h-8 text-xs flex-1"
                />
                <Button size="sm" onClick={addCustom} className="h-8 bg-stone-900 text-white hover:bg-stone-800 text-xs px-3">
                  Add
                </Button>
              </div>
              <p className="text-xs text-stone-400">{interests.length}/12 interests selected</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chart carousel ────────────────────────────────────────────────────────

const SLIDE_COUNT = 6;
type AstroProfile = NonNullable<ProfileData["astrologyProfile"]>;

function ChartCarousel({ profile, astro }: { profile: ProfileData["profile"]; astro: AstroProfile }) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > slide ? 1 : -1);
    setSlide(idx);
  }, [slide]);

  const prev = () => slide > 0 && goTo(slide - 1);
  const next = () => slide < SLIDE_COUNT - 1 && goTo(slide + 1);

  const dominantEl = (Object.entries(astro.elementScores) as [string, number][]).reduce((a, b) => b[1] > a[1] ? b : a)[0];
  const dominantModal = (Object.entries(astro.modalScores) as [string, number][]).reduce((a, b) => b[1] > a[1] ? b : a)[0];
  const compat = COMPATIBILITY[astro.sunSign];

  const slides = [
    // 0 ── Big Three
    <div key="big3" className="space-y-5">
      <div className="text-center space-y-1">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Big Three</p>
        <h2 className="font-serif text-stone-900 font-semibold text-lg">{profile.name}&apos;s Chart</h2>
        <p className="text-stone-400 text-sm">{profile.birthCity}, {profile.birthCountry}</p>
      </div>
      {([
        { label: "Sun", Icon: Sun, sign: astro.sunSign, tagline: "Your core identity" },
        { label: "Moon", Icon: Moon, sign: astro.moonSign, tagline: "Your inner world" },
        { label: "Rising", Icon: ArrowUp, sign: astro.risingSign, tagline: "Your first impression" },
      ] as const).map(({ label, Icon, sign, tagline }) => (
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
      <p className="text-xs text-stone-400 text-center">Swipe through the slides to explore your full chart →</p>
    </div>,

    // 1 ── Sun
    <div key="sun" className="space-y-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border border-amber-100 mb-1">
          <Sun className="h-5 w-5 text-amber-600" />
        </div>
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Sun Sign</p>
        <SignBadge sign={astro.sunSign} size="lg" />
        <p className="text-stone-500 text-sm">{SUN_SUMMARIES[astro.sunSign]}</p>
      </div>
      <div className="space-y-3">
        {([
          { label: "Emotional style", text: astro.traits.emotionalStyle },
          { label: "How you communicate", text: astro.traits.communicationStyle },
          { label: "What you need in love", text: astro.traits.relationshipNeeds },
          { label: "How you handle conflict", text: astro.traits.conflictStyle },
        ] as const).map(({ label, text }) => (
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

    // 2 ── Moon
    <div key="moon" className="space-y-5">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 mb-1">
          <Moon className="h-5 w-5 text-indigo-500" />
        </div>
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Moon Sign</p>
        <SignBadge sign={astro.moonSign} size="lg" />
        <p className="text-xs text-stone-400">Your inner emotional world</p>
      </div>
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 space-y-3">
        <p className="text-sm text-stone-700 font-medium">Moon in {astro.moonSign}</p>
        <p className="text-sm text-stone-600 leading-relaxed">{MOON_DESCRIPTIONS[astro.moonSign]}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Element</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_ELEMENTS[astro.moonSign]}</p>
        </div>
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Modality</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_MODALS[astro.moonSign]}</p>
        </div>
      </div>
      <p className="text-xs text-stone-400 text-center leading-relaxed">The Moon governs your emotional instincts, inner needs, and the self you reveal only to those closest to you.</p>
    </div>,

    // 3 ── Rising
    <div key="rising" className="space-y-5">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 mb-1">
          <ArrowUp className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Rising Sign</p>
        <SignBadge sign={astro.risingSign} size="lg" />
        <p className="text-xs text-stone-400">Your first impression on the world</p>
      </div>
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 space-y-3">
        <p className="text-sm text-stone-700 font-medium">{astro.risingSign} Rising</p>
        <p className="text-sm text-stone-600 leading-relaxed">{RISING_DESCRIPTIONS[astro.risingSign]}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Element</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_ELEMENTS[astro.risingSign]}</p>
        </div>
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
          <p className="text-xs text-stone-400 mb-1">Modality</p>
          <p className="text-sm font-medium text-stone-700 capitalize">{SIGN_MODALS[astro.risingSign]}</p>
        </div>
      </div>
      <p className="text-xs text-stone-400 text-center bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
        Rising sign accuracy improves with your exact birth time, edit your profile to add it.
      </p>
    </div>,

    // 4 ── Elements
    <div key="elements" className="space-y-5">
      <div className="text-center space-y-1">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Your Elements</p>
        <p className="text-stone-500 text-sm">How fire, earth, air &amp; water shape you</p>
      </div>
      <div className="space-y-3">
        {(["fire", "earth", "air", "water"] as const).map((el) => {
          const pct = astro.elementScores[el];
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
        <p className="text-sm text-stone-600 leading-relaxed">{ELEMENT_DESCRIPTIONS[dominantEl]}</p>
      </div>
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <p className="text-xs text-stone-400 mb-1.5 font-medium uppercase tracking-wider">
          Modality: {dominantModal.charAt(0).toUpperCase() + dominantModal.slice(1)}
        </p>
        <p className="text-sm text-stone-600 leading-relaxed">{MODAL_DESCRIPTIONS[dominantModal]}</p>
      </div>
    </div>,

    // 5 ── Compatibility
    <div key="compat" className="space-y-5">
      <div className="text-center space-y-1">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Compatibility</p>
        <p className="text-stone-500 text-sm">Signs that harmonise with {astro.sunSign}</p>
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
          {([
            { k: "Sun", sign: astro.sunSign },
            { k: "Moon", sign: astro.moonSign },
            { k: "Rising", sign: astro.risingSign },
          ] as const).map(({ k, sign }) => (
            <div key={k} className="bg-stone-50 rounded-xl border border-stone-100 p-2.5">
              <p className="text-xs text-stone-400 mb-1">{k}</p>
              <p className="text-xs font-medium text-stone-700">{sign}</p>
              <ZodiacIcon sign={sign} size={22} className="mx-auto mt-0.5" />
            </div>
          ))}
        </div>
      </div>
      <Button asChild className="w-full h-11 bg-stone-900 text-white hover:bg-stone-800 rounded-xl gap-2">
        <Link href="/discover">
          <Star className="h-4 w-4" />
          Find Your Matches
        </Link>
      </Button>
    </div>,
  ];

  return (
    <div className="space-y-4">
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
      <div className="flex items-center justify-between">
        <button onClick={prev} disabled={slide === 0} className={cn("flex items-center gap-1 text-sm font-medium transition-colors", slide === 0 ? "text-stone-300 cursor-default" : "text-stone-600 hover:text-stone-900")}>
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={cn("rounded-full transition-all", i === slide ? "w-4 h-2 bg-stone-700" : "w-2 h-2 bg-stone-200 hover:bg-stone-300")} />
          ))}
        </div>
        {slide < SLIDE_COUNT - 1 ? (
          <button onClick={next} className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : <div className="w-14" />}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Local mutable state for avatar, interests, photos, answers
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((raw) => {
        if (raw.astrologyProfile) {
          if (typeof raw.astrologyProfile.elementScores === "string")
            raw.astrologyProfile.elementScores = JSON.parse(raw.astrologyProfile.elementScores);
          if (typeof raw.astrologyProfile.modalScores === "string")
            raw.astrologyProfile.modalScores = JSON.parse(raw.astrologyProfile.modalScores);
          if (typeof raw.astrologyProfile.traits === "string")
            raw.astrologyProfile.traits = JSON.parse(raw.astrologyProfile.traits);
        }
        setData(raw);
        setAvatarUrl(raw.profile?.avatarUrl ?? null);
        setInterests(parseJson<string[]>(raw.profile?.interests, []));
        setPhotos(parseJson<string[]>(raw.profile?.photos, []));
        setAnswers(parseJson<Record<string, string>>(raw.profile?.answers, {}));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  async function saveMediaAndInterests(newAvatarUrl?: string, newInterests?: string[], newPhotos?: string[]) {
    if (!data?.profile) return;
    setSaving(true);
    try {
      const p = data.profile;
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          birthDate: p.birthDate,
          birthCity: p.birthCity,
          birthCountry: p.birthCountry,
          gender: p.gender,
          bio: p.bio,
          avatarUrl: newAvatarUrl ?? avatarUrl,
          interests: JSON.stringify(newInterests ?? interests),
          photos: JSON.stringify(newPhotos ?? photos),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarUploaded(url: string) {
    setAvatarUrl(url);
    saveMediaAndInterests(url, undefined, undefined);
  }

  function handleAddPhoto(url: string) {
    const updated = [...photos, url];
    setPhotos(updated);
    saveMediaAndInterests(undefined, undefined, updated);
  }

  function handleRemovePhoto(url: string) {
    const updated = photos.filter((p) => p !== url);
    setPhotos(updated);
    saveMediaAndInterests(undefined, undefined, updated);
  }

  function handleInterestsChange(updated: string[]) {
    setInterests(updated);
    // Debounced auto-save
    saveMediaAndInterests(undefined, updated, undefined);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-600 border-t-stone-200 animate-spin" />
          <p className="text-stone-400 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen">
        <PageStars />
        <NavBar />
        <main className="pt-20 pb-12 px-4 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-stone-500">No profile found.</p>
            <Button asChild className="bg-stone-900 text-white hover:bg-stone-800">
              <Link href="/onboarding">Complete Setup</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { profile, astrologyProfile: astro } = data;
  const age = getAge(profile.birthDate);

  return (
    <div className="min-h-screen">
      <PageStars />
      <NavBar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-md mx-auto space-y-5">

          {/* ── Profile header ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <AvatarUpload
                  name={profile.name}
                  avatarUrl={avatarUrl}
                  onUploaded={handleAvatarUploaded}
                />
                <div>
                  <h1 className="font-serif text-xl font-semibold text-stone-900">
                    {profile.name}, {age}
                  </h1>
                  <p className="text-stone-400 text-sm">{profile.birthCity}, {profile.birthCountry}</p>
                  {profile.gender && (
                    <Badge variant="secondary" className="mt-1 bg-stone-100 text-stone-600 border-stone-200">
                      {profile.gender}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-emerald-600 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Saved
                  </motion.span>
                )}
                <Button variant="outline" size="sm" asChild className="shrink-0 border-stone-200 text-stone-600 hover:bg-stone-50">
                  <Link href="/onboarding">
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>

            {profile.bio && (
              <p className="text-stone-600 text-sm leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* ── Photos ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-stone-900 font-semibold text-sm">Photos</h3>
              <span className="text-xs text-stone-400">{photos.length}/6</span>
            </div>
            <PhotosGrid
              photos={photos}
              onAdd={handleAddPhoto}
              onRemove={handleRemovePhoto}
            />
          </div>

          {/* ── Interests ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <InterestsEditor interests={interests} onChange={handleInterestsChange} />
          </div>

          {/* ── Fun questions ── */}
          {PERSONALITY_QUESTIONS.some((q) => answers[q.key]) && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
              <h3 className="font-serif text-stone-900 font-semibold text-sm">About Me</h3>
              <div className="space-y-3">
                {PERSONALITY_QUESTIONS.filter((q) => answers[q.key]).map((q) => (
                  <div key={q.key} className="bg-stone-50 rounded-xl border border-stone-100 px-4 py-3">
                    <p className="text-xs text-stone-400 mb-1">{q.emoji} {q.question}</p>
                    <p className="text-sm font-medium text-stone-700">{answers[q.key]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Chart carousel ── */}
          {astro ? (
            <ChartCarousel profile={profile} astro={astro} />
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center space-y-4">
              <Star className="h-8 w-8 text-stone-300 mx-auto" />
              <p className="text-stone-500 text-sm">No chart data yet.</p>
              <Button asChild className="bg-stone-900 text-white hover:bg-stone-800">
                <Link href="/onboarding">Calculate Your Chart</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
