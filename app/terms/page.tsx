import Link from "next/link";

export const metadata = {
  title: "Terms of Service | StarCross",
  description: "The terms and conditions governing your use of StarCross.",
};

const LAST_UPDATED = "June 2, 2026";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl font-semibold text-stone-900 mt-12 mb-4 pb-2 border-b border-stone-100">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-stone-700 text-sm mt-6 mb-2">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-stone-600 text-sm leading-relaxed mb-3">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed mb-3">
      {children}
    </ul>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 text-xs text-stone-600 leading-relaxed uppercase tracking-wide font-medium mb-3">
      {children}
    </div>
  );
}

const EMAIL = "blueballoons17@gmail.com";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Header */}
      <header className="bg-[#faf8f4]/95 backdrop-blur border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span
              className="text-[13px] font-normal text-stone-700 tracking-[0.32em]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              starcross
            </span>
          </Link>
          <Link href="/" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Title block */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Legal</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Terms of Service</h1>
          <p className="text-stone-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Astrology notice — prominent banner */}
        <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-2">
            Important — Astrological Content
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            StarCross uses astrology as a fun and meaningful framework for exploring compatibility — not as a
            scientifically validated method. Compatibility scores, birth-chart interpretations, and planetary
            insights on this platform are <strong>for entertainment and self-reflection purposes only</strong>.
            They are not guaranteed to be accurate, complete, or predictive of any real-world relationship
            outcome. Please do not make important life decisions based solely on the astrological content provided here.
          </p>
        </div>

        {/* 1 */}
        <H2>1. Agreement to These Terms</H2>
        <P>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of StarCross and any related
          websites, applications, and services (collectively, the &ldquo;Service&rdquo;).
        </P>
        <P>
          The Service is operated by <strong className="text-stone-700">StarCross</strong> (&ldquo;StarCross,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
        </P>
        <P>
          By creating an account, accessing, or using the Service, you agree to be bound by these Terms. If you do not
          agree to these Terms, do not use the Service.
        </P>
        <P>
          We may update these Terms from time to time. If we make material changes, we may provide notice through the
          Service, by email, or by another reasonable method. Continued use of the Service after revised Terms become
          effective constitutes acceptance of the updated Terms.
        </P>

        {/* 2 */}
        <H2>2. Eligibility</H2>
        <P>To use StarCross, you must:</P>
        <UL>
          <li>Be at least 18 years old.</li>
          <li>Be legally capable of entering into a binding contract.</li>
          <li>Not be prohibited from using the Service under applicable law.</li>
          <li>
            Not have previously been removed or banned from the Service unless expressly permitted by us.
          </li>
          <li>Not be required to register as a sex offender under applicable law.</li>
        </UL>
        <P>
          By using the Service, you represent and warrant that you satisfy these requirements.
        </P>
        <P>
          We reserve the right to suspend or terminate accounts that do not meet eligibility requirements.
        </P>

        {/* 3 */}
        <H2>3. Your Account</H2>
        <P>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities
          that occur under your account.
        </P>
        <P>You agree to:</P>
        <UL>
          <li>Provide accurate and current information.</li>
          <li>Keep your information updated.</li>
          <li>Maintain the security of your login credentials.</li>
          <li>Notify us promptly of any unauthorized access or security breach.</li>
        </UL>
        <P>
          We may limit users to a single account and may remove duplicate or fraudulent accounts.
        </P>

        {/* 4 */}
        <H2>4. License to Use the Service</H2>
        <P>
          Subject to your compliance with these Terms, StarCross grants you a limited, non-exclusive,
          non-transferable, revocable license to access and use the Service for personal, non-commercial purposes.
        </P>
        <P>This license does not grant ownership of any aspect of the Service.</P>

        {/* 5 */}
        <H2>5. Acceptable Use</H2>
        <P>You agree not to:</P>
        <UL>
          <li>Harass, threaten, stalk, intimidate, or harm other users.</li>
          <li>Post false, misleading, or deceptive information.</li>
          <li>Impersonate any person or entity.</li>
          <li>Send spam or unsolicited commercial communications.</li>
          <li>Solicit money, investments, gifts, or financial information.</li>
          <li>Engage in sexual exploitation, trafficking, or unlawful activity.</li>
          <li>Use bots, scrapers, automated systems, or unauthorized scripts.</li>
          <li>Attempt to access systems, data, or infrastructure without authorization.</li>
          <li>Reverse engineer or interfere with the Service.</li>
          <li>Copy, distribute, or commercially exploit Service content without permission.</li>
          <li>Violate any law or regulation.</li>
        </UL>
        <P>Violations may result in suspension or termination of access.</P>

        {/* 6 */}
        <H2>6. User Content</H2>
        <P>
          You retain ownership of content you submit to the Service, including photographs, profile information,
          messages, and other materials (&ldquo;User Content&rdquo;).
        </P>
        <P>
          To operate the Service, you grant StarCross a non-exclusive, worldwide, royalty-free license to host, store,
          reproduce, display, transmit, and otherwise process User Content solely for the purpose of providing and
          improving the Service.
        </P>
        <P>You represent and warrant that:</P>
        <UL>
          <li>You own or have the necessary rights to your User Content.</li>
          <li>Your User Content does not violate any law or third-party rights.</li>
          <li>Your User Content complies with these Terms.</li>
        </UL>
        <P>
          We may remove User Content that violates these Terms or threatens the safety, integrity, or operation of the
          Service.
        </P>

        {/* 7 */}
        <H2>7. Subscriptions and Payments</H2>
        <P>StarCross may offer free and paid subscription plans.</P>

        <H3>Billing</H3>
        <P>
          Paid subscriptions are billed through Stripe or another authorized payment provider.
        </P>
        <P>
          By purchasing a subscription, you authorize recurring charges to your selected payment method until
          cancellation.
        </P>

        <H3>Cancellation</H3>
        <P>You may cancel at any time through your account settings.</P>
        <P>
          Cancellation becomes effective at the end of the current billing period unless otherwise required by law.
        </P>

        <H3>Refunds</H3>
        <P>
          Except where required by applicable law, purchases are non-refundable.
        </P>
        <P>
          If you believe you were charged in error, contact us within 30 days of the charge.
        </P>

        <H3>Pricing Changes</H3>
        <P>
          We may change pricing from time to time. Any material pricing changes will be communicated in advance and
          will apply prospectively.
        </P>

        {/* 8 */}
        <H2>8. No Background Checks</H2>
        <P>
          StarCross does not routinely conduct criminal background checks, identity verification, or screening of
          members.
        </P>
        <P>We do not guarantee the identity, intentions, or conduct of any user.</P>
        <P>
          You are solely responsible for your interactions with other users and should exercise caution when
          communicating or meeting in person.
        </P>
        <P>If you encounter unsafe behavior, please report it immediately.</P>

        {/* 9 */}
        <H2>9. Astrological Content — Entertainment Only</H2>
        <P>
          StarCross incorporates astrology — including sun signs, moon signs, rising signs, synastry charts, and
          planetary compatibility scores — as a creative lens for meeting people. You acknowledge and agree to the
          following:
        </P>

        <H3>Not a Science</H3>
        <P>
          Astrology is not a scientifically recognized discipline. The compatibility scores, personality trait
          descriptions, and chart readings generated by StarCross are algorithmically derived interpretations
          based on traditional astrological frameworks. They are <strong>not empirically validated</strong> and
          carry no guarantee of accuracy, completeness, or predictive value.
        </P>

        <H3>Entertainment and Self-Reflection Only</H3>
        <P>
          All astrological content on StarCross — including but not limited to compatibility percentages,
          elemental analysis, aspect interpretations, and match recommendations — is provided for{" "}
          <strong>entertainment and personal reflection purposes only</strong>. It should not be treated as
          professional advice of any kind (psychological, medical, financial, romantic, or otherwise).
        </P>

        <H3>No Guarantee of Compatibility or Outcomes</H3>
        <P>
          A high compatibility score does not guarantee a successful, healthy, or safe relationship. A low
          score does not mean two people are incompatible. StarCross makes no representations about the accuracy
          of any astrological assessment or its correlation with real-world relationship outcomes.
        </P>

        <H3>Your Own Judgment</H3>
        <P>
          You agree to rely on your own judgment, common sense, and personal values — not on astrological
          scores or chart readings — when deciding whether to pursue a connection with another user or to meet
          someone in person.
        </P>

        {/* 10 */}
        <H2>10. Intellectual Property</H2>
        <P>
          Except for User Content, all content, software, designs, logos, trademarks, text, graphics, and other
          materials associated with the Service are owned by or licensed to StarCross and are protected by intellectual
          property laws.
        </P>
        <P>No rights are granted except those expressly stated in these Terms.</P>

        {/* 11 */}
        <H2>11. Copyright Complaints</H2>
        <P>
          If you believe content on the Service infringes your copyright, please contact:
        </P>
        <p className="text-sm font-medium text-stone-700 mb-3">
          <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>
        </p>
        <P>Include:</P>
        <UL>
          <li>Identification of the copyrighted work.</li>
          <li>Identification of the allegedly infringing material.</li>
          <li>Your contact information.</li>
          <li>A statement that you have a good-faith belief the use is unauthorized.</li>
          <li>A statement that the information provided is accurate.</li>
        </UL>
        <P>We may remove allegedly infringing content where appropriate.</P>

        {/* 12 */}
        <H2>12. Disclaimer of Warranties</H2>
        <Callout>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the maximum extent permitted
          by law, StarCross disclaims all warranties, whether express, implied, statutory, or otherwise, including
          warranties of merchantability, fitness for a particular purpose, title, non-infringement, and quiet
          enjoyment. We do not guarantee continuous availability, error-free operation, successful matches,
          compatibility with any user, or accuracy of astrological interpretations. Astrological content is
          provided for entertainment only and is not scientifically validated.
        </Callout>
        <P>
          Astrological insights, compatibility scores, and chart readings are provided for entertainment and
          personal reflection purposes only. They do not constitute professional advice and are not guaranteed to
          reflect real-world compatibility or relationship outcomes. See Section 9 for full details.
        </P>

        {/* 13 */}
        <H2>13. Limitation of Liability</H2>
        <Callout>
          To the maximum extent permitted by law, StarCross shall not be liable for any indirect, incidental, special,
          consequential, exemplary, or punitive damages arising from or related to your use of the service. Our total
          liability for any claim arising from or related to the service shall not exceed the greater of: (a) the
          amount you paid to StarCross during the twelve (12) months preceding the event giving rise to the claim; or
          (b) one hundred U.S. dollars (US $100).
        </Callout>
        <P>
          Some jurisdictions do not allow certain liability limitations, so some of these limitations may not apply to
          you.
        </P>

        {/* 14 */}
        <H2>14. Indemnification</H2>
        <P>
          You agree to indemnify, defend, and hold harmless StarCross, its affiliates, officers, directors, employees,
          contractors, and agents from claims, liabilities, damages, losses, and expenses arising from:
        </P>
        <UL>
          <li>Your use of the Service.</li>
          <li>Your User Content.</li>
          <li>Your violation of these Terms.</li>
          <li>Your violation of any rights of another person or entity.</li>
        </UL>

        {/* 15 */}
        <H2>15. Suspension and Termination</H2>
        <P>You may stop using the Service and delete your account at any time.</P>
        <P>We may suspend, restrict, or terminate access if:</P>
        <UL>
          <li>You violate these Terms.</li>
          <li>
            We reasonably believe your conduct creates legal risk, security risk, or harm to users.
          </li>
          <li>We are required to do so by law.</li>
        </UL>
        <P>
          Sections that by their nature should survive termination will remain in effect after termination.
        </P>

        {/* 16 */}
        <H2>16. Service Changes</H2>
        <P>
          We reserve the right to modify, suspend, discontinue, or remove features of the Service at any time.
        </P>
        <P>
          We are not liable for any modification, suspension, or discontinuation of the Service.
        </P>

        {/* 17 */}
        <H2>17. Dispute Resolution</H2>
        <P>
          Before filing a legal claim, you agree to contact us at{" "}
          <a href={`mailto:${EMAIL}`} className="underline text-stone-700">{EMAIL}</a> and provide at least 30 days to
          attempt informal resolution.
        </P>
        <P>
          If a dispute cannot be resolved informally, it shall be resolved in accordance with applicable law and the
          dispute resolution procedures required by that law.
        </P>
        <P>
          Nothing in these Terms limits rights that cannot be waived under applicable consumer protection laws.
        </P>

        {/* 18 */}
        <H2>18. Governing Law</H2>
        <P>
          These Terms shall be governed by applicable law, without regard to conflict-of-law principles, except where
          otherwise required by applicable law.
        </P>

        {/* 19 */}
        <H2>19. Mobile App Stores</H2>
        <P>
          If you access the Service through an application marketplace such as Apple&apos;s App Store or Google Play,
          you acknowledge that those providers are not responsible for the Service and have no obligation to furnish
          support or maintenance.
        </P>

        {/* 20 */}
        <H2>20. Contact Us</H2>
        <P>Questions regarding these Terms may be directed to:</P>
        <p className="text-sm font-medium text-stone-700">
          <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>
        </p>
      </main>

      <footer className="border-t border-stone-100 py-8 px-6 text-center text-xs text-stone-400">
        <div className="flex justify-center gap-6 mb-3">
          <Link href="/privacy" className="hover:text-stone-700 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-stone-700 transition-colors font-medium text-stone-600">Terms</Link>
          <Link href="/cookies" className="hover:text-stone-700 transition-colors">Cookies</Link>
        </div>
        <p>© {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>
    </div>
  );
}
