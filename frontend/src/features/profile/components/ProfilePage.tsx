'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowSquareOut,
  CheckCircle,
  Key,
  Lock,
  SignOut,
  SlidersHorizontal,
  ShieldCheck,
  UserFocus,
} from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { useAuth } from '@/features/auth/auth-context'
import { logoutAction } from '@/features/auth/actions'
import Header from '@/components/layout/Header'

const SESSIONS = [
  { device: 'Chrome on macOS', place: 'Jakarta, ID', last: 'Active now', current: true },
  { device: 'Firefox on Windows', place: 'Singapore, SG', last: '2 days ago', current: false },
]

function Toggle({
  id,
  label,
  body,
  defaultOn,
}: {
  id: string
  label: string
  body: string
  defaultOn: boolean
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line py-4 last:border-b-0">
      <div>
        <label htmlFor={id} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        <p className="mt-1 max-w-[52ch] text-[12px] leading-relaxed text-ink-3">{body}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((value) => !value)}
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-pill border transition-colors"
        style={{
          backgroundColor: on ? 'var(--color-accent-deep)' : 'var(--color-surface-3)',
          borderColor: on ? 'var(--color-accent-deep)' : 'var(--color-line-strong)',
        }}
      >
        <span
          className="absolute top-[2px] size-3.5 rounded-pill bg-ink transition-transform"
          style={{ left: 2, transform: on ? 'translateX(16px)' : undefined }}
        />
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [leverageCap, setLeverageCap] = useState('10x')
  const [currency, setCurrency] = useState('USD')

  const signOut = async () => {
    logout()
    await logoutAction()
    router.push(ROUTES.landing)
  }

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1000px] px-4 py-8 lg:px-6">
        {/* Identity */}
        <section className="panel flex flex-wrap items-center gap-5 p-6">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-card text-xl font-semibold text-white"
            style={{ backgroundColor: 'var(--color-accent-deep)' }}
          >
            {user.initial}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink">{user.name}</h1>
            <p className="mt-1 text-[13px] text-ink-3">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className="pill"
                style={{
                  color: 'var(--color-long)',
                  borderColor: 'rgba(52, 211, 153, 0.32)',
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                }}
              >
                <CheckCircle size={11} weight="bold" aria-hidden />
                Email verified
              </span>
              <span className="pill">Identity not required</span>
            </div>
          </div>
          <dl className="flex gap-6">
            <div>
              <dt className="label">Member since</dt>
              <dd className="num mt-2 text-[13px] text-ink-2">Sep 2026</dd>
            </div>
            <div>
              <dt className="label">Rounds entered</dt>
              <dd className="num mt-2 text-[13px] text-ink-2">23</dd>
            </div>
          </dl>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Security */}
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-accent" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Security</h2>
            </div>

            <div className="mt-4 flex flex-col">
              <div className="flex items-center justify-between gap-4 border-b border-line py-3.5">
                <div>
                  <p className="text-[13px] text-ink">Two-factor authentication</p>
                  <p className="mt-1 text-[11.5px] text-ink-3">
                    Required for withdrawals and password changes
                  </p>
                </div>
                <span
                  className="pill"
                  style={{
                    color: 'var(--color-long)',
                    borderColor: 'rgba(52, 211, 153, 0.32)',
                  }}
                >
                  Enabled
                </span>
              </div>

              <button
                type="button"
                className="flex items-center justify-between gap-4 border-b border-line py-3.5 text-left transition-colors hover:text-accent"
              >
                <span>
                  <span className="block text-[13px] text-ink">Password</span>
                  <span className="mt-1 block text-[11.5px] text-ink-3">
                    Last changed 4 months ago
                  </span>
                </span>
                <Key size={14} className="text-ink-3" aria-hidden />
              </button>

              <button
                type="button"
                className="flex items-center justify-between gap-4 border-b border-line py-3.5 text-left transition-colors hover:text-accent"
              >
                <span>
                  <span className="block text-[13px] text-ink">Withdrawal address book</span>
                  <span className="mt-1 block text-[11.5px] text-ink-3">
                    One address whitelisted per network
                  </span>
                </span>
                <Lock size={14} className="text-ink-3" aria-hidden />
              </button>

              <div className="py-4">
                <p className="text-[12.5px] text-ink-3">Active sessions</p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {SESSIONS.map((session) => (
                    <li
                      key={session.device}
                      className="flex items-center justify-between gap-4 rounded-control border border-line px-3.5 py-3"
                    >
                      <span>
                        <span className="block text-[12.5px] text-ink">{session.device}</span>
                        <span className="num mt-1 block text-[11px] text-ink-3">
                          {session.place} · {session.last}
                        </span>
                      </span>
                      {session.current ? (
                        <span className="num text-[11px] text-long">This device</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost px-2.5 py-1.5 text-[11px]"
                        >
                          Revoke
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Preferences and trading defaults */}
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-accent" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Preferences</h2>
            </div>

            <div className="mt-4">
              <Toggle
                id="pref-round-open"
                label="Round opening reminders"
                body="A notification five minutes before a round you entered starts trading."
                defaultOn
              />
              <Toggle
                id="pref-rank"
                label="Rank change alerts"
                body="Notify when another trader moves you out of a payout tier while a round is open."
                defaultOn
              />
              <Toggle
                id="pref-email"
                label="Email copies"
                body="Send a copy of prize credits and withdrawals to your account address."
                defaultOn={false}
              />
              <Toggle
                id="pref-reduce-motion"
                label="Reduce animation"
                body="Skip the scroll reveals and live price flashes. Your operating system setting is respected either way."
                defaultOn={false}
              />
            </div>

            <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="pref-leverage">
                  Default leverage cap
                </label>
                <select
                  id="pref-leverage"
                  value={leverageCap}
                  onChange={(event) => setLeverageCap(event.target.value)}
                  className="field mt-2"
                >
                  {['1x', '3x', '5x', '10x'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11.5px] text-ink-3">
                  Pre-fills the leverage selector inside the terminal.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="pref-currency">
                  Display currency
                </label>
                <select
                  id="pref-currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className="field mt-2"
                >
                  {['USD', 'EUR', 'IDR'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11.5px] text-ink-3">
                  Applies to account figures. Market prices stay in USDT.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-control border border-line bg-surface-2/50 px-3.5 py-3">
              <UserFocus size={13} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
              <p className="text-[11.5px] leading-relaxed text-ink-2">
                The interface runs in dark mode only. A light theme is not offered, because every
                chart, candle and depth ladder on the platform is tuned for a dark ground.
              </p>
            </div>
          </section>
        </div>

        {/* Support */}
        <section className="panel mt-6 p-5">
          <h2 className="text-[15px] font-semibold text-ink">Support and legal</h2>
          <div className="mt-4 grid gap-px overflow-hidden rounded-control border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Round rules', 'How ranking and payouts work'],
              ['Deposit help', 'Networks, confirmations, limits'],
              ['Terms of service', 'Current revision'],
              ['Privacy policy', 'What is stored and why'],
            ].map(([label, body]) => (
              <button
                key={label}
                type="button"
                className="flex flex-col items-start gap-2 bg-surface px-4 py-4 text-left transition-colors hover:bg-surface-2"
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="text-[12.5px] font-medium text-ink">{label}</span>
                  <ArrowSquareOut size={12} className="shrink-0 text-ink-3" aria-hidden />
                </span>
                <span className="text-[11.5px] leading-relaxed text-ink-3">{body}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sign out */}
        <section className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-card border border-short/25 bg-short/5 p-5">
          <div>
            <p className="text-[13px] font-semibold text-ink">Sign out of this device</p>
            <p className="mt-1 max-w-[60ch] text-[12px] leading-relaxed text-ink-2">
              Open positions in a running round are closed at the current mark. Your balance and
              round history are kept.
            </p>
          </div>
          <button type="button" onClick={signOut} className="btn btn-danger px-4 py-2.5">
            <SignOut size={13} aria-hidden />
            Sign out
          </button>
        </section>
      </main>
    </div>
  )
}
