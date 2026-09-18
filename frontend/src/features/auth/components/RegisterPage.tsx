'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  WarningCircle,
} from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { InlineSpinner } from '@/components/common/StatePanel'

type Step = 'details' | 'verify' | 'done'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/

interface PasswordRule {
  label: string
  test: (value: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value) => /[0-9]/.test(value) },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('details')

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [reveal, setReveal] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const rulesPassed = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  )
  const passwordStrong = rulesPassed.every((rule) => rule.passed)

  const errors = {
    email: touched.email && !EMAIL_PATTERN.test(email) ? 'Enter a valid email address.' : '',
    username:
      touched.username && !USERNAME_PATTERN.test(username)
        ? '3 to 20 characters, letters, numbers and underscores only.'
        : '',
    password: touched.password && !passwordStrong ? 'Password does not meet every rule yet.' : '',
    confirm: touched.confirm && confirm !== password ? 'Both passwords must match.' : '',
    terms: touched.terms && !acceptTerms ? 'Accept the terms to continue.' : '',
  }

  const valid =
    EMAIL_PATTERN.test(email) &&
    USERNAME_PATTERN.test(username) &&
    passwordStrong &&
    confirm === password &&
    acceptTerms

  const submitDetails = () => {
    setTouched({ email: true, username: true, password: true, confirm: true, terms: true })
    if (!valid) return
    setStep('verify')
  }

  const simulateVerification = async () => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    setStep('done')
  }

  const shell = (children: React.ReactNode) => (
    <div className="flex min-h-[100dvh] flex-col bg-void px-6 py-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
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
          {step !== 'done' && (
            <Link
              href={ROUTES.login}
              className="text-[12.5px] text-ink-3 transition-colors hover:text-accent"
            >
              Sign in instead
            </Link>
          )}
        </div>
        <div className="flex flex-1 items-center py-12">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  )

  if (step === 'done') {
    return shell(
      <div className="text-center">
        <span
          className="mx-auto flex size-12 items-center justify-center rounded-control border"
          style={{
            borderColor: 'rgba(52, 211, 153, 0.4)',
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
          }}
        >
          <CheckCircle size={22} className="text-long" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Account created</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          <span className="num">{username}</span> is registered to {email}. Sign in to fund the
          wallet and enter your first round.
        </p>
        <button
          type="button"
          onClick={() => router.push(ROUTES.login)}
          className="btn btn-primary mt-8 w-full py-3"
        >
          Sign in
          <ArrowRight size={13} aria-hidden />
        </button>
      </div>,
    )
  }

  if (step === 'verify') {
    return shell(
      <div>
        <span className="flex size-11 items-center justify-center rounded-control border border-line bg-surface">
          <EnvelopeSimple size={19} className="text-accent" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Verify your email</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          We sent a confirmation link to the address below. Follow it to activate the account, then
          you can fund the wallet and enter a round.
        </p>

        <p className="num mt-5 rounded-control border border-line bg-surface px-3.5 py-3 text-[13px] text-accent">
          {email}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={simulateVerification}
            disabled={submitting}
            className="btn btn-primary py-3"
          >
            {submitting ? <InlineSpinner label="Checking" /> : 'I have confirmed the link'}
          </button>
          <button
            type="button"
            onClick={() => setStep('details')}
            className="btn btn-ghost py-3"
          >
            Use a different email
          </button>
        </div>

        <p className="mt-5 text-[11.5px] leading-relaxed text-ink-3">
          Nothing arrived? Check the spam folder, then request another link from this page. The link
          stays valid for 24 hours.
        </p>
      </div>,
    )
  }

  return shell(
    <div>
      {/* Progress: two real steps, named rather than numbered. */}
      <ol className="flex items-center gap-3">
        {['Your details', 'Verify email'].map((label, index) => {
          const active = index === 0
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className="num flex size-5 items-center justify-center rounded-pill text-[10px] font-semibold"
                style={{
                  backgroundColor: active ? 'var(--color-accent-deep)' : 'var(--color-surface-3)',
                  color: active ? 'var(--color-ink)' : 'var(--color-ink-3)',
                }}
              >
                {index + 1}
              </span>
              <span
                className="text-[12px]"
                style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink-3)' }}
              >
                {label}
              </span>
              {index === 0 && <span className="h-px w-6 bg-line-strong" aria-hidden />}
            </li>
          )
        })}
      </ol>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
        One account covers every round. No identity documents are required to enter a competition.
      </p>

      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          submitDetails()
        }}
        noValidate
      >
        <div>
          <label className="label" htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched((state) => ({ ...state, email: true }))}
            aria-invalid={Boolean(errors.email)}
            className="field mt-2"
            placeholder="you@example.com"
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </div>

        <div>
          <label className="label" htmlFor="reg-username">
            Trader name
          </label>
          <input
            id="reg-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            onBlur={() => setTouched((state) => ({ ...state, username: true }))}
            aria-invalid={Boolean(errors.username)}
            className="field mt-2"
            placeholder="How the leaderboard will show you"
          />
          {errors.username ? (
            <FieldError>{errors.username}</FieldError>
          ) : (
            <p className="mt-2 text-[11.5px] text-ink-3">
              This name appears on every board you rank on and can be changed once.
            </p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="reg-password">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="reg-password"
              type={reveal ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setTouched((state) => ({ ...state, password: true }))}
              aria-invalid={Boolean(errors.password)}
              className="field pr-10"
              placeholder="Choose a password"
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

          <ul className="mt-3 flex flex-col gap-1.5">
            {rulesPassed.map((rule) => (
              <li
                key={rule.label}
                className="flex items-center gap-2 text-[11.5px]"
                style={{ color: rule.passed ? 'var(--color-long)' : 'var(--color-ink-3)' }}
              >
                <Check size={11} weight="bold" aria-hidden />
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="label" htmlFor="reg-confirm">
            Confirm password
          </label>
          <input
            id="reg-confirm"
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            onBlur={() => setTouched((state) => ({ ...state, confirm: true }))}
            aria-invalid={Boolean(errors.confirm)}
            className="field mt-2"
            placeholder="Repeat the password"
          />
          {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            onBlur={() => setTouched((state) => ({ ...state, terms: true }))}
            className="mt-0.5 size-4 shrink-0 rounded border border-line-strong bg-surface-2 accent-[var(--color-accent-deep)]"
          />
          <span className="text-[12px] leading-relaxed text-ink-2">
            I understand that competition capital is simulated and settled against live market
            prices, and I accept the round rules and the privacy policy.
          </span>
        </label>
        {errors.terms && <FieldError>{errors.terms}</FieldError>}

        <button type="submit" className="btn btn-primary py-3">
          Continue
          <ArrowRight size={13} aria-hidden />
        </button>
      </form>

      <p className="mt-6 text-[13px] text-ink-2">
        Already registered?{' '}
        <Link href={ROUTES.login} className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>

      <Link
        href={ROUTES.landing}
        className="mt-8 flex items-center gap-1.5 text-[12px] text-ink-3 transition-colors hover:text-accent"
      >
        <ArrowLeft size={12} aria-hidden />
        Back to the landing page
      </Link>
    </div>,
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-short">
      <WarningCircle size={12} aria-hidden />
      {children}
    </p>
  )
}
