import Link from "next/link";
import { LegalHeader, LegalFooter, H2, H3, P, UL } from "@/components/ui/legal-page-layout";

export const metadata = {
  title: "Reporting | Kindred Stars",
  description: "How to report unsafe behaviour, scams, or policy violations on Kindred Stars.",
};

const SAFETY_NAV = [
  { href: "/safety",           label: "Safety Tips",      active: false },
  { href: "/safety/resources", label: "Safety Resources", active: false },
  { href: "/safety/features",  label: "Safety Features",  active: false },
  { href: "/safety/reporting", label: "Reporting",        active: true  },
];

export default function ReportingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Safety</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Reporting</h1>
          <p className="text-stone-400 text-sm">How to flag unsafe behaviour on Kindred Stars, and what happens after you do. If you are in immediate danger, call 911 or your local emergency services now.</p>
        </div>

        {/* Section nav */}
        <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-stone-100">
          {SAFETY_NAV.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                active
                  ? "bg-stone-900 text-white border-stone-900"
                  : "border-stone-300 text-stone-500 hover:border-stone-600 hover:text-stone-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <H2>How to Report Someone</H2>

        <H3>Step 1: Open the profile or conversation</H3>
        <P>Navigate to the profile or conversation of the person you wish to report.</P>

        <H3>Step 2: Open the options menu</H3>
        <P>Tap the three-dot menu icon at the top right of the profile or conversation screen.</P>

        <H3>Step 3: Select Report</H3>
        <P>Choose Report from the menu. You will be prompted to select a reason for the report.</P>

        <H3>Step 4: Choose a reason and submit</H3>
        <P>Select the category that best describes the issue. You may add additional context in the text field. Tap Submit to send the report.</P>

        <H3>Step 5: We take it from there</H3>
        <P>Our Trust and Safety team reviews every report. You will receive a confirmation and, where applicable, a follow-up notification once the report has been reviewed. You may continue using Kindred Stars normally in the meantime.</P>

        <H2>What You Can Report</H2>

        <H3>Harassment or threats</H3>
        <P>
          Abusive, threatening, or hostile messages, including unwanted sexual messages, persistent contact after being asked to stop, and verbal abuse of any kind.
        </P>

        <H3>Fake profiles or suspected bots</H3>
        <P>
          Profiles that appear to use stolen photos, false identities, or automated behaviour. A reverse image search of profile photos can help identify stolen images before you report.
        </P>

        <H3>Scams or requests for money</H3>
        <P>
          Any user requesting money, gift cards, cryptocurrency, or financial account information. Do not send anything and report immediately.
        </P>

        <H3>Inappropriate content</H3>
        <P>
          Unsolicited explicit images or videos, or profile photos that violate our community guidelines.
        </P>

        <H3>Minors</H3>
        <P>
          If you believe a profile belongs to a person under 18 years of age, report it immediately. Kindred Stars has a zero-tolerance policy for minors on the platform.
        </P>

        <H3>Other violations</H3>
        <P>
          Anything else that makes you feel unsafe or uncomfortable, including discrimination, doxxing, or behaviour that violates our{" "}
          <Link href="/terms" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">Terms of Service</Link>.
        </P>

        <H2>What Happens After You Report</H2>

        <P>
          Every report is received and reviewed by a human member of our Trust and Safety team. We aim to review reports within 24 hours. Reports involving threats of violence, content depicting minors, or other urgent matters are escalated immediately.
        </P>

        <P>
          Depending on the outcome of the review, we may issue a warning, apply a temporary suspension, or permanently remove the user from the platform. In cases involving criminal conduct, we may share relevant information with law enforcement.
        </P>

        <P>
          The identity of the person who submitted a report is never disclosed to the reported user. You will receive an in-app notification once your report has been reviewed.
        </P>

        <H2>Contact Our Safety Team</H2>

        <P>
          For urgent safety concerns that cannot wait for an in-app report, you may contact our Safety team directly at{" "}
          <a href="mailto:safety@kindredstars.org" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            safety@kindredstars.org
          </a>.
        </P>

        <P>
          For general enquiries, contact us at{" "}
          <a href="mailto:admin.kindredstars@gmail.com" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            admin.kindredstars@gmail.com
          </a>.
        </P>
      </main>

      <LegalFooter />
    </div>
  );
}
