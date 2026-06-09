import Link from "next/link";
import { LegalHeader, LegalFooter, H2, H3, P } from "@/components/ui/legal-page-layout";

export const metadata = {
  title: "Safety Resources | Kindred Stars",
  description: "External organisations and helplines for safety and support.",
};

const SAFETY_NAV = [
  { href: "/safety",           label: "Safety Tips",      active: false },
  { href: "/safety/resources", label: "Safety Resources", active: true  },
  { href: "/safety/features",  label: "Safety Features",  active: false },
  { href: "/safety/reporting", label: "Reporting",        active: false },
];

export default function SafetyResourcesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Safety</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Safety Resources</h1>
          <p className="text-stone-400 text-sm">External organisations, helplines, and tools provided for informational purposes. If you are in immediate danger, call 911 or your local emergency number.</p>
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

        <H2>Crisis and Emergency</H2>

        <H3>Emergency Services</H3>
        <P>If you are in immediate danger, call 911 (United States) or your local emergency number. Do not wait.</P>

        <H3>Crisis Text Line</H3>
        <P>
          Text HOME to 741741 to connect with a trained crisis counselor, available 24 hours a day, seven days a week.{" "}
          <a href="https://www.crisistextline.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">crisistextline.org</a>
        </P>

        <H3>988 Suicide and Crisis Lifeline</H3>
        <P>
          Call or text 988 for free, confidential mental health crisis support.{" "}
          <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">988lifeline.org</a>
        </P>

        <H2>Domestic Violence and Abuse</H2>

        <H3>National Domestic Violence Hotline</H3>
        <P>
          Available 24 hours a day. Call 1-800-799-7233 or visit{" "}
          <a href="https://www.thehotline.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">thehotline.org</a>{" "}
          for confidential support for survivors of domestic violence.
        </P>

        <H3>RAINN</H3>
        <P>
          The nation&apos;s largest anti-sexual violence organisation. Call 1-800-656-4673 or visit{" "}
          <a href="https://www.rainn.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">rainn.org</a>.
        </P>

        <H3>Love Is Respect</H3>
        <P>
          Resources and support for people experiencing dating abuse, including resources tailored to young adults.{" "}
          <a href="https://www.loveisrespect.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">loveisrespect.org</a>
        </P>

        <H2>Online Safety and Cybercrime</H2>

        <H3>Internet Crime Complaint Center (IC3)</H3>
        <P>
          Report online fraud and romance scams to the FBI.{" "}
          <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">ic3.gov</a>
        </P>

        <H3>Federal Trade Commission — Scam Alerts</H3>
        <P>
          Learn about current scam tactics and how to report them.{" "}
          <a href="https://consumer.ftc.gov/scams" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">consumer.ftc.gov/scams</a>
        </P>

        <H3>Cyber Civil Rights Initiative</H3>
        <P>
          Support and resources for victims of non-consensual image sharing.{" "}
          <a href="https://cybercivilrights.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">cybercivilrights.org</a>
        </P>

        <H2>Mental Health</H2>

        <H3>NAMI Helpline</H3>
        <P>
          The National Alliance on Mental Illness helpline. Call 1-800-950-6264 for information and referrals.{" "}
          <a href="https://www.nami.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">nami.org</a>
        </P>

        <H3>Psychology Today Therapist Finder</H3>
        <P>
          A directory for finding licensed therapists and counselors near you.{" "}
          <a href="https://www.psychologytoday.com/us/therapists" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">psychologytoday.com</a>
        </P>

        <H3>Open Path Collective</H3>
        <P>
          Affordable therapy options for those with financial constraints.{" "}
          <a href="https://openpathcollective.org" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">openpathcollective.org</a>
        </P>

        <H2>Disclaimer</H2>
        <P>
          Kindred Stars does not operate, endorse, or have an affiliation with any of the external organisations listed on this page. These resources are provided for informational purposes only. If you have experienced something on Kindred Stars specifically, please{" "}
          <Link href="/safety/reporting" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            report it to us directly
          </Link>.
        </P>
      </main>

      <LegalFooter />
    </div>
  );
}
