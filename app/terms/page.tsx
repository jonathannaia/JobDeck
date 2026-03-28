export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Terms of Service</h1>
          <p className="text-[#6b7280] text-sm mb-10">Last updated: March 28, 2026</p>

          <div className="space-y-8 text-[#374151] text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">1. Overview</h2>
              <p>JobDeck (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates jobdeck.ca, an online marketplace that connects homeowners in Ontario with local contractors. By using JobDeck, you agree to these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">2. Nature of Service</h2>
              <p className="mb-3">JobDeck is a lead generation marketplace. Homeowners post job requests, and contractors pay to access the homeowner&apos;s contact information and job details to provide quotes.</p>
              <p className="mb-2 font-medium text-[#0f172a]">JobDeck does NOT:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Employ, endorse, or vouch for any contractor</li>
                <li>Guarantee that any job will be completed</li>
                <li>Mediate disputes between homeowners and contractors</li>
                <li>Issue or have any affiliation with building permits or government authorities</li>
              </ul>
              <p className="mb-2 font-medium text-[#0f172a]">JobDeck provides:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>A platform for homeowners to post job requests</li>
                <li>Lead matching and delivery to relevant local contractors</li>
                <li>Contact detail access to contractors who claim a lead</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">3. Homeowner Terms</h2>
              <p className="mb-2">By submitting a job request, you:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Consent to your name, phone number, email address, and job details being shared with contractors who pay to claim your lead</li>
                <li>Confirm the information you provide is accurate</li>
                <li>Understand that multiple contractors may contact you, and that JobDeck does not screen or verify contractors</li>
              </ul>
              <p>JobDeck is free for homeowners. We do not charge you to post a job or receive quotes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">4. Contractor Terms</h2>
              <p className="mb-2">By using JobDeck as a contractor, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Pay the applicable fee to unlock a homeowner lead&apos;s contact information</li>
                <li>Use homeowner contact information only to provide a quote or follow up on the specific job posted</li>
                <li>Not resell, share, or use homeowner contact information for any other purpose</li>
                <li>Comply with all applicable laws, including CASL, when contacting homeowners</li>
                <li>Represent yourself and your business honestly</li>
              </ul>
              <p>Contractors are independent businesses. JobDeck is not a party to any agreement between a contractor and homeowner.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">5. Payments &amp; Refunds</h2>
              <p className="mb-3">Payments are processed securely through Stripe. Lead claim fees are charged at the time of purchase and are generally non-refundable once contact information has been revealed.</p>
              <p>If you believe a lead was invalid (e.g., incorrect contact information), contact us at <a href="mailto:jonathan@naiadigital.org" className="text-[#143A75] hover:underline">jonathan@naiadigital.org</a> and we will review your request. Refunds are issued at JobDeck&apos;s sole discretion.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">6. No Guarantee of Results</h2>
              <p>JobDeck does not guarantee that any homeowner lead will result in a sale, contract, or business outcome. Results depend entirely on the contractor&apos;s follow-up, pricing, and service quality.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">7. Limitation of Liability</h2>
              <p className="mb-2">To the fullest extent permitted by law, JobDeck shall not be liable for:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Any disputes between homeowners and contractors</li>
                <li>Business losses or missed opportunities</li>
                <li>Misuse of contact information by contractors</li>
                <li>Legal issues arising from how contractors conduct outreach or business</li>
              </ul>
              <p className="mt-3">Users assume full responsibility for their actions on and off the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">8. Acceptable Use</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Submit false or misleading job requests or contractor profiles</li>
                <li>Harvest or scrape contact information from the platform</li>
                <li>Attempt to circumvent payment for lead access</li>
                <li>Use the platform for any unlawful purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">9. Changes to Terms</h2>
              <p>JobDeck may update these Terms at any time. The &ldquo;last updated&rdquo; date at the top of this page reflects any changes. Continued use of the platform after a change constitutes acceptance of the updated Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">10. Governing Law</h2>
              <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">Contact</h2>
              <p>Questions about these Terms? Email us at <a href="mailto:jonathan@naiadigital.org" className="text-[#143A75] hover:underline">jonathan@naiadigital.org</a>.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
