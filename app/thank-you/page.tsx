import { CheckCircle } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-[#16a34a]" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Your request has been submitted!</h1>
        <p className="text-[#6b7280] leading-relaxed">
          Local contractors will be in touch within a few hours. You can close this page.
        </p>
      </div>
    </div>
  )
}
