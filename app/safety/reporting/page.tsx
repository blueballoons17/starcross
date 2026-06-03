import Link from "next/link";

export const metadata = {
  title: "Reporting | StarCross",
  description: "How to report unsafe behaviour, scams, or policy violations on StarCross.",
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-5 border-b border-stone-100 last:border-0">
      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <h3 className="font-semibold text-stone-900 text-sm mb-1.5">{title}</h3>
        <p className="text-stone-500 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function Category({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-4 border-b border-stone-50 last:border-0">
      <span className="text-base mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="font-semibold text-stone-800 text-sm mb-0.5">{title}</p>
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

export default function ReportingPage() {
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
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Reporting</h1>
          <p className="text-stone-400 text-sm">How to flag unsafe behaviour — and what happens when you do.</p>
        </div>

        <SafetyNav active="/safety/reporting" />

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-10 text-sm text-amber-800">
          <strong>In immediate danger?</strong> Do not use this page. Call <strong>911</strong> (US) or your local emergency number immediately.
        </div>

        {/* How to report */}
        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-stone-900 mb-4 pb-2 border-b border-stone-100">
            How to Report Someone
          </h2>
          <Step n={1} title="Open the profile or conversation">
            Navigate to the profile of the person you want to report, or open the conversation thread with them.
          </Step>
          <Step n={2} title="Tap the three-dot menu">
            Tap the ⋯ icon at the top right of the profile or conversation screen.
          </Step>
          <Step n={3} title="Select 'Report'">
            Choose <strong>Report</strong> from the menu. You will be asked to select a reason for the report.
          </Step>
          <Step n={4} title="Choose a reason and submit">
            Select the category that best describes the issue and add any additional context you would like to share. Tap <strong>Submit</strong>.
          </Step>
          <Step n={5} title="We take it from here">
            Our Trust & Safety team reviews every report. You will receive a confirmation and, where appropriate, a follow-up. You can continue using StarCross normally.
          </Step>
        </div>

        {/* What you can report */}
        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-stone-900 mb-4 pb-2 border-b border-stone-100">
            What You Can Report
          </h2>
          <Category icon="💬" title="Harassment or threats">
            Abusive, threatening, or hostile messages. This includes unwanted sexual messages, persistent contact after being asked to stop, and verbal abuse.
          </Category>
          <Category icon="🤖" title="Fake profiles or bots">
            Profiles that appear to be fake, use stolen photos, or seem automated. You can use a reverse image search to verify profile photos before reporting.
          </Category>
          <Category icon="💸" title="Scams or financial requests">
            Anyone asking for money, gift cards, or financial information. Romance scams are a serious issue — report immediately and do not send anything.
          </Category>
          <Category icon="🔞" title="Inappropriate content">
            Unsolicited explicit photos or videos, or profile images that violate our community guidelines.
          </Category>
          <Category icon="🧒" title="Minors">
            If you believe a profile belongs to someone under 18, report it immediately. We have a zero-tolerance policy for minors on the platform.
          </Category>
          <Category icon="⚠️" title="Other policy violations">
            Anything else that makes you feel unsafe or uncomfortable, including discrimination, doxxing, or behaviour that violates our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-stone-900">Terms of Service</Link>.
          </Category>
        </div>

        {/* After you report */}
        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-stone-900 mb-4 pb-2 border-b border-stone-100">
            What Happens After You Report
          </h2>
          <div className="text-stone-500 text-sm space-y-3 leading-relaxed">
            <p>Every report is received by a human member of our Trust & Safety team. We do not use automated-only moderation.</p>
            <p>We aim to review reports within <strong className="text-stone-700">24 hours</strong>. Urgent matters — such as threats of violence or content involving minors — are escalated immediately.</p>
            <p>Outcomes may include a warning, temporary suspension, or permanent ban. In serious cases we may share information with law enforcement.</p>
            <p>We do not notify the reported user of your identity. Your safety and confidentiality are protected throughout the process.</p>
            <p>You will receive an in-app notification once your report has been reviewed. For follow-up questions, email us at{" "}
              <a href="mailto:safety@starcross.app" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">safety@starcross.app</a>.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-7">
          <p className="font-semibold text-stone-900 text-sm mb-1">Contact our Safety team directly</p>
          <p className="text-stone-500 text-sm mb-4">For urgent safety concerns that cannot wait for an in-app report.</p>
          <a
            href="mailto:safety@starcross.app"
            className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-stone-700 transition-colors"
          >
            safety@starcross.app
          </a>
        </div>
      </main>

      <footer className="border-t border-stone-100 py-8 px-6 text-center">
        <p className="text-xs text-stone-400">&copy; {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>
    </div>
  );
}
