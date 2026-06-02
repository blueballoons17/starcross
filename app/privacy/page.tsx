import Link from "next/link";
import { ShootingStarLogo } from "@/components/ui/shooting-star-logo";

export const metadata = {
  title: "Privacy Policy — StarCross",
  description: "How StarCross collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "May 30, 2026";

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
  return <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed mb-3">{children}</ul>;
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Header */}
      <header className="bg-[#faf8f4]/95 backdrop-blur border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShootingStarLogo size={16} className="text-stone-700" />
            <span
              className="text-xs font-medium text-stone-700 uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              StarCross
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
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Privacy Policy</h1>
          <p className="text-stone-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* 1 */}
        <H2>1. Who We Are</H2>
        <P>
          StarCross (&ldquo;StarCross,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is an
          astrology-based dating and connection platform operated by Iveena Mukherjee. This Privacy Policy explains
          what personal information we collect, how we use it, and the choices available to you regarding your
          information.
        </P>
        <P>
          By creating an account or using our services, you agree to the practices described in this Privacy Policy.
        </P>

        {/* 2 */}
        <H2>2. Information We Collect</H2>

        <H3>Information You Provide Directly</H3>
        <P>
          <strong className="text-stone-700">Account credentials</strong> — email address and password. Passwords are
          hashed using bcrypt before storage, and we do not store plaintext passwords.
        </P>
        <P>
          <strong className="text-stone-700">Profile information</strong> — your name, date of birth, time of birth,
          birth city, and birth country.
        </P>
        <P>
          <strong className="text-stone-700">Identity and preferences</strong> — gender, age preferences, and gender
          preferences.
        </P>
        <P>
          <strong className="text-stone-700">Profile content</strong> — bio, profile photo, gallery photos, interests,
          and personality question answers.
        </P>
        <P>
          <strong className="text-stone-700">Messages</strong> — content of messages you send to other members.
        </P>
        <P>
          <strong className="text-stone-700">Payment information</strong> — subscription and billing information
          processed by our payment provider. We do not store complete payment card numbers or banking information.
        </P>

        <H3>Information Generated Automatically</H3>
        <P>
          <strong className="text-stone-700">Astrological profile</strong> — Sun, Moon, and Rising signs, elemental and
          modal scores, compatibility metrics, and personality traits derived from your birth data.
        </P>
        <P>
          <strong className="text-stone-700">Usage data</strong> — swipes, likes, matches, profile views, interactions
          with app features, and other activity within the service.
        </P>
        <P>
          <strong className="text-stone-700">Session data</strong> — cookies and similar technologies used to
          authenticate users, maintain sessions, and improve service functionality. See our{" "}
          <Link href="/cookies" className="underline">Cookie Policy</Link> for additional details.
        </P>

        {/* 3 */}
        <H2>3. How We Use Your Information</H2>
        <P>We use personal information for the following purposes:</P>

        <H3>To Provide the Service</H3>
        <UL>
          <li>Calculate birth charts and astrological profiles.</li>
          <li>Generate compatibility scores and recommendations.</li>
          <li>Display profiles and matches.</li>
          <li>Enable messaging and other social features.</li>
        </UL>

        <H3>To Manage Accounts and Subscriptions</H3>
        <UL>
          <li>Create and maintain accounts.</li>
          <li>Authenticate users.</li>
          <li>Process subscription payments.</li>
          <li>Enforce subscription limits and account rules.</li>
        </UL>

        <H3>To Improve the Service</H3>
        <UL>
          <li>Analyze feature usage.</li>
          <li>Diagnose bugs and technical issues.</li>
          <li>Improve functionality, performance, and user experience.</li>
        </UL>
        <P>
          We do not sell personal information and do not use your data to train artificial intelligence models.
        </P>

        <H3>To Maintain Safety and Security</H3>
        <UL>
          <li>Detect fraud, abuse, spam, and unauthorized activity.</li>
          <li>Investigate reports and policy violations.</li>
          <li>Enforce our Terms of Service.</li>
          <li>Protect users and the platform.</li>
        </UL>

        <H3>To Communicate With You</H3>
        <UL>
          <li>Send match notifications.</li>
          <li>Provide service-related updates.</li>
          <li>Respond to support requests.</li>
          <li>Deliver account and billing communications.</li>
        </UL>
        <P>
          We do not send marketing emails without your consent where consent is required by law.
        </P>

        {/* 4 */}
        <H2>4. How We Share Your Information</H2>

        <H3>With Other Members</H3>
        <P>
          Information included in your profile may be visible to other members as part of normal use of the service.
          This may include:
        </P>
        <UL>
          <li>Name</li>
          <li>Age</li>
          <li>Birth city</li>
          <li>Profile photos</li>
          <li>Bio</li>
          <li>Interests</li>
          <li>Zodiac signs</li>
          <li>Compatibility information</li>
        </UL>
        <P>
          You are responsible for choosing what information you share through your profile and should avoid including
          information you wish to keep private.
        </P>

        <H3>With Service Providers</H3>
        <P>
          We use third-party providers to support core platform functions such as hosting, database services, and
          payment processing. These providers process information on our behalf subject to contractual obligations
          and their applicable privacy commitments.
        </P>

        <H3>For Legal Reasons</H3>
        <P>We may disclose information when reasonably necessary to:</P>
        <UL>
          <li>Comply with legal obligations.</li>
          <li>Respond to lawful requests from government authorities.</li>
          <li>Protect our rights, property, safety, or users.</li>
          <li>Investigate fraud or security incidents.</li>
          <li>Enforce our agreements.</li>
        </UL>

        <H3>Business Transfers</H3>
        <P>
          If StarCross is involved in a merger, acquisition, financing, asset sale, or similar corporate transaction,
          personal information may be transferred as part of that transaction.
        </P>

        <H3>No Sale of Personal Information</H3>
        <P>
          We do not sell personal information to advertisers, data brokers, or other third parties.
        </P>

        {/* 5 */}
        <H2>5. Birth Data and Astrological Information</H2>
        <P>
          Your birth date, birth time, and birth location are used solely to calculate and provide astrology-related
          features.
        </P>
        <P>
          Certain information we collect, including birth date, birth time, and birth location, may be considered
          sensitive personal information under applicable privacy laws. We use this information only to provide
          astrology-related services and features.
        </P>
        <P>
          We do not use this information for advertising, profiling unrelated to our services, or AI model training.
        </P>
        <P>
          Compatibility scores, astrological insights, and matchmaking recommendations are generated using proprietary
          calculations and are intended for entertainment and informational purposes only. They should not be
          interpreted as factual assessments, guarantees of compatibility, or predictions of relationship outcomes.
        </P>

        {/* 6 */}
        <H2>6. Photos</H2>
        <P>
          Photos you upload are stored using third-party storage providers and displayed to other users through the
          normal operation of the service.
        </P>
        <P>
          Anyone who obtains a direct image URL may be able to access that image. Do not upload photographs that you do
          not wish to share through the service.
        </P>
        <P>
          We do not use photographs for facial recognition, biometric identification, or AI model training.
        </P>

        {/* 7 */}
        <H2>7. Security</H2>
        <P>
          We use reasonable administrative, technical, and organizational safeguards designed to protect personal
          information from unauthorized access, disclosure, alteration, or destruction.
        </P>
        <P>
          However, no method of electronic transmission or storage is completely secure, and we cannot guarantee
          absolute security.
        </P>

        {/* 8 */}
        <H2>8. International Data Transfers</H2>
        <P>
          Our service providers and infrastructure may process information in countries other than the country in which
          you reside.
        </P>
        <P>
          By using StarCross, you understand that your information may be transferred to and processed in jurisdictions
          that may have different data protection laws than those in your home jurisdiction.
        </P>
        <P>
          Where required by law, we implement appropriate safeguards for such transfers.
        </P>

        {/* 9 */}
        <H2>9. Data Retention</H2>
        <P>
          We retain personal information for as long as reasonably necessary to provide the service and fulfill the
          purposes described in this Privacy Policy.
        </P>
        <P>
          If you delete your account, we will delete or de-identify your profile information and photos within 30 days,
          except where retention is required by law or reasonably necessary for:
        </P>
        <UL>
          <li>Security purposes</li>
          <li>Fraud prevention</li>
          <li>Dispute resolution</li>
          <li>Enforcement of our Terms of Service</li>
          <li>Compliance with legal obligations</li>
        </UL>
        <P>
          Messages you have sent may remain visible to recipients who previously received them.
        </P>
        <P>
          Certain financial and transaction records may be retained for longer periods as required by tax, accounting,
          or legal obligations.
        </P>

        {/* 10 */}
        <H2>10. Your Rights</H2>
        <P>
          Depending on your location and applicable law, you may have the right to:
        </P>
        <UL>
          <li>Access personal information we hold about you.</li>
          <li>Correct inaccurate personal information.</li>
          <li>Delete personal information.</li>
          <li>Receive a portable copy of your information.</li>
          <li>Object to or restrict certain processing activities.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </UL>
        <P>
          To exercise your rights, contact us using the information provided below.
        </P>
        <P>
          We may request information necessary to verify your identity before processing a request.
        </P>
        <P>
          We will respond within the time period required by applicable law.
        </P>

        {/* 11 */}
        <H2>11. Legal Bases for Processing (EEA and UK Users)</H2>
        <P>
          If you are located in the European Economic Area or the United Kingdom, we process personal information on
          one or more of the following legal grounds:
        </P>
        <UL>
          <li>Performance of a contract with you.</li>
          <li>Your consent.</li>
          <li>Compliance with legal obligations.</li>
          <li>
            Our legitimate interests in operating, securing, and improving the service, provided those interests are not
            overridden by your rights and interests.
          </li>
        </UL>

        {/* 12 */}
        <H2>12. Additional Rights for Certain U.S. Residents</H2>
        <P>
          Residents of certain U.S. states may have additional privacy rights under applicable law.
        </P>
        <P>These rights may include:</P>
        <UL>
          <li>Access rights</li>
          <li>Correction rights</li>
          <li>Deletion rights</li>
          <li>Portability rights</li>
          <li>Rights regarding certain sensitive personal information</li>
        </UL>
        <P>We do not sell personal information.</P>
        <P>We do not share personal information for cross-context behavioral advertising.</P>
        <P>
          Sensitive personal information we collect is used only as reasonably necessary to provide and operate the
          service.
        </P>

        {/* 13 */}
        <H2>13. Children&apos;s Privacy</H2>
        <P>
          StarCross is intended only for individuals who are at least 18 years old.
        </P>
        <P>
          We do not knowingly collect personal information from individuals under 18.
        </P>
        <P>
          If we become aware that an individual under 18 has created an account, we will take reasonable steps to
          delete the account and associated information.
        </P>
        <P>
          If you believe a minor is using the service, please contact us.
        </P>

        {/* 14 */}
        <H2>14. Do Not Track Signals</H2>
        <P>
          Some web browsers transmit &ldquo;Do Not Track&rdquo; signals.
        </P>
        <P>
          Because there is not currently a universally accepted standard for responding to such signals, StarCross does
          not currently respond to Do Not Track signals.
        </P>

        {/* 15 */}
        <H2>15. Contact Us</H2>
        <P>
          If you have questions about this Privacy Policy, wish to exercise your privacy rights, or need to report a
          concern, please contact:
        </P>
        <p className="text-sm font-medium text-stone-700 mb-3">
          <a href="mailto:blueballoons17@gmail.com" className="underline">blueballoons17@gmail.com</a>
        </p>
        <P>
          We will respond within the time period required by applicable law.
        </P>

        {/* 16 */}
        <H2>16. Changes to This Privacy Policy</H2>
        <P>
          We may update this Privacy Policy from time to time.
        </P>
        <P>
          If we make material changes, we may notify you through the service, by email, or through another appropriate
          method before the changes become effective.
        </P>
        <P>
          The &ldquo;Last updated&rdquo; date at the top of this Privacy Policy indicates when it was most recently
          revised.
        </P>
      </main>

      <footer className="border-t border-stone-100 py-8 px-6 text-center text-xs text-stone-400">
        <div className="flex justify-center gap-6 mb-3">
          <Link href="/privacy" className="hover:text-stone-700 transition-colors font-medium text-stone-600">Privacy</Link>
          <Link href="/terms" className="hover:text-stone-700 transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-stone-700 transition-colors">Cookies</Link>
        </div>
        <p>© {new Date().getFullYear()} StarCross. Written in the stars.</p>
      </footer>
    </div>
  );
}
