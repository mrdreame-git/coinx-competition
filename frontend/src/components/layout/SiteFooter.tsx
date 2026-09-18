import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/config/app'

const COLUMNS = [
  {
    heading: 'Compete',
    links: [
      { label: 'Open competitions', href: ROUTES.competitions },
      { label: 'Live leaderboard', href: ROUTES.leaderboard },
      { label: 'How ranking works', href: '/#ranking' },
    ],
  },
  {
    heading: 'Trade',
    links: [
      { label: 'Markets', href: ROUTES.markets },
      { label: 'Open an account', href: ROUTES.register },
      { label: 'Wallet', href: ROUTES.wallet },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Support', href: ROUTES.notifications },
      { label: 'Your profile', href: ROUTES.profile },
      { label: 'Sign in', href: ROUTES.login },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto max-w-[1440px] px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Image
              src="/coinx-logo-long.png"
              alt="COINX"
              width={116}
              height={21}
              style={{ width: 116, height: 'auto' }}
            />
            <p className="mt-4 max-w-[42ch] text-[13px] leading-relaxed text-ink-2">
              Timed trading competitions on live crypto market data. Every entrant starts on the
              same capital and is ranked on percent return, so the leaderboard measures decisions
              rather than deposit size.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="label">{column.heading}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-ink-2 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[11.5px] text-ink-3">
            Copyright {new Date().getFullYear()} COINX. Competition balances are simulated, so no
            real funds are traded in these rounds.
          </p>
          <p className="text-[11.5px] text-ink-3">
            Market data from the Binance USD-M futures public API.
          </p>
        </div>
      </div>
    </footer>
  )
}
