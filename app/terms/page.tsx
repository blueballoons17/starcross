import Link from "next/link";
import { ShootingStarLogo } from "@/components/ui/shooting-star-logo";

export const metadata = {
  title: "Terms of Service — StarCross",
  description: "The terms and conditions governing your use of StarCross.",
};

const LAST_UPDATED = "May 30, 2025";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-stone-900 mb-4 pb-2 border-b border-stone-100">
        {title}
      </h2>
      <div className="space-y-3 text-stone-600 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Header */}
      <header className="bg-[#faf8f4]/95 backdrop-blur border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShootingStarLogo size={16} className="text-stone-700" />
            <span className="text-xs font-medium text-stone-700 uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-cinzel)" }}>StarCross</span>
          </Link>
          <Link href="/" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">← Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Legal</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Terms of Service</h1>
          <p className="text-stone-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Agreement to These Terms">
          <p>
            By creating an account or using StarCross you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the service. These Terms form a binding legal agreement between you and StarCross.
          </p>
          <p>
            We may update these Terms from time to time. Continued use of StarCross after changes are posted constitutes acceptance of the revised Terms. We will notify you of material changes by email or in-app notice.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <ul className="list-disc pl-5 space-y-1">
            <li>You must be at least <strong className="text-stone-700">18 years old</strong> to create an account or use StarCross.</li>
            <li>You must not have been previously banned from StarCross.</li>
            <li>You must be able to enter into a binding contract under the laws of your jurisdiction.</li>
            <li>You must not be a convicted sex offender.</li>
          </ul>
          <p>
            By using StarCross you confirm that you meet these requirements. We reserve the right to terminate accounts where eligibility requirements are not met.
          </p>
        </Section>

        <Section title="3. Your Account">
          <p>
            You are responsible for keeping your account credentials secure and for all activity that occurs under your account. Use a strong, unique password. If you believe your account has been compromised, contact us immediately.
          </p>
          <p>
            You may only create one account. Duplicate accounts may be removed.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to use StarCross to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Harass, threaten, stalk, intimidate, or harm other users</li>
            <li>Post false, misleading, or deceptive profile information or photos</li>
            <li>Impersonate any person or entity</li>
            <li>Send unsolicited commercial messages or spam</li>
            <li>Solicit money, financial information, or gifts from other users</li>
            <li>Engage in any form of sexual exploitation or human trafficking</li>
            <li>Use automated tools, bots, or scripts to interact with the service</li>
            <li>Attempt to gain unauthorised access to any part of the service or its infrastructure</li>
            <li>Scrape, copy, or redistribute content from StarCross without our written permission</li>
            <li>Violate any applicable law or regulation</li>
          </ul>
          <p>
            Violations may result in immediate account suspension or permanent ban.
          </p>
        </Section>

        <Section title="5. Content You Post">
          <p>
            You retain ownership of content you post on StarCross (photos, bio, messages, etc.). By posting content you grant StarCross a non-exclusive, royalty-free, worldwide licence to store, display, and transmit that content solely for the purpose of operating the service.
          </p>
          <p>
            You are solely responsible for content you post. You must not post content that is illegal, abusive, defamatory, pornographic (outside of platforms that permit it), or that infringes the intellectual property rights of others.
          </p>
          <p>
            We reserve the right to remove any content that violates these Terms or that we deem harmful to the community, without notice.
          </p>
        </Section>

        <Section title="6. Subscriptions & Payments">
          <p>
            StarCross offers a free tier with limited daily swipes and a paid subscription (&quot;StarCross+&quot;) with unlimited access and additional features.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-stone-700">Billing:</strong> Subscription fees are charged through Stripe. By subscribing you authorise us to charge your payment method on a recurring basis at the selected interval (monthly or annual).</li>
            <li><strong className="text-stone-700">Cancellation:</strong> You may cancel your subscription at any time through your account settings or by contacting us. Cancellation takes effect at the end of the current billing period; you will not receive a pro-rated refund for unused time.</li>
            <li><strong className="text-stone-700">Price changes:</strong> We may change subscription pricing with reasonable advance notice. Continued use after a price change constitutes acceptance.</li>
            <li><strong className="text-stone-700">Refunds:</strong> All purchases are final and non-refundable except where required by applicable law. If you believe you have been charged in error, contact us within 30 days.</li>
          </ul>
        </Section>

        <Section title="7. No Background Checks">
          <p>
            <strong className="text-stone-700">StarCross does not conduct criminal background checks or identity verification on its members.</strong> We are not responsible for the conduct of any user on or off the platform. Use common sense and exercise caution when meeting someone from the app in person.
          </p>
          <p>
            If you encounter conduct that violates these Terms or that makes you feel unsafe, please report it through the app or contact us directly.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content, code, design, logos, and trade marks on StarCross (excluding user-generated content) are owned by or licensed to StarCross and protected by intellectual property law. You may not copy, reproduce, distribute, or create derivative works from our content without prior written permission.
          </p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>
            StarCross is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of harmful components.
          </p>
          <p>
            Astrological compatibility scores are for entertainment and self-reflection purposes. They are not a guarantee of romantic compatibility, and we make no representations about the suitability of any match.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, StarCross will not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the service, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            Our total liability to you for any claim arising out of these Terms or your use of StarCross shall not exceed the greater of (a) the amount you paid to StarCross in the 12 months preceding the claim, or (b) $100 USD.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p>
            You agree to indemnify and hold harmless StarCross and its officers, directors, employees, and agents from any claims, damages, or expenses (including reasonable legal fees) arising from your use of the service, your violation of these Terms, or your violation of any rights of another person.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            You may delete your account at any time from your profile settings. Deletion removes your profile data in accordance with our Privacy Policy.
          </p>
          <p>
            We may suspend or terminate your account at any time for violation of these Terms or for any other reason at our discretion, with or without notice. Provisions that by their nature should survive termination (including Sections 5, 8, 9, 10, 11, and 13) will do so.
          </p>
        </Section>

        <Section title="13. Governing Law & Disputes">
          <p>
            These Terms are governed by applicable law. Any dispute arising from these Terms or your use of StarCross that cannot be resolved informally should be submitted to binding arbitration or, where arbitration is not enforceable, to the courts of competent jurisdiction.
          </p>
          <p>
            Before initiating any formal proceeding, you agree to first contact us at legal@starcross.app and give us 30 days to attempt to resolve the dispute informally.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            Questions about these Terms? Contact us at:
          </p>
          <p className="font-medium text-stone-700">legal@starcross.app</p>
        </Section>
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
