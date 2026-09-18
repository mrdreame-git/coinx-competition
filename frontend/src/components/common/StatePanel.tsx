'use client'

import type { Icon } from '@phosphor-icons/react'
import { ArrowsClockwise, CircleNotch, Info } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ */
/* Skeletal loading                                                    */
/* ------------------------------------------------------------------ */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />
}

/** A table-shaped placeholder so the layout does not jump when data lands. */
export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-line" aria-hidden>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-5 px-4 py-3.5"
          style={{ opacity: 1 - rowIndex * 0.06 }}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={`h-3.5 ${columnIndex === 0 ? 'w-28' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** A stack of card-shaped placeholders. */
export function CardSkeleton({ count = 3, height = 128 }: { count?: number; height?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="panel p-5" style={{ height }}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-5 w-32" />
          <Skeleton className="mt-6 h-2.5 w-full" />
          <Skeleton className="mt-2 h-2.5 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function InlineSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-3">
      <CircleNotch size={13} className="animate-spin" aria-hidden />
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Empty                                                               */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  icon?: Icon
  title: string
  body: string
  action?: ReactNode
}

/**
 * Composed empty state that says how to populate the view, rather than a bare
 * "no data" line.
 */
export function EmptyState({ icon: Icon = Info, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-control border border-line bg-surface-2">
        <Icon size={19} className="text-ink-3" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-2">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Error                                                               */
/* ------------------------------------------------------------------ */

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  compact?: boolean
}

/**
 * Inline, contextual error. Not a toast: the market feed failing is a persistent
 * condition, so it stays on screen with a retry affordance.
 */
export function ErrorState({
  title = 'Market feed unavailable',
  message,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-short/30 bg-short/8 px-3.5 py-2.5">
        <span className="text-xs text-ink-2">{message}</span>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn btn-ghost px-2.5 py-1.5 text-[11px]">
            <ArrowsClockwise size={12} aria-hidden />
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-control border border-short/30 bg-short/8">
        <Info size={19} className="text-short" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-2">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary mt-5 px-3.5 py-2">
          <ArrowsClockwise size={13} aria-hidden />
          Retry feed
        </button>
      )}
    </div>
  )
}
