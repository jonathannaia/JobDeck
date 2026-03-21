import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobDeck — Find Local Contractors in Ontario',
  description:
    'Post your home improvement job for free and get matched with trusted local contractors across Ontario.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#0f1f3d] text-white antialiased`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} JobDeck. All rights reserved. Ontario, Canada.</p>
        </footer>
      </body>
    </html>
  )
}
