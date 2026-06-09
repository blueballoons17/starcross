import Link from "next/link";
import { LegalHeader, LegalFooter } from "@/components/ui/legal-page-layout";

export const metadata = {
  title: "Cookie Policy | Kindred Stars",
  description: "How Kindred Stars uses cookies and similar technologies.",
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

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Legal</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">Cookie Policy</h1>
          <p className="text-stone-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. What Are Cookies?">
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently and to provide information to the site owner.
          </p>
        </Section>

        <Section title="2. How Kindred Stars Uses Cookies">
          <p>
            Kindred Stars uses a minimal set of cookies, all strictly necessary for the service to function. We do not use advertising cookies, tracking pixels, or third-party analytics cookies.
          </p>

          <div className="overflow-hidden rounded-xl border border-stone-200 mt-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Cookie</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Purpose</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="px-4 py-3 font-mono text-stone-600">next-auth.session-token</td>
                  <td className="px-4 py-3 text-stone-500">Keeps you logged in between visits</td>
                  <td className="px-4 py-3 text-stone-500">Essential</td>
                  <td className="px-4 py-3 text-stone-500">30 days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-stone-600">next-auth.csrf-token</td>
                  <td className="px-4 py-3 text-stone-500">Prevents cross-site request forgery attacks</td>
                  <td className="px-4 py-3 text-stone-500">Essential</td>
                  <td className="px-4 py-3 text-stone-500">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-stone-600">next-auth.callback-url</td>
                  <td className="px-4 py-3 text-stone-500">Redirects you to the correct page after login</td>
                  <td className="px-4 py-3 text-stone-500">Essential</td>
                  <td className="px-4 py-3 text-stone-500">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="3. What We Don't Use">
          <p>Kindred Stars does <strong className="text-stone-700">not</strong> use:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Advertising or retargeting cookies</li>
            <li>Third-party analytics cookies (e.g. Google Analytics)</li>
            <li>Social media tracking pixels</li>
            <li>Cross-site tracking technologies</li>
          </ul>
          <p>
            Our infrastructure providers may set their own technical cookies for load balancing and security purposes. These are strictly functional and do not track your browsing across other sites.
          </p>
        </Section>

        <Section title="4. Managing Cookies">
          <p>
            Because the cookies we set are strictly necessary for you to be logged in and use the service, disabling them through your browser will prevent Kindred Stars from working correctly.
          </p>
          <p>
            You can manage or delete cookies through your browser settings. Here are instructions for common browsers:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-stone-700">Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
            <li><strong className="text-stone-700">Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong className="text-stone-700">Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong className="text-stone-700">Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
          </ul>
          <p>
            Logging out of Kindred Stars will clear your session cookie. Deleting your account removes all data we hold about you in accordance with our <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="5. Changes to This Policy">
          <p>
            If we introduce new cookies (for example, if we add analytics tools in future), we will update this page and, where required by law, ask for your consent before setting non-essential cookies.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>Questions about our use of cookies? Contact us at:</p>
          <p className="text-sm font-medium text-stone-700">
            <a href="mailto:hello.kindredstars@gmail.com" className="underline">hello.kindredstars@gmail.com</a>
          </p>
        </Section>
      </main>

      <LegalFooter />
    </div>
  );
}
