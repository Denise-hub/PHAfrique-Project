import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Public Health Corps Africa',
  description: 'How Public Health Corps Africa collects, uses, and protects your personal data when you use our website and services.',
}

const LAST_UPDATED = 'January 2026'

export default function PrivacyPage() {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-to-b from-primary-50/50 to-white dark:from-primary-950/30 dark:to-neutral-950">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="heading-1 mb-6">Privacy Policy</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl space-y-10 text-neutral-700 dark:text-neutral-300">
            <div>
              <h2 className="heading-3 mb-3">1. Who We Are</h2>
              <p className="leading-relaxed">
                Public Health Corps Africa (“PHAfrica”, “we”, “us”, “our”) advances public health in Africa through innovative programs, community resilience, and partnerships. We operate the website at our domains and related services. When you use our site or get in touch, we may process your personal data as described in this policy.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">2. What Data We Collect</h2>
              <p className="leading-relaxed mb-3">We may collect the following:</p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li><strong>Contact form:</strong> When you use our Contact form, we receive your name, email address, and message. We may also receive your phone number and the topic of your inquiry (e.g. partnership, volunteering, internship, donation) if you provide them.</li>
                <li><strong>Opportunity applications:</strong> When you apply for an internship or volunteering opportunity via our site, we collect your name, email address, and any phone number, message, or résumé/CV link you submit.</li>
                <li><strong>Automatically collected data:</strong> Our hosting and any analytics we use may collect IP address, browser type, device information, and general usage data (e.g. pages visited). We may use cookies or similar technologies for site functionality (e.g. theme preference) and, if we use them, for analytics.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-3">3. How We Use Your Data</h2>
              <p className="leading-relaxed mb-3">We use your data to:</p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Respond to your contact enquiries and process your requests.</li>
                <li>Review and process internship and volunteer applications, and communicate with you about opportunities.</li>
                <li>Improve our website and services.</li>
                <li>Comply with legal obligations and protect our rights.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-3">4. Cookies and Similar Technologies</h2>
              <p className="leading-relaxed">
                We may use cookies and similar technologies for site functionality (for example, to remember your theme preference) and, where we use analytics, to understand how the site is used. You can control cookies through your browser settings. Disabling some cookies may affect certain features of the site.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">5. Storage, Security, and Retention</h2>
              <p className="leading-relaxed">
                We store your data on secure servers and take reasonable steps to protect it from unauthorised access, loss, or misuse. We retain contact and application data for as long as necessary to fulfil the purposes above, to resolve disputes, and to comply with legal obligations. When we no longer need it, we delete or anonymise it where feasible.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">6. Third Parties</h2>
              <p className="leading-relaxed">
                We may use third-party services for hosting, email delivery, and analytics. These providers may process your data on our behalf and in line with our instructions. We do not sell your personal data. We may disclose data if required by law or to protect our rights, safety, or property.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">7. Your Rights</h2>
              <p className="leading-relaxed mb-3">Depending on where you are, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data, subject to legal or operational needs.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Withdraw consent where we rely on it.</li>
                <li>Lodge a complaint with a supervisory authority.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                To exercise these rights, or if you have questions about our use of your data, please contact us using the details below.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">8. Contact for Privacy</h2>
              <p className="leading-relaxed">
                For any privacy-related questions or requests, please contact us at{' '}
                <a href="mailto:info@phafrique.com" className="text-primary-600 dark:text-primary-400 hover:underline">info@phafrique.com</a>
                {' '}or through our <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">Contact</Link> page.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">9. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will post the revised policy on this page and update the “Last updated” date. We encourage you to review it periodically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
