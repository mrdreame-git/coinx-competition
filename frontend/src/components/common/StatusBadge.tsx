import { CheckCircle, Clock, Broadcast } from '@phosphor-icons/react/dist/ssr'
import type { CompetitionStatus } from '@/types/competition'

const CONFIG: Record<
  CompetitionStatus,
  { label: string; icon: typeof Clock; fg: string; bg: string; border: string }
> = {
  live: {
    label: 'Live now',
    icon: Broadcast,
    fg: 'var(--color-short)',
    bg: 'rgba(248, 113, 113, 0.12)',
    border: 'rgba(248, 113, 113, 0.32)',
  },
  upcoming: {
    label: 'Upcoming',
    icon: Clock,
    fg: 'var(--color-accent)',
    bg: 'rgba(95, 168, 255, 0.12)',
    border: 'rgba(95, 168, 255, 0.3)',
  },
  finished: {
    label: 'Settled',
    icon: CheckCircle,
    fg: 'var(--color-ink-2)',
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'var(--color-line-strong)',
  },
}

export default function StatusBadge({ status }: { status: CompetitionStatus }) {
  const { label, icon: Icon, fg, bg, border } = CONFIG[status]

  return (
    <span
      className="pill"
      style={{ color: fg, backgroundColor: bg, borderColor: border }}
    >
      {status === 'live' ? <span className="live-pip" aria-hidden /> : <Icon size={11} weight="bold" aria-hidden />}
      {label}
    </span>
  )
}
