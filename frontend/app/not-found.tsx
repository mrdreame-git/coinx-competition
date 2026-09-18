import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { ROUTES } from '@/config/app'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you requested does not exist on COINX.',
}

const LINKS = [
  { label: 'Markets', href: ROUTES.markets },
  { label: 'Competitions', href: ROUTES.competitions },
  { label: 'Leaderboard', href: ROUTES.leaderboard },
  { label: 'Dashboard', href: ROUTES.dashboard },
]

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-void px-6">
      <div className="w-full max-w-lg">
        <p className="label">Error 404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          That page is not on the book.
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-2">
          The address may have changed, or the round it pointed at has already settled. Pick a
          destination below, or jump anywhere with the command palette.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="btn btn-ghost px-3.5 py-2">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <Link href={ROUTES.landing} className="btn btn-primary px-4 py-2.5">
            <ArrowLeft size={13} aria-hidden />
            Back to the landing page
          </Link>
          <span className="flex items-center gap-2 text-[12px] text-ink-3">
            <MagnifyingGlass size={13} aria-hidden />
            Or press Ctrl K to search
          </span>
        </div>
      </div>
    </main>
  )
}
