import Link from "next/link";
import { LegalHeader, LegalFooter, H2, H3, P, UL } from "@/components/ui/legal-page-layout";

export const metadata = {
  title: "Safety Tips | StarCross",
  description: "Tips for staying safe while connecting on StarCross.",
};

const SAFETY_NAV = [
  { href: "/safety",           label: "Safety Tips",      active: true  },
  { href: "/safety/resources", label: "Safety Resources", active: false },
  { href: "/safety/features",  label: "Safety Features",  active: false },
  { href: "/safety/reporting", label: "Reporting",        active: false },
];

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Safety</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Safety Tips</h1>
          <p className="text-stone-400 text-sm">Your safety is our highest priority. Please read the following guidance before meeting anyone from the platform.</p>
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

        <H2>Before You Meet</H2>

        <H3>Never share financial information</H3>
        <P>
          Never send money or share financial details with someone you have met on StarCross, regardless of the circumstances they describe. Scammers frequently invest significant time in building trust before making requests. Any request for money, gift cards, cryptocurrency, or financial account access is a serious warning sign.
        </P>

        <H3>Speak by phone or video first</H3>
        <P>
          Before meeting in person, have a phone or video call. This gives you a better sense of who you are speaking with and helps confirm that the person is who they represent themselves to be.
        </P>

        <H3>Research the person</H3>
        <P>
          A basic internet search and a reverse image search of their profile photos can reveal whether images appear elsewhere under a different name. Take the time to do this before agreeing to meet.
        </P>

        <H3>Tell someone you trust</H3>
        <P>
          Inform a trusted friend or family member of where you are going, who you are meeting, and when they should expect to hear back from you. Share a screenshot of the profile if possible.
        </P>

        <H2>When You Meet</H2>

        <H3>Choose a public location</H3>
        <P>
          Always meet for the first time in a busy, well-lit public place such as a café or restaurant. Avoid private locations, residences, or secluded areas until you have established a meaningful level of trust over multiple meetings.
        </P>

        <H3>Arrange your own transport</H3>
        <P>
          Make your own way to and from the meeting. Do not accept rides from someone you have just met. Keep your phone fully charged and carry a portable charger if possible.
        </P>

        <H3>Keep your personal details private</H3>
        <P>
          During early meetings, avoid sharing your home address, workplace, daily schedule, or other personal details that could be misused. Build trust gradually over time.
        </P>

        <H3>Trust your instincts and have an exit plan</H3>
        <P>
          If at any point you feel uncomfortable or unsafe, trust your instincts and leave. It is always acceptable to end a date early. Arrange with a friend in advance that they can call you at a set time with an excuse if you need one.
        </P>

        <H2>Staying Safe Online</H2>

        <H3>Recognise warning signs</H3>
        <P>
          Be cautious of anyone who moves very quickly to declarations of affection, consistently avoids video calls, claims to be working abroad or in a restricted environment, or asks for money. These are common patterns in romance scams.
        </P>

        <H3>Protect your personal information</H3>
        <P>
          Do not share your home address, precise location, financial details, or daily routine with someone you have recently matched with. Take time to build trust before sharing personal information.
        </P>

        <H3>Keep conversations on StarCross</H3>
        <P>
          We can only investigate and act on behaviour that occurs within our platform. Be cautious of anyone who immediately encourages you to move the conversation to an external app or messaging service.
        </P>

        <H3>Use our reporting tools</H3>
        <P>
          StarCross provides tools to block and report users. If something feels wrong, please use them.{" "}
          <Link href="/safety/reporting" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            Learn how to report a concern.
          </Link>
        </P>

        <H2>Emergency Resources</H2>

        <P>
          If you are in immediate danger, contact your local emergency services. In the United States, call 911. Do not wait.
        </P>

        <P>
          Additional support organisations are listed on our{" "}
          <Link href="/safety/resources" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            Safety Resources
          </Link>{" "}
          page.
        </P>
      </main>

      <LegalFooter />
    </div>
  );
}
