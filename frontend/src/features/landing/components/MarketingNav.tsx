'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { List, X } from '@phosphor-icons/react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { ROUTES } from '@/config/app'

const LINKS = [
  { label: 'Competitions', href: '#competitions' },
  { label: 'How ranking works', href: '#ranking' },
  { label: 'Markets', href: ROUTES.markets },
  { label: 'Leaderboard', href: ROUTES.leaderboard },
]

export default function MarketingNav() {
  const [open, setOpen] = useState(false)
  const [lifted, setLifted] = useState(false)
  const { scrollY } = useScroll()

  // Reads through Motion's scroll value rather than window.addEventListener('scroll').
  // (skill.md 5.D bans raw scroll listeners.) The state only flips at one threshold,
  // so this never re-renders per frame.
  useMotionValueEvent(scrollY, 'change', (value) => {
    const next = value > 12
    setLifted((prev) => (prev === next ? prev : next))
  })

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
      style={{
        backgroundColor: lifted ? 'rgba(8, 9, 11, 0.86)' : 'transparent',
        backdropFilter: lifted ? 'blur(18px)' : undefined,
        borderBottom: `1px solid ${lifted ? 'var(--color-line)' : 'transparent'}`,
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-6">
        <Link href={ROUTES.landing} aria-label="COINX home" className="shrink-0">
          <Image
            src="/coinx-logo-long.png"
            alt="COINX"
            width={110}
            height={20}
            preload
            style={{ width: 110, height: 'auto' }}
          />
        </Link>

        <nav aria-label="Marketing" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium text-ink-2 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link href={ROUTES.login} className="btn btn-ghost hidden px-3.5 py-2 sm:inline-flex">
            Sign in
          </Link>
          {/* One label per intent: "Create account" is used for every signup CTA below. */}
          <Link href={ROUTES.register} className="btn btn-primary px-4 py-2">
            Create account
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex size-9 items-center justify-center rounded-control border border-line-strong text-ink-2 lg:hidden"
          >
            {open ? <X size={16} aria-hidden /> : <List size={16} aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Marketing mobile" className="border-t border-line bg-void px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-control px-3 py-2.5 text-sm text-ink-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={ROUTES.login}
                onClick={() => setOpen(false)}
                className="block rounded-control px-3 py-2.5 text-sm text-ink-2"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
