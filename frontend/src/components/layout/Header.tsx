'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BellSimple, List, MagnifyingGlass, X } from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { useAuth } from '@/features/auth/auth-context'
import { useLiveTicker } from '@/lib/binance/hooks'
import { formatPrice } from '@/lib/format'
import ChangeTag from '@/components/common/ChangeTag'

interface HeaderProps {
  active?: string
  notifCount?: number
}

const NAV_ITEMS = [
  { label: 'Dashboard', route: ROUTES.dashboard },
  { label: 'Markets', route: ROUTES.markets },
  { label: 'Competitions', route: ROUTES.competitions },
  { label: 'Leaderboard', route: ROUTES.leaderboard },
  { label: 'Wallet', route: ROUTES.wallet },
]

/** Opens the command palette by replaying its shortcut, so entry points stay in one place. */
function openPalette() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
}

function BtcChip() {
  const { ticker } = useLiveTicker('BTC')

  if (!ticker) {
    return <span className="skeleton hidden h-7 w-40 xl:block" />
  }

  return (
    <div className="hidden items-center gap-2.5 rounded-control border border-line bg-surface px-3 py-1.5 xl:flex">
      <span className="text-[11px] font-semibold tracking-wide text-ink-2">BTC</span>
      <span className="num text-[12px] text-ink">{formatPrice(ticker.price)}</span>
      <ChangeTag value={ticker.changePct} size="sm" caret={false} />
    </div>
  )
}

export default function Header({ active, notifCount = 0 }: HeaderProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const current = active ?? pathname ?? ''

  const isActive = (route: string) =>
    route === ROUTES.dashboard ? current === route : current.startsWith(route)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 lg:px-6">
        <Link href={ROUTES.landing} className="shrink-0" aria-label="COINX home">
          <Image
            src="/coinx-logo-long.png"
            alt="COINX"
            width={104}
            height={19}
            preload
            style={{ width: 104, height: 'auto' }}
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const selected = isActive(item.route)
            return (
              <Link
                key={item.label}
                href={item.route}
                aria-current={selected ? 'page' : undefined}
                className="rounded-control px-3 py-2 text-[13px] font-medium transition-colors"
                style={{
                  color: selected ? 'var(--color-accent)' : 'var(--color-ink-2)',
                  backgroundColor: selected ? 'rgba(95, 168, 255, 0.1)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <BtcChip />

          <button
            type="button"
            onClick={openPalette}
            className="hidden items-center gap-2 rounded-control border border-line-strong px-2.5 py-2 text-[12px] text-ink-3 transition-colors hover:border-accent hover:text-accent md:flex"
            aria-label="Search markets and pages"
          >
            <MagnifyingGlass size={13} aria-hidden />
            <span className="hidden xl:inline">Search</span>
            <kbd className="num rounded border border-line px-1 text-[10px] text-ink-3">
              Ctrl K
            </kbd>
          </button>

          <Link
            href={ROUTES.notifications}
            aria-label={
              notifCount > 0 ? `Notifications, ${notifCount} unread` : 'Notifications'
            }
            className="relative flex size-9 items-center justify-center rounded-control border border-line-strong text-ink-2 transition-colors hover:border-accent hover:text-accent"
          >
            <BellSimple size={16} aria-hidden />
            {notifCount > 0 && (
              <span
                className="num absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-pill text-[9px] font-bold text-white"
                style={{ backgroundColor: 'var(--color-short)' }}
              >
                {notifCount}
              </span>
            )}
          </Link>

          <Link
            href={ROUTES.profile}
            aria-label="Your profile"
            className="flex size-9 items-center justify-center rounded-control text-[13px] font-bold text-white"
            style={{ backgroundColor: 'var(--color-accent-deep)' }}
          >
            {user.initial}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            className="flex size-9 items-center justify-center rounded-control border border-line-strong text-ink-2 lg:hidden"
          >
            {menuOpen ? <X size={16} aria-hidden /> : <List size={16} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Primary mobile"
          className="border-t border-line bg-surface px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const selected = isActive(item.route)
              return (
                <li key={item.label}>
                  <Link
                    href={item.route}
                    onClick={() => setMenuOpen(false)}
                    aria-current={selected ? 'page' : undefined}
                    className="block rounded-control px-3 py-2.5 text-sm font-medium"
                    style={{ color: selected ? 'var(--color-accent)' : 'var(--color-ink-2)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              openPalette()
            }}
            className="btn btn-ghost mt-2 w-full py-2.5"
          >
            <MagnifyingGlass size={13} aria-hidden />
            Search markets
          </button>
        </nav>
      )}
    </header>
  )
}
