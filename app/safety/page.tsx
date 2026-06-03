import Link from "next/link";

export const metadata = {
  title: "Safety Tips | StarCross",
  description: "Tips for staying safe while connecting on StarCross.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-stone-900 mt-12 mb-4 pb-2 border-b border-stone-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Tip({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-4 border-b border-stone-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-base shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-stone-800 text-sm mb-1">{title}</h3>
        <p className="text-stone-500 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-stone-600 text-sm leading-relaxed mb-3">{children}</p>;
}

export default function SafetyTipsPage() {
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
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Safety Tips</h1>
          <p className="text-stone-400 text-sm">Your safety is our highest priority. Please read these tips before meeting anyone.</p>
        </div>

        {/* Safety nav */}
        <div className="flex flex-wrap gap-2 mb-10">
          {[
            { href: "/safety", label: "Safety Tips", active: true },
            { href: "/safety/resources", label: "Safety Resources" },
            { href: "/safety/features", label: "Safety Features" },
            { href: "/safety/reporting", label: "Reporting" },
          ].map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                active
                  ? "bg-stone-900 text-white border-stone-900"
                  : "border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <Section title="Before You Meet">
          <Tip icon="🔒" title="Never share financial information">
            Never send money or share financial information with someone you meet on StarCross, regardless of the circumstances they describe. Scammers often build trust over time before making requests.
          </Tip>
          <Tip icon="📞" title="Talk on the phone first">
            Before meeting in person, have a phone or video call. This helps you verify the person is who they say they are and get a better sense of whether you feel comfortable.
          </Tip>
          <Tip icon="🔍" title="Do your research">
            Search for your match online. A reverse image search of their profile photos can reveal whether images appear elsewhere on the internet under a different name.
          </Tip>
          <Tip icon="👥" title="Tell a friend">
            Tell a trusted friend or family member where you are going, who you are meeting, and when to expect you back. Share a screenshot of the profile if possible.
          </Tip>
        </Section>

        <Section title="When You Meet">
          <Tip icon="📍" title="Meet in a public place">
            Always meet for the first time in a busy public location — a café, restaurant, or other well-lit space. Avoid private or remote locations until you know someone well.
          </Tip>
          <Tip icon="🚗" title="Control your own transportation">
            Make sure you have your own way of getting to and from the date. Do not accept rides from someone you have just met. Keep your phone charged and bring a portable charger.
          </Tip>
          <Tip icon="🍹" title="Watch your drinks">
            Never leave your drink unattended, and do not accept drinks from strangers. If you feel strange or unwell, tell someone you trust immediately.
          </Tip>
          <Tip icon="🆘" title="Have an exit plan">
            If things feel off, trust your instincts and leave. It is always okay to end a date early. Inform a friend so they can call you with an excuse if needed.
          </Tip>
        </Section>

        <Section title="Staying Safe Online">
          <Tip icon="🚩" title="Recognise red flags">
            Be cautious of anyone who is overly eager too quickly, avoids video calls, claims to be overseas, or asks for money. These are common warning signs of romance scams.
          </Tip>
          <Tip icon="🔐" title="Protect your personal information">
            Do not share your home address, workplace, daily routine, or financial details with someone you have just matched with. Take time to build trust first.
          </Tip>
          <Tip icon="📵" title="Keep conversations on StarCross">
            We can only help you if something goes wrong while you are on our platform. Be cautious of people who immediately push to move communication off the app.
          </Tip>
          <Tip icon="🛡️" title="Use our safety features">
            Take advantage of the tools we build for your protection — including profile reporting, blocking, and our verified match system.{" "}
            <Link href="/safety/features" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
              Learn about safety features →
            </Link>
          </Tip>
        </Section>

        <div className="mt-12 bg-stone-900 rounded-2xl p-8 text-center">
          <p className="text-white font-semibold text-base mb-2">Something feels wrong?</p>
          <p className="text-stone-400 text-sm mb-5">
            If you feel you are in immediate danger, call your local emergency services (911 in the US). You can also report a concern directly to us.
          </p>
          <Link
            href="/safety/reporting"
            className="inline-flex items-center gap-2 bg-white text-stone-900 text-sm font-medium px-5 py-2.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            Report a concern
          </Link>
        </div>

        <P>
          <span className="text-stone-400 text-xs block mt-10">
            Need immediate help?{" "}
            <a href="https://www.thehotline.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-stone-700">
              National Domestic Violence Hotline
            </a>{" "}
            ·{" "}
            <a href="https://www.rainn.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-stone-700">
              RAINN
            </a>{" "}
            · Emergency: 911
          </span>
        </P>
      </main>

      <footer className="border-t border-stone-100 py-8 px-6 text-center">
        <p className="text-xs text-stone-400">&copy; {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>
    </div>
  );
}
