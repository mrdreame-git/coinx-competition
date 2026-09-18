import { Crown, CurrencyDollar, Medal } from '@phosphor-icons/react/dist/ssr'
import type { LeaderboardRow } from '@/types/leaderboard'
import { formatNumber, formatPct } from '@/lib/format'
import ChangeTag from '@/components/common/ChangeTag'

interface LeaderboardTableProps {
  data: LeaderboardRow[]
  compact?: boolean
}

const RANK_ICON = [Crown, Medal, Medal]
const RANK_COLOR = ['var(--color-warn)', 'var(--color-ink-2)', '#c08457']

/**
 * Ranked trader table. Columns are fixed-width so ranks, returns and prizes line
 * up across rows; the viewer's own row is the only highlighted row on the page.
 */
export default function LeaderboardTable({ data, compact = false }: LeaderboardTableProps) {
  if (data.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-[13px] text-ink-2">
        No traders have closed a position in this round yet.
      </p>
    )
  }

  return (
    <div role="table" aria-label="Leaderboard">
      <div
        role="row"
        className={`grid items-center gap-3 px-4 ${compact ? 'pb-2' : 'py-2.5'} border-b border-line text-[10.5px] uppercase tracking-[0.12em] text-ink-3`}
        style={{ gridTemplateColumns: compact ? '48px 1fr 88px' : '64px 1fr 104px 104px' }}
      >
        <span role="columnheader">Rank</span>
        <span role="columnheader">Trader</span>
        <span role="columnheader" className="text-right">
          Return
        </span>
        {!compact && (
          <span role="columnheader" className="text-right">
            Prize
          </span>
        )}
      </div>

      {data.map((row) => {
        const podium = row.rank <= 3
        const RankIcon = RANK_ICON[row.rank - 1]

        return (
          <div
            key={row.rank}
            role="row"
            className="grid items-center gap-3 border-b border-line px-4 transition-colors last:border-b-0"
            style={{
              gridTemplateColumns: compact ? '48px 1fr 88px' : '64px 1fr 104px 104px',
              backgroundColor: row.isUser ? 'rgba(95, 168, 255, 0.07)' : undefined,
            }}
          >
            <span
              role="cell"
              className="flex items-center gap-1.5 py-3"
              style={{ color: podium ? RANK_COLOR[row.rank - 1] : 'var(--color-ink-3)' }}
            >
              {podium && <RankIcon size={13} weight="fill" aria-hidden />}
              <span className="num text-[13px] font-semibold">{row.rank}</span>
            </span>

            <span role="cell" className="flex min-w-0 items-center gap-2">
              <span
                className={`truncate text-[13px] ${row.isUser ? 'font-semibold' : 'font-medium'}`}
                style={{ color: row.isUser ? 'var(--color-accent)' : 'var(--color-ink)' }}
              >
                {row.name}
              </span>
              {row.isUser && (
                <span className="pill shrink-0" style={{ color: 'var(--color-accent)', borderColor: 'rgba(95,168,255,0.35)', backgroundColor: 'rgba(95,168,255,0.1)' }}>
                  You
                </span>
              )}
            </span>

            <span role="cell" className="flex justify-end">
              <ChangeTag value={row.returnPct} size="sm" />
            </span>

            {!compact && (
              <span role="cell" className="num flex items-center justify-end gap-1 text-right text-[13px]">
                {row.prize > 0 ? (
                  <>
                    <CurrencyDollar size={12} className="text-warn" aria-hidden />
                    <span className="text-ink">{formatNumber(row.prize)}</span>
                  </>
                ) : (
                  <span className="text-ink-3">--</span>
                )}
              </span>
            )}
          </div>
        )
      })}

      {!compact && (
        <p className="px-4 pt-3 text-[11px] text-ink-3">
          Ranked on realised plus unrealised return, gross of the entry fee. Ties break on trade count.
        </p>
      )}
    </div>
  )
}

export function PodiumCard({
  rank,
  name,
  returnPct,
  prize,
}: {
  rank: number
  name: string
  returnPct: number
  prize: number
}) {
  const RankIcon = RANK_ICON[rank - 1] ?? Medal

  return (
    <div
      className="panel-raised flex flex-col gap-3 p-5"
      style={{ borderTop: `2px solid ${RANK_COLOR[rank - 1] ?? 'var(--color-line-strong)'}` }}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5" style={{ color: RANK_COLOR[rank - 1] }}>
          <RankIcon size={15} weight="fill" aria-hidden />
          <span className="num text-[13px] font-bold">#{rank}</span>
        </span>
        <span className="num text-[11px] text-ink-3">{formatPct(returnPct)}</span>
      </div>
      <p className="truncate text-base font-semibold text-ink">{name}</p>
      <p className="num text-[13px] text-warn">{prize > 0 ? `$${formatNumber(prize)}` : 'No payout'}</p>
    </div>
  )
}
