import Link from "next/link";
import { Star, Sparkles, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-violet-400 fill-violet-400/30" />
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            StarCross
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          Astrology-based compatibility
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl leading-[1.1]">
          Find your{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent animate-shimmer">
            cosmic counterpart
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
          StarCross reads the stars so you don&apos;t have to. Your birth chart
          isn&apos;t just personality trivia — it&apos;s the most precise compatibility
          map you&apos;ll ever carry.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild className="px-10">
            <Link href="/signup">Begin Your Journey</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
          <FeatureCard
            icon={<Star className="h-6 w-6 text-violet-400" />}
            title="Astrological Matching"
            description="Your sun, moon, and rising signs form a unique fingerprint. We use all three — plus elemental and modal analysis — to surface genuinely compatible people."
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-fuchsia-400" />}
            title="Deep Compatibility"
            description="Beyond sign-to-sign rules, we score elemental harmony, emotional alignment, communication styles, and long-term stability — all at once."
          />
          <FeatureCard
            icon={<Heart className="h-6 w-6 text-indigo-400" />}
            title="Meaningful Connections"
            description="Every match comes with a plain-language breakdown of why it works and what to navigate — so you start conversations with context, not guesswork."
          />
        </div>

        {/* Social proof */}
        <div className="mt-16 flex items-center gap-3 text-slate-500 text-sm">
          <div className="flex -space-x-2">
            {["V", "M", "K", "S", "A"].map((initial, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 border-2 border-slate-950 flex items-center justify-center text-white text-xs font-medium"
              >
                {initial}
              </div>
            ))}
          </div>
          <Users className="h-4 w-4" />
          <span>Join thousands finding cosmic connections</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} StarCross. Written in the stars.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left hover:border-white/20 transition-colors">
      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
