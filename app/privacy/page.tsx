export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Privacy Policy</h1>
          <p className="text-[#6b7280] text-sm mb-10">Last updated: March 28, 2026</p>

          <div className="space-y-8 text-[#374151] text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">1. Who We Are</h2>
              <p>JobDeck (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an Ontario-based online marketplace that connects homeowners with local contractors. Our website is jobdeck.ca. Questions about this policy can be directed to <a href="mailto:jonathan@naiadigital.org" className="text-[#143A75] hover:underline">jonathan@naiadigital.org</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">2. Information We Collect</h2>
              <p className="mb-2"><strong className="text-[#0f172a]">From homeowners:</strong> When you submit a job request, we collect your name, phone number, email address, city, postal code, trade type, job description, estimated budget, timeline preference, and any photos you choose to upload.</p>
              <p><strong className="text-[#0f172a]">From contractors:</strong> When you create an account or claim a lead, we collect your name, email address, and payment information. Payment card details are processed securely by Stripe — we do not store them.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">3. How We Use Your Information</h2>
              <p className="mb-2"><strong className="text-[#0f172a]">Homeowner information is used to:</strong></p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Match your job posting with relevant local contractors by trade and city</li>
                <li>Notify matched contractors that a job is available (trade, city, and job description only — your name and contact details are not shared at this stage)</li>
                <li>Reveal your full contact information only to contractors who have paid to claim your specific lead</li>
              </ul>
              <p className="mb-2"><strong className="text-[#0f172a]">Contractor information is used to:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create and manage your account</li>
                <li>Process payments for claimed leads via Stripe</li>
                <li>Send you notifications about new leads in your area</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">4. How We Share Your Information</h2>
              <p className="mb-3">We do not sell your personal information to third parties.</p>
              <p className="mb-3">When a contractor pays to claim your lead, your name, phone number, email address, postal code, and full job description are disclosed to that contractor only. By submitting a job request on JobDeck, you consent to this disclosure.</p>
              <p className="mb-2">We use the following third-party service providers:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Supabase</strong> — database and file storage</li>
                <li><strong>Stripe</strong> — payment processing</li>
                <li><strong>Twilio</strong> — SMS notifications to contractors</li>
                <li><strong>Google Analytics</strong> — anonymous usage analytics</li>
                <li><strong>Vercel</strong> — website hosting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">5. CASL Compliance</h2>
              <p>By submitting a job request on JobDeck, homeowners expressly consent to being contacted by matched contractors regarding their project. Contractors are independent businesses and are solely responsible for their own compliance with CASL and any other applicable marketing and solicitation laws when contacting homeowners.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">6. Data Retention</h2>
              <p>Homeowner job postings and associated contact information are retained for up to 12 months after submission. Contractor account data is retained for the duration of the account and up to 12 months after it is closed. You may request deletion of your data at any time by contacting us.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">7. Your Rights (PIPEDA)</h2>
              <p>Under Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA), you have the right to access, correct, or request deletion of your personal information. To exercise these rights, email <a href="mailto:jonathan@naiadigital.org" className="text-[#143A75] hover:underline">jonathan@naiadigital.org</a> and we will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">8. Security</h2>
              <p>We use industry-standard security practices including encrypted connections (HTTPS), secure database storage, and access controls to protect your information.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">9. Cookies</h2>
              <p>We use cookies for authentication (to keep you logged in) and anonymous analytics. We do not use advertising or tracking cookies. Disabling cookies in your browser will prevent authentication from working.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">10. Changes to This Policy</h2>
              <p>We may update this policy from time to time. The &ldquo;last updated&rdquo; date at the top reflects any changes. Continued use of JobDeck after a change constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">Contact</h2>
              <p>Questions about this Privacy Policy? Email us at <a href="mailto:jonathan@naiadigital.org" className="text-[#143A75] hover:underline">jonathan@naiadigital.org</a>.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
