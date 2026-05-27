export const ZODIAC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Aries:       { bg: "bg-red-500/20",     text: "text-red-300",     border: "border-red-500/30" },
  Taurus:      { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
  Gemini:      { bg: "bg-yellow-500/20",  text: "text-yellow-300",  border: "border-yellow-500/30" },
  Cancer:      { bg: "bg-slate-400/20",   text: "text-slate-300",   border: "border-slate-400/30" },
  Leo:         { bg: "bg-orange-500/20",  text: "text-orange-300",  border: "border-orange-500/30" },
  Virgo:       { bg: "bg-lime-500/20",    text: "text-lime-300",    border: "border-lime-500/30" },
  Libra:       { bg: "bg-pink-500/20",    text: "text-pink-300",    border: "border-pink-500/30" },
  Scorpio:     { bg: "bg-purple-600/20",  text: "text-purple-300",  border: "border-purple-600/30" },
  Sagittarius: { bg: "bg-blue-500/20",    text: "text-blue-300",    border: "border-blue-500/30" },
  Capricorn:   { bg: "bg-stone-500/20",   text: "text-stone-300",   border: "border-stone-500/30" },
  Aquarius:    { bg: "bg-cyan-500/20",    text: "text-cyan-300",    border: "border-cyan-500/30" },
  Pisces:      { bg: "bg-indigo-500/20",  text: "text-indigo-300",  border: "border-indigo-500/30" },
};

export function getZodiacColor(sign: string) {
  return ZODIAC_COLORS[sign] ?? { bg: "bg-violet-500/20", text: "text-violet-300", border: "border-violet-500/30" };
}

export const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};
