import Link from "next/link";

export const metadata = {
  title: "Safety Features | StarCross",
  description: "The tools and features StarCross provides to keep you safe.",
};

function Feature({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-5 border-b border-stone-100 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-lg shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-stone-900 text-sm mb-1.5">{title}</h3>
        <p className="text-stone-500 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function SafetyNav({ active }: { active: string }) {
  const links = [
    { href: "/safety", label: "Safety Tips" },
    { href: "/safety/resources", label: "Safety Resources" },
    { href: "/safety/features", label: "Safety Features" },
    { href: "/safety/reporting", label: "Reporting" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-xs px-4 py-2 rounded-full border transition-colors ${
            href === active
              ? "bg-stone-900 text-white border-stone-900"
              : "border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function SafetyFeaturesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <header className="bg-[#faf8f4]/95 backdrop-blur border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[13px] font-normal text-stone-700 tracking-[0.32em]" style={{ fontFamily: "var(--font-inter)" }}>
            starcross
          </Link>
          <Link href="/" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">← Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Safety</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Safety Features</h1>
          <p className="text-stone-400 text-sm">The tools we build to protect you — and how to use them.</p>
        </div>

        <SafetyNav active="/safety/features" />

        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-100">
            Protecting Your Privacy
          </h2>
          <Feature icon="🙈" title="Location privacy">
            StarCross never shares or displays your exact location. We use city-level proximity only, and only when you explicitly enable it. Your precise GPS coordinates are never stored or shared.
          </Feature>
          <Feature icon="📸" title="Photo control">
            You control which photos appear on your profile and can remove them at any time. We do not allow screenshots within the app on supported devices.
          </Feature>
          <Feature icon="🔕" title="Match visibility controls">
            You choose who can see your profile. Pause your profile at any time to temporarily become invisible to new people without losing your existing matches.
          </Feature>
        </div>

        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-100">
            Blocking & Reporting
          </h2>
          <Feature icon="🚫" title="Block instantly">
            Block any user from their profile with one tap. Once blocked, they cannot see your profile, send messages, or find you through search. Blocking is permanent unless you undo it.
          </Feature>
          <Feature icon="🚩" title="Report in seconds">
            Report inappropriate profiles, messages, or behaviour directly from any conversation or profile view. Reports are reviewed by our Trust & Safety team within 24 hours.
          </Feature>
          <Feature icon="👻" title="Unmatch & disappear">
            Unmatching with someone removes the conversation and prevents future contact. They will not be notified. Your profile disappears from their matches list.
          </Feature>
        </div>

        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-100">
            Account Security
          </h2>
          <Feature icon="🔐" title="Secure authentication">
            StarCross uses industry-standard authentication. We never store your passwords in plain text. You can sign in securely using your existing Google or Apple account.
          </Feature>
          <Feature icon="📧" title="Email verification">
            All accounts must be verified with a valid email address before accessing the platform. This helps prevent fake and bot accounts.
          </Feature>
          <Feature icon="🗑️" title="Delete your account anytime">
            You have the right to permanently delete your account and all associated data at any time from your profile settings. Deletion is immediate and irreversible.
          </Feature>
        </div>

        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-100">
            Our Moderation Commitment
          </h2>
          <Feature icon="🛡️" title="Human review">
            Our Trust & Safety team personally reviews every report. We do not rely on automated systems alone. Real people investigate real concerns.
          </Feature>
          <Feature icon="⚡" title="Fast action">
            We aim to action all reports within 24 hours. Severe violations — including threats, explicit content, or harassment — are escalated immediately.
          </Feature>
          <Feature icon="🔄" title="Continuous improvement">
            We update our policies and features regularly based on user feedback and emerging safety research. Safety is not a one-time effort — it is an ongoing commitment.
          </Feature>
        </div>

        <div className="mt-12 bg-stone-900 rounded-2xl p-8 text-center">
          <p className="text-white font-semibold text-base mb-2">See something? Say something.</p>
          <p className="text-stone-400 text-sm mb-5">
            Our safety features only work when you use them. If something feels wrong, report it.
          </p>
          <Link
            href="/safety/reporting"
            className="inline-flex items-center gap-2 bg-white text-stone-900 text-sm font-medium px-5 py-2.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            How to report →
          </Link>
        </div>
      </main>

      <footer className="border-t border-stone-100 py-8 px-6 text-center">
        <p className="text-xs text-stone-400">&copy; {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>
    </div>
  );
}
