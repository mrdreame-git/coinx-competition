'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeSlash, Info, WarningCircle } from '@phosphor-icons/react'
import { DEMO_CREDENTIALS, ROUTES } from '@/config/app'
import { useAuth } from '@/features/auth/auth-context'
import { loginAction } from '@/features/auth/actions'
import { InlineSpinner } from '@/components/common/StatePanel'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)

  const emailError = touched.email && !EMAIL_PATTERN.test(email) ? 'Enter a valid email address.' : ''
  const passwordError =
    touched.password && password.length < 6 ? 'Passwords are at least 6 characters.' : ''
  const canSubmit = EMAIL_PATTERN.test(email) && password.length >= 6 && !submitting

  const submit = async () => {
    setTouched({ email: true, password: true })
    if (!EMAIL_PATTERN.test(email) || password.length < 6) return

    setSubmitting(true)
    await loginAction()
    login(email)
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="grid min-h-[100dvh] bg-void lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      {/* Form */}
      <div className="flex flex-col px-6 py-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Link href={ROUTES.landing} aria-label="COINX home">
            <Image
              src="/coinx-logo-long.png"
              alt="COINX"
              width={110}
              height={20}
              preload
              style={{ width: 110, height: 'auto' }}
            />
          </Link>
          <Link
            href={ROUTES.landing}
            className="flex items-center gap-1.5 text-[12.5px] text-ink-3 transition-colors hover:text-accent"
          >
            <ArrowLeft size={12} aria-hidden />
            Back
          </Link>
        </div>

        <div className="flex flex-1 items-center py-12">
          <div className="w-full max-w-[420px]">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
              Round history, wallet balance and open positions are all tied to your account.
            </p>

            <form
              className="mt-8 flex flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                void submit()
              }}
              noValidate
            >
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setTouched((state) => ({ ...state, email: true }))}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className="field mt-2"
                  placeholder="you@example.com"
                />
                {emailError && (
                  <p
                    id="email-error"
                    className="mt-2 flex items-center gap-1.5 text-[11.5px] text-short"
                  >
                    <WarningCircle size={12} aria-hidden />
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11.5px] text-accent hover:underline"
                  >
                    Forgot password
                  </button>
                </div>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={reveal ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={() => setTouched((state) => ({ ...state, password: true }))}
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                    className="field pr-10"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((value) => !value)}
                    aria-label={reveal ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-3 transition-colors hover:text-ink"
                  >
                    {reveal ? <EyeSlash size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
                  </button>
                </div>
                {passwordError && (
                  <p
                    id="password-error"
                    className="mt-2 flex items-center gap-1.5 text-[11.5px] text-short"
                  >
                    <WarningCircle size={12} aria-hidden />
                    {passwordError}
                  </p>
                )}
              </div>

              <button type="submit" disabled={!canSubmit} className="btn btn-primary py-3">
                {submitting ? <InlineSpinner label="Signing in" /> : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-2.5 rounded-control border border-line bg-surface px-3.5 py-3">
              <Info size={13} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
              <p className="text-[11.5px] leading-relaxed text-ink-2">
                Prototype build. Sign in with any valid email and a six character password, for
                example {DEMO_CREDENTIALS.email} and {DEMO_CREDENTIALS.password}.
              </p>
            </div>

            <p className="mt-6 text-[13px] text-ink-2">
              No account yet?{' '}
              <Link href={ROUTES.register} className="font-medium text-accent hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Value panel */}
      <aside
        className="hidden flex-col justify-between border-l border-line bg-surface/50 p-14 lg:flex"
        aria-hidden
      >
        <p className="label">What you are signing into</p>

        <div>
          <p className="text-3xl leading-tight font-semibold tracking-tight text-ink">
            The same starting balance for every entrant.
          </p>
          <p className="mt-5 max-w-[42ch] text-[14px] leading-relaxed text-ink-2">
            Rounds run on live Binance futures prices. Nobody buys an advantage with a bigger
            deposit, because the deposit only buys a seat.
          </p>

          <dl className="mt-10 flex flex-col gap-5">
            {[
              ['Market data', 'Binance USD-M futures, streamed live'],
              ['Ranking', 'Percent return on the round balance'],
              ['Payout', 'Top twenty places, tiered by rank'],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-line pt-4">
                <dt className="label">{label}</dt>
                <dd className="mt-2 text-[13.5px] text-ink-2">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-[11.5px] text-ink-3">
          Competition capital is simulated. No order placed here reaches a real exchange book.
        </p>
      </aside>
    </div>
  )
}
