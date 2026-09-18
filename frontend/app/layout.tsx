import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/features/auth/auth-context'
import CommandPalette from '@/components/common/CommandPalette'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const TAGLINE = 'Trade. Compete. Win.'

export const metadata: Metadata = {
  metadataBase: new URL('https://coinx.com'),
  title: {
    default: `COINX: ${TAGLINE}`,
    template: '%s | COINX',
  },
  description:
    'COINX runs timed crypto trading competitions on live market data. Everyone starts with the same capital, the leaderboard settles by percent return, and the prize pool pays out on the spot.',
  keywords: ['crypto', 'trading', 'competition', 'COINX', 'futures', 'leaderboard'],
  applicationName: 'COINX',
  openGraph: {
    type: 'website',
    url: 'https://coinx.com',
    siteName: 'COINX',
    title: `COINX: ${TAGLINE}`,
    description:
      'Timed crypto trading competitions on live market data. Same starting capital for everyone, ranked by percent return.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `COINX: ${TAGLINE}`,
    description:
      'Timed crypto trading competitions on live market data. Same starting capital, ranked by percent return.',
  },
}

export const viewport: Viewport = {
  themeColor: '#08090b',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <CommandPalette />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
