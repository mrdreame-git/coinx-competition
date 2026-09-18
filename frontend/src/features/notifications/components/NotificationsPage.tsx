'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, CheckFat, Info, WarningCircle } from '@phosphor-icons/react'
import { NOTIFICATIONS } from '@/mocks/notifications'
import type { AppNotification, NotificationType } from '@/types/notification'
import { ROUTES } from '@/config/app'
import Header from '@/components/layout/Header'
import { EmptyState } from '@/components/common/StatePanel'

type Filter = 'all' | 'unread'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'unread', label: 'Unread' },
]

const TONE: Record<
  NotificationType,
  { icon: typeof Info; fg: string; bg: string; border: string; label: string }
> = {
  success: {
    icon: CheckCircle,
    fg: 'var(--color-long)',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.3)',
    label: 'Confirmed',
  },
  warning: {
    icon: WarningCircle,
    fg: 'var(--color-warn)',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.3)',
    label: 'Needs attention',
  },
  info: {
    icon: Info,
    fg: 'var(--color-accent)',
    bg: 'rgba(95, 168, 255, 0.12)',
    border: 'rgba(95, 168, 255, 0.3)',
    label: 'Update',
  },
}

/** Where each notification type should send the reader next. */
const DESTINATION: Record<NotificationType, string> = {
  success: ROUTES.wallet,
  warning: ROUTES.competitions,
  info: ROUTES.leaderboard,
}

export default function NotificationsPage() {
  const [notes, setNotes] = useState<AppNotification[]>(NOTIFICATIONS)
  const [filter, setFilter] = useState<Filter>('all')

  const unread = notes.filter((note) => !note.read).length

  const visible = useMemo(
    () => (filter === 'unread' ? notes.filter((note) => !note.read) : notes),
    [notes, filter],
  )

  const markAllRead = () => setNotes((current) => current.map((note) => ({ ...note, read: true })))
  const markRead = (id: number) =>
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, read: true } : note)),
    )

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header notifCount={unread} />

      <main className="mx-auto max-w-[820px] px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="label">
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Notifications
            </h1>
            <p className="mt-3 max-w-[56ch] text-[14px] leading-relaxed text-ink-2">
              Round openings, rank movements, prize credits and withdrawal confirmations land here,
              newest first.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="btn btn-ghost px-3.5 py-2.5"
          >
            <CheckFat size={13} aria-hidden />
            Mark all read
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 border-b border-line pb-3">
          <div role="tablist" aria-label="Filter notifications" className="flex gap-1.5">
            {FILTERS.map((item) => {
              const selected = filter === item.key
              const count = item.key === 'unread' ? unread : notes.length
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(item.key)}
                  className="flex items-center gap-2 rounded-control px-3.5 py-2 text-[12.5px] font-medium transition-colors"
                  style={{
                    color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                    backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                  }}
                >
                  {item.label}
                  <span className="num text-[11px] text-ink-3">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {visible.length === 0 ? (
            <div className="panel">
              <EmptyState
                icon={CheckCircle}
                title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
                body="Round openings, rank changes and prize credits will appear here as they happen. Enter a competition to start receiving updates."
                action={
                  <Link href={ROUTES.competitions} className="btn btn-primary px-4 py-2.5">
                    Browse open rounds
                  </Link>
                }
              />
            </div>
          ) : (
            visible.map((note) => {
              const tone = TONE[note.type]
              const Icon = tone.icon
              return (
                <Link
                  key={note.id}
                  href={DESTINATION[note.type]}
                  onClick={() => markRead(note.id)}
                  className="panel flex items-start gap-4 p-4 transition-colors hover:border-line-strong"
                  style={{
                    borderColor: note.read ? undefined : 'rgba(95, 168, 255, 0.24)',
                  }}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-control border"
                    style={{
                      backgroundColor: tone.bg,
                      borderColor: tone.border,
                    }}
                  >
                    <Icon size={15} style={{ color: tone.fg }} aria-hidden />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[13.5px]"
                        style={{
                          color: note.read ? 'var(--color-ink-2)' : 'var(--color-ink)',
                          fontWeight: note.read ? 400 : 600,
                        }}
                      >
                        {note.title}
                      </span>
                      {!note.read && (
                        <span
                          className="pill"
                          style={{
                            color: 'var(--color-accent)',
                            borderColor: 'rgba(95, 168, 255, 0.35)',
                            backgroundColor: 'rgba(95, 168, 255, 0.1)',
                          }}
                        >
                          Unread
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block text-[12.5px] leading-relaxed text-ink-2">
                      {note.body}
                    </span>
                    <span className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="num text-[11px] text-ink-3">{note.time}</span>
                      <span className="text-[11px] text-ink-3">{tone.label}</span>
                    </span>
                  </span>
                </Link>
              )
            })
          )}
        </div>

        <p className="mt-6 text-[11.5px] leading-relaxed text-ink-3">
          Notifications are kept for 30 days. Email copies follow the preferences set on your
          profile.
        </p>
      </main>
    </div>
  )
}
