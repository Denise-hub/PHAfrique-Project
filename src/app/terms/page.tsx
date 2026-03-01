import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Public Health Corps Africa',
  description: 'Terms of use for the Public Health Corps Africa website and related services.',
}

const LAST_UPDATED = 'January 2026'

export default function TermsPage() {
  return (
    <div className="pt-20">
      <section className="section-padding bg-gradient-to-b from-primary-50/50 to-white dark:from-primary-950/30 dark:to-neutral-950">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="heading-1 mb-6">Terms & Conditions</h1>
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
              <h2 className="heading-3 mb-3">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the Public Health Corps Africa (“PHAfrica”, “we”, “us”, “our”) website and related services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our site.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">2. Permitted Use</h2>
              <p className="leading-relaxed">
                You may use this website only for lawful purposes and in line with these terms. You may not use it to transmit harmful, offensive, or illegal content; to attempt to gain unauthorised access to our systems or data; or to interfere with the proper functioning of the site or the use by others.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">3. Intellectual Property</h2>
              <p className="leading-relaxed">
                The content on this site, including text, images, logos, and the name “Public Health Corps Africa” and related marks, is owned by or licensed to PHAfrica. You may not copy, modify, distribute, or use our content for commercial purposes without our prior written consent. You may share links to our pages for personal or non-commercial use.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">4. Contact Form and Opportunity Applications</h2>
              <p className="leading-relaxed mb-3">When you submit our Contact form or an application for an internship or volunteering opportunity, you agree that:</p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>You provide accurate, complete, and up-to-date information.</li>
                <li>We may use and store your submissions to respond to you, process applications, and as described in our <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>.</li>
                <li>Submission does not create an obligation on us to respond within any particular time or to offer any specific opportunity.</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-3">5. Disclaimers</h2>
              <p className="leading-relaxed">
                The information on this website is for general purposes only and does not constitute professional, medical, or legal advice. Program and opportunity details (including deadlines, requirements, and availability) may change. We do not guarantee that the site will be uninterrupted, error-free, or free of harmful components.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">6. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the fullest extent permitted by law, PHAfrica and its representatives shall not be liable for any direct, indirect, incidental, consequential, or other losses arising from your use of or inability to use this website, or from any content, actions, or omissions of third parties. This does not exclude or limit liability where it cannot be excluded or limited by law.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">7. Third-Party Links</h2>
              <p className="leading-relaxed">
                Our site may link to third-party websites (e.g. social media, partners, or resources). We are not responsible for their content, privacy practices, or terms. Your use of third-party sites is at your own risk.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">8. Changes to the Terms</h2>
              <p className="leading-relaxed">
                We may update these Terms & Conditions from time to time. We will post the revised terms on this page and update the “Last updated” date. Your continued use of the site after changes constitutes acceptance of the updated terms. We encourage you to review them periodically.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">9. Governing Law and Jurisdiction</h2>
              <p className="leading-relaxed">
                These terms are governed by the laws of South Africa. Any dispute arising in connection with them or the use of this website shall be subject to the exclusive jurisdiction of the courts of South Africa, to the extent permitted by law.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-3">10. Contact</h2>
              <p className="leading-relaxed">
                For questions about these Terms & Conditions, please contact us at{' '}
                <a href="mailto:info@phafrique.com" className="text-primary-600 dark:text-primary-400 hover:underline">info@phafrique.com</a>
                {' '}or through our <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">Contact</Link> page.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
