import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🗣️</span>
            <span className="text-xl font-bold text-gray-900">LetsSpeak</span>
          </Link>
          <Link href="/" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: March 14, 2026</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to LetsSpeak. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered language learning platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using LetsSpeak, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you register for LetsSpeak, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>OAuth Provider Data:</strong> Name, email address, and profile picture from Google or GitHub</li>
                <li><strong>Profile Information:</strong> Native language, target languages, proficiency levels</li>
                <li><strong>Professional Information:</strong> Profession, industry, learning goals</li>
                <li><strong>CV Content:</strong> Text extracted from uploaded CV files (optional)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Learning Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Audio Recordings:</strong> Voice recordings of your speaking practice</li>
                <li><strong>Transcriptions:</strong> Text transcriptions of your audio recordings</li>
                <li><strong>Progress Data:</strong> Confidence scores, completed days, practice history</li>
                <li><strong>Learning Milestones:</strong> AI-generated personalized learning goals</li>
                <li><strong>Feedback History:</strong> AI-generated feedback on your language practice</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Technical Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Log Data:</strong> IP address, access times, error logs</li>
                <li><strong>Cookies:</strong> Authentication tokens and session management data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.4 AI Services and API Keys</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Default AI:</strong> We use Ollama (local AI) by default for all AI feedback features. This service processes data locally and does not require external API keys.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Optional Cloud AI:</strong> If you optionally provide your own third-party AI API keys (e.g., OpenAI, Anthropic), these are encrypted and stored securely in our database. We use these keys solely to facilitate AI feedback features on your behalf.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Service Delivery:</strong> Provide and maintain our language learning platform</li>
                <li><strong>Personalization:</strong> Generate customized learning milestones based on your profile and CV</li>
                <li><strong>AI Feedback:</strong> Process your audio recordings to provide pronunciation and grammar feedback</li>
                <li><strong>Progress Tracking:</strong> Monitor your learning journey and display analytics</li>
                <li><strong>Cloud Sync:</strong> Synchronize your data across multiple devices</li>
                <li><strong>Account Management:</strong> Manage your account and provide customer support</li>
                <li><strong>Service Improvement:</strong> Analyze usage patterns to improve features and user experience</li>
                <li><strong>Communication:</strong> Send important updates, security alerts, and support messages</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Data Storage</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your data is stored using:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>MongoDB Database:</strong> User profiles, learning progress, and settings</li>
                <li><strong>Cloud Storage:</strong> Audio recordings and uploaded CV files</li>
                <li><strong>Encrypted Storage:</strong> API keys are encrypted using industry-standard encryption</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Security Measures</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement various security measures including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>HTTPS/TLS encryption for data transmission</li>
                <li>Secure OAuth 2.0 authentication (Google, GitHub)</li>
                <li>Encrypted storage of sensitive data (API keys)</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Data Retention</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time. Some data may be retained for legal compliance or legitimate business purposes even after account deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Third-Party Services</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We share data with the following third parties:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Authentication Providers:</strong> Google and GitHub for OAuth login</li>
                <li><strong>AI Services:</strong> 
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>• Default: Ollama (local AI) - processes data locally, no external sharing</li>
                    <li>• Optional: Your chosen cloud AI provider (if you provide your own API key) for feedback generation</li>
                  </ul>
                </li>
                <li><strong>Cloud Infrastructure:</strong> Hosting and database providers for service operation</li>
                <li><strong>Analytics Services:</strong> Aggregated, anonymized usage data for platform improvements</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 We Do NOT Sell Your Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                LetsSpeak does not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Legal Obligations</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information if required by law, to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Comply with legal processes or governmental requests</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect the rights, property, or safety of LetsSpeak, our users, or others</li>
                <li>Prevent fraud or security issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Access and Portability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Request a copy of your personal data in a portable format.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Correction</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Update or correct inaccurate personal information through your account settings.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 Deletion</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Request deletion of your account and associated data. Some information may be retained for legal or operational purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.4 Withdrawal of Consent</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Withdraw consent for data processing where consent is the legal basis.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.5 Objection</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Object to processing of your data for certain purposes.
              </p>

              <p className="text-gray-700 leading-relaxed mb-4 mt-6">
                To exercise these rights, contact us at <a href="mailto:privacy@letsspeak.com" className="text-purple-600 hover:text-purple-700 underline">privacy@letsspeak.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Essential Cookies:</strong> Required for authentication and session management</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Understand how you use our platform (anonymized)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                LetsSpeak is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Users between 13 and 18 years old should have parental consent before using our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are a California resident, you have specific rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know whether personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. European Users (GDPR)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are in the European Economic Area (EEA), UK, or Switzerland, you have rights under GDPR:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Rights related to automated decision-making</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our legal basis for processing includes: consent, contractual necessity, legal obligations, and legitimate interests.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Posting the updated policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending email notifications for significant changes</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your continued use of LetsSpeak after changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@letsspeak.com</p>
                <p className="text-gray-700 mb-2"><strong>Data Protection Officer:</strong> dpo@letsspeak.com</p>
                <p className="text-gray-700"><strong>Website:</strong> www.letsspeak.com</p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                We will respond to your inquiry within 30 days.
              </p>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
            Terms of Service
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
