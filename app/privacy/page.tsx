export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Privacy Policy</h1>
          <p className="text-[#6b7280] text-sm mb-10">Last updated: March 21, 2026</p>

          <div className="space-y-8 text-[#374151] text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">1. Who We Are</h2>
              <p>JobDeck ("we", "us", "our") is an Ontario-based online marketplace that connects homeowners with local contractors. Our website is jobdeck.ca.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">2. Information We Collect</h2>
              <p className="mb-3"><strong>From homeowners:</strong> When you submit a job request, we collect your name, phone number, email address (optional), postal code, trade type, job description, and timeline preference.</p>
              <p><strong>From contractors:</strong> When you create an account, we collect your name, phone number, email address, trade type, and service area. We also collect billing information through our payment processor, Stripe, though we do not store your payment card details directly.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To match homeowner job requests with relevant local contractors</li>
                <li>To deliver job lead notifications to contractors via SMS</li>
                <li>To manage contractor accounts and subscriptions</li>
                <li>To communicate with you about your account or job request</li>
                <li>To improve our platform and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">4. How We Share Your Information</h2>
              <p className="mb-3">When a homeowner submits a job request, their contact information (name, phone number, email) is shared with matched contractors so they can reach out directly.</p>
              <p className="mb-3">We do not sell your personal information to third parties.</p>
              <p>We share data with the following service providers who help us operate the platform:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Supabase</strong> — database and authentication</li>
                <li><strong>Twilio</strong> — SMS delivery</li>
                <li><strong>Stripe</strong> — payment processing</li>
                <li><strong>Vercel</strong> — website hosting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">5. CASL Compliance</h2>
              <p>By submitting a job request on JobDeck, homeowners expressly consent to being contacted by matched contractors regarding their project. Contractors are independent businesses and are responsible for their own CASL compliance when following up with homeowners.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">6. Data Retention</h2>
              <p>We retain homeowner lead data for up to 12 months. Contractor account data is retained for the duration of the subscription and up to 12 months after cancellation. You may request deletion of your data at any time by contacting us.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">7. Your Rights (PIPEDA)</h2>
              <p>Under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA), you have the right to access, correct, or request deletion of your personal information. To exercise these rights, contact us at the email below.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">8. Security</h2>
              <p>We use industry-standard security practices including encrypted connections (HTTPS), secure database storage, and access controls to protect your information.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy or your personal data, contact us at <a href="mailto:jonathan@naiadigital.org" className="text-[#2563eb] hover:underline">jonathan@naiadigital.org</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
