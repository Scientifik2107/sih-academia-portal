import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AcadBridge – Academia-Industry Collaboration Portal',
    template: '%s | AcadBridge',
  },
  description:
    'Smart India Hackathon platform bridging students, industry, academicians, and institutions through AI-powered skill matching.',
  keywords: ['SIH', 'skill matching', 'academia industry', 'placement', 'FDP', 'pgvector'],
  authors: [{ name: 'AcadBridge Team' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface text-white antialiased">
        {children}
      </body>
    </html>
  )
}
