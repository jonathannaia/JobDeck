export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Terms of Service</h1>
          <p className="text-[#6b7280] text-sm mb-10">Last updated: March 21, 2026</p>

          <div className="space-y-8 text-[#374151] text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">1. About JobDeck</h2>
              <p>JobDeck is an online marketplace that connects Ontario homeowners with local contractors. We provide a platform for lead generation only. We are not a contracting company, and we do not perform, supervise, or guarantee any contractor work.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">2. Marketplace — Not a Contractor</h2>
              <p className="mb-3">JobDeck is a marketplace platform. We do not vet, verify, license, insure, or endorse any contractor. All contractors are independent businesses operating independently of JobDeck.</p>
              <p>Homeowners are solely responsible for verifying a contractor's credentials, insurance, licensing, and suitability before hiring. JobDeck is not liable for the quality, safety, or outcome of any work performed by a contractor found through our platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">3. For Homeowners</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Submitting a job request is free and requires no account</li>
                <li>By submitting a request, you consent to being contacted by matched contractors regarding your project</li>
                <li>You agree to provide accurate information in your job request</li>
                <li>JobDeck is not responsible for any contractor you choose to hire</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">4. For Contractors</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Contractor subscriptions are billed monthly and can be cancelled at any time</li>
                <li>Leads are delivered on a best-effort basis. JobDeck does not guarantee a minimum number of leads</li>
                <li>Starter plan contractors receive up to 15 leads per calendar month. Pro plan contractors receive unlimited leads</li>
                <li>Lead credits reset on the 1st of each month for Starter plans</li>
                <li>You must not misuse lead information — homeowner contact details are provided solely for the purpose of responding to their job request</li>
                <li>You are responsible for your own CASL compliance when contacting homeowners</li>
                <li>JobDeck reserves the right to suspend or terminate accounts that misuse the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">5. Payments and Refunds</h2>
              <p className="mb-3">Contractor subscriptions are processed through Stripe. By subscribing, you authorize recurring monthly charges to your payment method.</p>
              <p>All payments are non-refundable except where required by law. If you cancel your subscription, you will retain access until the end of your current billing period.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">6. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, JobDeck shall not be liable for any indirect, incidental, special, or consequential damages arising from use of the platform, including but not limited to damages arising from contractor work quality, missed leads, or service interruptions.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">7. Governing Law</h2>
              <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">8. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. Continued use of JobDeck after changes constitutes acceptance of the updated Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">9. Contact</h2>
              <p>Questions about these Terms? Contact us at <a href="mailto:hello@jobdeck.ca" className="text-[#2563eb] hover:underline">hello@jobdeck.ca</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
