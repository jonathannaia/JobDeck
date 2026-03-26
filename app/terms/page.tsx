export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Terms of Service</h1>
          <p className="text-[#6b7280] text-sm mb-10">Last updated: March 25, 2026</p>

          <div className="space-y-8 text-[#374151] text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">1. Overview</h2>
              <p>JobDeck provides access to aggregated and organized information derived from publicly available building permit records in various municipalities, including within Ontario, Canada.</p>
              <p className="mt-2">By accessing or using JobDeck, you agree to these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">2. Nature of Service</h2>
              <p className="mb-2 font-medium text-[#0f172a]">JobDeck does NOT:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Issue building permits</li>
                <li>Approve construction projects</li>
                <li>Represent any municipal, provincial, or government authority</li>
              </ul>
              <p className="mb-2 font-medium text-[#0f172a]">JobDeck provides:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Publicly sourced data related to building permits</li>
                <li>Property addresses and general project information</li>
                <li>Tools for organizing and accessing this data</li>
              </ul>
              <p>All information is provided for <strong>informational and business prospecting purposes only</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">3. No Government Affiliation</h2>
              <p>JobDeck is an independent platform and is <strong>not affiliated with or endorsed by</strong> any municipality, including the City of Toronto, or the Province of Ontario.</p>
              <p className="mt-2">Users must obtain all permits directly from the appropriate municipal authority.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">4. Data Accuracy</h2>
              <p className="mb-2">JobDeck makes reasonable efforts to ensure data accuracy, but:</p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Data is sourced from third-party public records</li>
                <li>Information may be incomplete, delayed, or outdated</li>
                <li>JobDeck does not guarantee accuracy, completeness, or timeliness</li>
              </ul>
              <p>Use of the data is at your own risk.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">5. Permitted Use</h2>
              <p className="mb-2">Users may use JobDeck data for:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Market research</li>
                <li>Business prospecting</li>
                <li>Identifying potential renovation or construction opportunities</li>
              </ul>
              <p className="mb-2">Users agree NOT to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Misrepresent themselves as government officials</li>
                <li>Claim affiliation with any municipality</li>
                <li>Use the data for unlawful purposes</li>
                <li>Violate any applicable privacy, marketing, or solicitation laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">6. No Guarantee of Results</h2>
              <p className="mb-2">JobDeck does not guarantee:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Sales or contracts</li>
                <li>Business outcomes of any kind</li>
              </ul>
              <p className="mt-2">Results depend entirely on how the user applies the information.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">7. Payments &amp; Refunds</h2>
              <p className="mb-2">JobDeck may offer one-time purchases (e.g., data batches). Payments are processed securely through Stripe.</p>
              <p>Refund guarantees, if offered, apply only under the specific terms presented at the time of purchase and are issued at JobDeck&apos;s sole discretion.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">8. Limitation of Liability</h2>
              <p className="mb-2">To the fullest extent permitted by law, JobDeck shall not be liable for:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Any business losses or missed opportunities</li>
                <li>Misuse of data by users</li>
                <li>Legal issues arising from how users conduct outreach or business activities</li>
              </ul>
              <p className="mt-2">Users assume full responsibility for their actions.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">9. Compliance with Laws</h2>
              <p>Users are responsible for complying with all applicable laws, including local solicitation laws, marketing and advertising regulations, and privacy and data use laws in Canada and Ontario.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">10. Changes to Terms</h2>
              <p>JobDeck may update these Terms at any time. Continued use of the platform constitutes acceptance of any changes.</p>
            </section>

            <hr className="border-[#e2e8f0]" />

            <section>
              <h2 className="text-xl font-bold text-[#0f172a] mb-4">Disclaimer</h2>
              <p className="mb-3">JobDeck is a data aggregation platform that provides access to publicly available building permit information.</p>
              <p className="mb-2 font-medium text-[#0f172a]">We do NOT:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Sell building permits</li>
                <li>Provide construction approvals</li>
                <li>Act on behalf of any government authority</li>
              </ul>
              <p className="mb-3">All permit-related decisions, approvals, and legal requirements are handled exclusively by the appropriate municipal authorities.</p>
              <p className="mb-3">The information provided by JobDeck is intended solely for informational and business prospecting purposes.</p>
              <p className="mb-2">Users are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Verifying information independently</li>
                <li>Conducting outreach in a lawful manner</li>
                <li>Ensuring compliance with all applicable regulations</li>
              </ul>
              <p className="mb-2">JobDeck makes no guarantees regarding data accuracy, business results, or the suitability of any opportunity. Use of this platform is at your own risk.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#0f172a] mb-3">Contact</h2>
              <p>Questions about these Terms? Contact us at <a href="mailto:jonathan@naiadigital.org" className="text-[#143A75] hover:underline">jonathan@naiadigital.org</a>.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
