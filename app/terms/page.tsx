import Link from 'next/link';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last Updated: March 14, 2026</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to LetsSpeak. By accessing or using our AI-powered language learning platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms constitute a legally binding agreement between you and LetsSpeak regarding your use of our website, mobile applications, and related services (collectively, the "Service").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                LetsSpeak provides an AI-powered language learning platform that offers:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Personalized 15-day speaking practice programs</li>
                <li>Audio recording and transcription capabilities</li>
                <li>AI-powered feedback on pronunciation, grammar, and fluency</li>
                <li>Progress tracking and analytics</li>
                <li>Support for 10 languages (English, Spanish, German, Russian, Chinese, Japanese, French, Italian, Portuguese, Korean)</li>
                <li>Cloud synchronization across devices</li>
                <li>CV-based personalized learning milestone generation</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Our Service requires users to provide their own AI API keys for personalized feedback functionality. We act as a facilitator and do not provide the AI services directly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.1 Account Creation:</strong> To use LetsSpeak, you must create an account using Google or GitHub OAuth authentication. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.2 Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.3 Account Security:</strong> You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized access or security breach.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>3.4 Age Requirement:</strong> You must be at least 13 years old to use LetsSpeak. Users under 18 should have parental consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content and Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>4.1 Your Content:</strong> You retain ownership of all content you submit to LetsSpeak, including audio recordings, CV documents, and personal information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>4.2 License Grant:</strong> By uploading content, you grant LetsSpeak a non-exclusive, worldwide license to use, store, and process your content solely for providing and improving the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>4.3 Audio Recordings:</strong> Audio recordings are stored in our cloud infrastructure for your access and review. You may delete your recordings at any time.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>4.4 CV Documents:</strong> CV text extraction is used only to generate personalized learning milestones. We do not share your CV information with third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. AI Services and API Keys</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>5.1 Default AI Service:</strong> LetsSpeak uses Ollama (local AI) by default for all AI feedback features at no cost to you. This service is free, private, and already configured.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>5.2 Optional Cloud AI Keys:</strong> As a future enhancement, you may optionally provide your own third-party AI API keys (e.g., OpenAI, Anthropic) to use alternative AI services. You are responsible for obtaining, securing, and managing these keys.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>5.3 API Costs:</strong> If you choose to use your own API keys, any costs associated with third-party API usage are your responsibility. LetsSpeak does not charge for API usage but facilitates the connection.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>5.4 Third-Party Terms:</strong> Your use of third-party AI services (if you choose to provide your own keys) is subject to their respective terms of service and privacy policies.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>5.5 No Liability:</strong> LetsSpeak is not responsible for the quality, accuracy, or availability of third-party AI services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Use the Service for any commercial purpose without authorization</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share your account credentials with others</li>
                <li>Create multiple accounts to circumvent restrictions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Subscription and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>7.1 Free Access:</strong> LetsSpeak currently offers free access to its core features. We reserve the right to introduce paid subscription plans in the future.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>7.2 Future Pricing:</strong> If subscription pricing is introduced, existing users will receive advance notice and the option to continue or cancel their accounts.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>7.3 Refunds:</strong> Any refund policies will be clearly stated at the time paid services are introduced.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>8.1 Our Property:</strong> All content, features, and functionality of LetsSpeak (including but not limited to text, graphics, logos, software, and design) are owned by LetsSpeak and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>8.2 Limited License:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>8.3 Restrictions:</strong> You may not copy, modify, distribute, sell, or reverse engineer any part of our Service without explicit permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Our collection, use, and disclosure of personal information is governed by our <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We use MongoDB for data storage and implement industry-standard security measures to protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                LetsSpeak does not warrant that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>The Service will meet your specific requirements or expectations</li>
                <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                <li>AI feedback will be 100% accurate or guarantee language fluency</li>
                <li>Any defects will be corrected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LETSSPEAK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our total liability shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or $100, whichever is greater.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>12.1 By You:</strong> You may terminate your account at any time by contacting us or using account deletion features.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>12.2 By Us:</strong> We reserve the right to suspend or terminate your account if you violate these Terms or engage in prohibited activities.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>12.3 Effect of Termination:</strong> Upon termination, your right to use the Service will immediately cease. We may retain certain data as required by law or legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of LetsSpeak after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: legal@letsspeak.com</p>
                <p className="text-gray-700">Website: www.letsspeak.com</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
            Privacy Policy
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
