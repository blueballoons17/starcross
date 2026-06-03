import Link from "next/link";

export const metadata = {
  title: "Safety Resources | StarCross",
  description: "External organisations and helplines for support and safety.",
};

const RESOURCES = [
  {
    category: "Crisis & Emergency",
    items: [
      { name: "Emergency Services", desc: "Immediate danger — call 911 (US) or your local emergency number.", url: null, cta: "Call 911" },
      { name: "Crisis Text Line", desc: "Text HOME to 741741 to reach a trained crisis counselor, 24/7.", url: "https://www.crisistextline.org", cta: "crisistextline.org" },
      { name: "988 Suicide & Crisis Lifeline", desc: "Call or text 988 for free, confidential support for people in distress.", url: "https://988lifeline.org", cta: "988lifeline.org" },
    ],
  },
  {
    category: "Domestic Violence & Abuse",
    items: [
      { name: "National Domestic Violence Hotline", desc: "24/7 confidential support for survivors of domestic violence. Call 1-800-799-7233.", url: "https://www.thehotline.org", cta: "thehotline.org" },
      { name: "RAINN", desc: "Nation's largest anti-sexual violence organisation. Call 1-800-656-4673.", url: "https://www.rainn.org", cta: "rainn.org" },
      { name: "Love Is Respect", desc: "Resources for teens and young adults experiencing dating abuse.", url: "https://www.loveisrespect.org", cta: "loveisrespect.org" },
    ],
  },
  {
    category: "Online Safety & Cybercrime",
    items: [
      { name: "Internet Crime Complaint Center (IC3)", desc: "Report online fraud and romance scams to the FBI.", url: "https://www.ic3.gov", cta: "ic3.gov" },
      { name: "FTC Scam Alerts", desc: "Learn about the latest scams and how to report them to the Federal Trade Commission.", url: "https://consumer.ftc.gov/scams", cta: "consumer.ftc.gov/scams" },
      { name: "Cyber Civil Rights Initiative", desc: "Support and resources for victims of non-consensual image sharing.", url: "https://cybercivilrights.org", cta: "cybercivilrights.org" },
    ],
  },
  {
    category: "Mental Health",
    items: [
      { name: "NAMI Helpline", desc: "National Alliance on Mental Illness — call 1-800-950-6264 for support.", url: "https://www.nami.org", cta: "nami.org" },
      { name: "Psychology Today Therapist Finder", desc: "Find a licensed therapist or counselor near you.", url: "https://www.psychologytoday.com/us/therapists", cta: "Find a therapist" },
      { name: "Open Path Collective", desc: "Affordable therapy options for those with financial constraints.", url: "https://openpathcollective.org", cta: "openpathcollective.org" },
    ],
  },
];

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

export default function SafetyResourcesPage() {
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
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Safety Resources</h1>
          <p className="text-stone-400 text-sm">External organisations, hotlines, and tools to keep you safe and supported.</p>
        </div>

        <SafetyNav active="/safety/resources" />

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-10 text-sm text-amber-800">
          <strong>In immediate danger?</strong> Call <strong>911</strong> (US) or your local emergency number right away. Do not wait.
        </div>

        {RESOURCES.map(({ category, items }) => (
          <div key={category} className="mb-10">
            <h2 className="font-serif text-xl font-semibold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-100">
              {category}
            </h2>
            <div className="space-y-4">
              {items.map(({ name, desc, url, cta }) => (
                <div key={name} className="flex items-start justify-between gap-4 py-3 border-b border-stone-50">
                  <div className="flex-1">
                    <p className="font-semibold text-stone-800 text-sm mb-0.5">{name}</p>
                    <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-stone-900 border border-stone-300 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors mt-0.5"
                    >
                      {cta} ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 leading-relaxed">
          StarCross does not endorse or operate these external resources. They are provided for informational purposes. If you have experienced something on StarCross, please{" "}
          <Link href="/safety/reporting" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            report it to us directly
          </Link>.
        </div>
      </main>

      <footer className="border-t border-stone-100 py-8 px-6 text-center">
        <p className="text-xs text-stone-400">&copy; {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>
    </div>
  );
}
