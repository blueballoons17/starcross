import Link from "next/link";
import { ShootingStarLogo } from "@/components/ui/shooting-star-logo";

export const metadata = {
  title: "Privacy Policy — StarCross",
  description: "How StarCross collects, uses, and protects your personal information.",
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

export default function PrivacyPage() {
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
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Privacy Policy</h1>
          <p className="text-stone-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Who We Are">
          <p>
            StarCross (&quot;StarCross&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an astrology-based dating and connection platform. This Privacy Policy explains what personal information we collect when you use StarCross, why we collect it, and how we use and protect it.
          </p>
          <p>
            By creating an account or using our services you agree to the practices described in this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong className="text-stone-700">Information you provide directly:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account credentials — email address and password (stored as a one-way bcrypt hash; we never see your plaintext password)</li>
            <li>Profile information — your name, date of birth, time of birth, birth city and country</li>
            <li>Identity and preferences — gender, age preferences, gender preferences</li>
            <li>Profile content — bio, profile photo, gallery photos, interests, and personality question answers</li>
            <li>Messages — content of messages you send to other members</li>
            <li>Payment information — processed by Stripe; we never store card numbers or banking details</li>
          </ul>

          <p className="mt-4"><strong className="text-stone-700">Information generated automatically:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Astrological profile — Sun, Moon, and Rising signs, elemental and modal scores, and personality traits derived from your birth data</li>
            <li>Usage data — swipes, likes, matches, and which profiles you have viewed</li>
            <li>Session data — cookies used to keep you logged in (see our <Link href="/cookies" className="underline">Cookie Policy</Link>)</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-stone-700">To provide the service</strong> — calculating your birth chart, computing compatibility scores, showing you matched profiles, and enabling messaging with your matches.</li>
            <li><strong className="text-stone-700">To manage your account and subscription</strong> — authenticating your identity, processing payments through Stripe, and enforcing subscription limits.</li>
            <li><strong className="text-stone-700">To improve the product</strong> — understanding how features are used so we can fix bugs and build better experiences. We do not sell your data or use it to train AI models.</li>
            <li><strong className="text-stone-700">To keep the platform safe</strong> — detecting abuse, enforcing our Terms of Service, and responding to reports.</li>
            <li><strong className="text-stone-700">To communicate with you</strong> — sending match notifications, service updates, and support responses. We do not send marketing emails without your consent.</li>
          </ul>
        </Section>

        <Section title="4. How We Share Your Information">
          <p><strong className="text-stone-700">With other members:</strong> Your name, age, birth city, photos, bio, interests, zodiac signs, and compatibility scores are visible to other members as part of normal app use.</p>
          <p><strong className="text-stone-700">With service providers:</strong> We share data with companies that help us operate StarCross:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-stone-700">Vercel</strong> — hosting infrastructure and photo storage</li>
            <li><strong className="text-stone-700">Turso (libSQL)</strong> — database storage</li>
            <li><strong className="text-stone-700">Stripe</strong> — payment processing</li>
          </ul>
          <p>Each provider is bound by data processing agreements and may only use your data to provide the service to us.</p>
          <p><strong className="text-stone-700">For legal reasons:</strong> We may disclose information if required by law, to protect rights and safety, or in connection with a corporate transaction such as a merger or acquisition.</p>
          <p><strong className="text-stone-700">We do not sell your personal information</strong> to advertisers or data brokers, ever.</p>
        </Section>

        <Section title="5. Birth Data & Astrological Information">
          <p>
            Your birth date, birth time, and birth location are used solely to calculate your astrological profile. This data is sensitive — it can be used to identify you — and we treat it with extra care. It is never shared with third parties except as described in Section 4 above, and only for the purpose of operating the service.
          </p>
          <p>
            In some jurisdictions (e.g. Illinois under BIPA, or Washington and Nevada under their consumer health data laws), birth-related data may be treated as sensitive personal information. If you have concerns about your rights under applicable state law, please contact us using the details in Section 10.
          </p>
        </Section>

        <Section title="6. Photos">
          <p>
            Photos you upload are stored in Vercel Blob storage and are publicly accessible via URL to anyone with the link (this is how your profile photos are displayed to other members). Do not upload photos you do not want shared within the app.
          </p>
          <p>
            We do not use your photos for facial recognition, biometric identification, or AI training.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your data for as long as your account is active. If you delete your account, we will delete your profile information, photos, and messages within 30 days, except where we are required by law to retain certain records (e.g. payment transaction records are retained for up to 7 years for tax and accounting purposes).
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on where you live, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-stone-700">Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong className="text-stone-700">Correction</strong> — update inaccurate information (most fields are editable directly in your profile)</li>
            <li><strong className="text-stone-700">Deletion</strong> — request that we delete your account and personal data</li>
            <li><strong className="text-stone-700">Portability</strong> — receive your data in a machine-readable format</li>
            <li><strong className="text-stone-700">Objection</strong> — object to certain types of processing</li>
          </ul>
          <p>
            To exercise any of these rights, email us at the address in Section 10. We will respond within 30 days. We may ask you to verify your identity before acting on a request.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            StarCross is intended for users aged 18 and over. We do not knowingly collect personal information from anyone under 18. If we become aware that a user is under 18 we will delete their account immediately. If you believe a minor is using our service, please contact us.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have questions about this policy, want to exercise your privacy rights, or need to report a concern, please contact us at:
          </p>
          <p className="font-medium text-stone-700">privacy@starcross.app</p>
          <p>
            We will do our best to respond within 30 days.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this policy from time to time. If we make material changes we will notify you by email or by displaying a notice in the app before the changes take effect. The &quot;Last updated&quot; date at the top of this page always reflects the most recent version.
          </p>
        </Section>
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
