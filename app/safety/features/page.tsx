import Link from "next/link";
import { LegalHeader, LegalFooter, H2, H3, P } from "@/components/ui/legal-page-layout";

export const metadata = {
  title: "Safety Features | Kindred Stars",
  description: "The tools and controls Kindred Stars provides to keep you safe.",
};

const SAFETY_NAV = [
  { href: "/safety",           label: "Safety Tips",      active: false },
  { href: "/safety/resources", label: "Safety Resources", active: false },
  { href: "/safety/features",  label: "Safety Features",  active: true  },
  { href: "/safety/reporting", label: "Reporting",        active: false },
];

export default function SafetyFeaturesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Safety</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Safety Features</h1>
          <p className="text-stone-400 text-sm">The tools and controls we build into Kindred Stars to protect you, and how to use them.</p>
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

        <H2>Privacy Controls</H2>

        <H3>Location privacy</H3>
        <P>
          Kindred Stars never displays or stores your exact GPS coordinates. Proximity is shown at city level only, and only when you have enabled location features. You may disable location-based discovery at any time from your profile settings.
        </P>

        <H3>Photo control</H3>
        <P>
          You control which photos appear on your profile. Photos can be added or removed at any time. On supported devices, we prevent in-app screenshots of profile images.
        </P>

        <H3>Profile visibility</H3>
        <P>
          You may pause your profile at any time. While paused, your profile is not shown to new users. Existing matches and conversations are not affected.
        </P>

        <H2>Blocking and Reporting</H2>

        <H3>Block a user</H3>
        <P>
          You may block any user from their profile at any time. Once blocked, they cannot view your profile, contact you, or find you through discovery. Blocking is immediate and the other user is not notified.
        </P>

        <H3>Report a user</H3>
        <P>
          You may report a profile or a conversation from within the app at any time. Reports are reviewed by our Trust and Safety team. See our{" "}
          <Link href="/safety/reporting" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            Reporting page
          </Link>{" "}
          for full details on what happens after you submit a report.
        </P>

        <H3>Unmatch</H3>
        <P>
          Unmatching removes a conversation and prevents future contact. The other person is not notified, and your profile is removed from their match list.
        </P>

        <H2>Account Security</H2>

        <H3>Authentication</H3>
        <P>
          Kindred Stars uses industry-standard authentication practices. Passwords are hashed using bcrypt and are never stored in plain text. You may also sign in using your Google or Apple account.
        </P>

        <H3>Email verification</H3>
        <P>
          All accounts must be verified with a valid email address before accessing the platform. This reduces the presence of fake and automated accounts.
        </P>

        <H3>Account deletion</H3>
        <P>
          You may permanently delete your account and all associated data at any time from your profile settings. Deletion is irreversible and processed immediately.
        </P>

        <H2>Moderation</H2>

        <H3>Human review</H3>
        <P>
          Our Trust and Safety team personally reviews every report submitted through the platform. We do not rely exclusively on automated moderation systems.
        </P>

        <H3>Response time</H3>
        <P>
          We aim to review all reports within 24 hours of submission. Reports involving threats of violence, content depicting minors, or other urgent matters are escalated and acted upon as quickly as possible.
        </P>

        <H3>Outcomes</H3>
        <P>
          Depending on the nature and severity of a violation, outcomes may include a formal warning, temporary suspension, or permanent removal from the platform. In cases involving illegal conduct, we may share relevant information with law enforcement.
        </P>

        <H3>Ongoing improvement</H3>
        <P>
          We review and update our safety policies and features regularly. Safety on our platform is an ongoing commitment, not a one-time consideration.
        </P>
      </main>

      <LegalFooter />
    </div>
  );
}
