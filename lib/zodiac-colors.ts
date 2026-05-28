export const ZODIAC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Aries:       { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
  Taurus:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Gemini:      { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  Cancer:      { bg: "bg-stone-50",   text: "text-stone-600",   border: "border-stone-200" },
  Leo:         { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  Virgo:       { bg: "bg-lime-50",    text: "text-lime-700",    border: "border-lime-200" },
  Libra:       { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200" },
  Scorpio:     { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  Sagittarius: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  Capricorn:   { bg: "bg-stone-100",  text: "text-stone-700",   border: "border-stone-300" },
  Aquarius:    { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200" },
  Pisces:      { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
};

export function getZodiacColor(sign: string) {
  return ZODIAC_COLORS[sign] ?? { bg: "bg-stone-50", text: "text-stone-700", border: "border-stone-200" };
}

export const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};
