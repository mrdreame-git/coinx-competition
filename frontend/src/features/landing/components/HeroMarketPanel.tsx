'use client'

import { useMarketProfile, useMarketWorkspace } from '@/lib/binance/hooks'
import {
  formatClock,
  formatNumber,
  formatPctPlain,
  formatPrice,
  formatQty,
  formatUsd,
} from '@/lib/format'
import CandlestickChart from '@/components/common/CandlestickChart'
import ChangeTag from '@/components/common/ChangeTag'

const TIMEFRAME = '1h'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <span className="num text-[12.5px] text-ink">{value}</span>
    </div>
  )
}

/**
 * A real BTC/USDT workspace running on Binance data, not a mock screenshot
 * (skill.md 4.8 permits an actual component preview in the hero). It loads its
 * own data so the marketing page proves the product with live numbers.
 */
export default function HeroMarketPanel() {
  const { ticker, candles, trades, book, mark, openInterest, loading, error, status, refresh } =
    useMarketWorkspace('BTC', TIMEFRAME, { candleLimit: 140, bookLimit: 10, tradeLimit: 6 })

  const feed = useMarketProfile()
  const connected = status === 'open'
  const bestBid = book?.bids[0]
  const bestAsk = book?.asks[0]

  return (
    <div className="panel-glass overflow-hidden">
      {/* Panel head */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-baseline gap-2.5">
          <span className="text-sm font-semibold text-ink">BTC / USDT</span>
          <span className="label">Perpetual</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span
            className="num text-[10.5px] uppercase tracking-[0.12em]"
            style={{ color: connected ? 'var(--color-long)' : 'var(--color-ink-3)' }}
          >
            {connected ? 'Live' : status === 'closed' ? 'Offline' : 'Connecting'}
          </span>
          {connected && <span className="live-pip" aria-hidden />}
        </div>
      </div>

      {/* Price block */}
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2 px-4 pb-1 pt-4 sm:px-5">
        {ticker ? (
          <>
            <span className="num text-[34px] font-semibold leading-none tracking-tight text-ink">
              {formatPrice(ticker.price)}
            </span>
            <ChangeTag value={ticker.changePct} size="lg" />
            <span className="num pb-1 text-[11px] text-ink-3">24h</span>
          </>
        ) : (
          <>
            <span className="skeleton h-8 w-40" />
            <span className="skeleton h-4 w-16" />
          </>
        )}
      </div>

      {/* Chart */}
      <div className="px-1.5 pb-1">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-[13px] text-ink-2">{error}</p>
            <button type="button" onClick={refresh} className="btn btn-secondary px-3 py-1.5 text-[11.5px]">
              Retry feed
            </button>
          </div>
        ) : (
          <CandlestickChart
            candles={candles}
            height={252}
            volume
            axis
            className="w-full"
          />
        )}
      </div>

      {/* Real depth and tape */}
      <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
        <div className="bg-surface px-4 py-3 sm:px-5">
          <span className="label">Top of book</span>
          <div className="mt-2 flex flex-col gap-1.5">
            {[
              { side: 'Bid', level: bestBid, colour: 'var(--color-long)' },
              { side: 'Ask', level: bestAsk, colour: 'var(--color-short)' },
            ].map((row) => (
              <div key={row.side} className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] text-ink-3">{row.side}</span>
                <span className="num text-[12px]" style={{ color: row.colour }}>
                  {row.level ? formatPrice(row.level.price) : '--'}
                </span>
                <span className="num text-[11px] text-ink-2">
                  {row.level ? formatQty(row.level.qty, 3) : '--'}
                </span>
              </div>
            ))}
            <div className="num pt-0.5 text-[10.5px] text-ink-3">
              Spread {book ? formatPctPlain(book.spreadPct) : '--'}
            </div>
          </div>
        </div>

        <div className="bg-surface px-4 py-3 sm:px-5">
          <span className="label">Latest fills</span>
          <div className="mt-2 flex flex-col gap-1.5">
            {trades.length === 0 && <span className="num text-[11px] text-ink-3">Awaiting fills</span>}
            {trades.slice(0, 3).map((trade) => (
              <div key={trade.id} className="flex items-baseline justify-between gap-3">
                <span
                  className="num text-[12px]"
                  style={{ color: trade.side === 'buy' ? 'var(--color-long)' : 'var(--color-short)' }}
                >
                  {formatPrice(trade.price)}
                </span>
                <span className="num text-[11px] text-ink-2">{formatQty(trade.qty, 3)}</span>
                <span className="num text-[11px] text-ink-3">{formatClock(trade.time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session stats: one row of four, so the hero still fits the viewport. */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line px-4 py-4 sm:grid-cols-4 sm:px-5">
        <Stat label="24h high" value={ticker ? formatPrice(ticker.high) : '--'} />
        <Stat label="24h low" value={ticker ? formatPrice(ticker.low) : '--'} />
        <Stat label="24h volume" value={ticker ? formatUsd(ticker.quoteVolume) : '--'} />
        {feed.derivatives ? (
          <Stat
            label="Open interest"
            value={openInterest ? `${formatQty(openInterest.value, 0)} BTC` : loading ? '...' : '--'}
          />
        ) : (
          <Stat label="Fills 24h" value={ticker ? formatNumber(ticker.trades) : '--'} />
        )}
      </div>

      {/*
        On futures this row leads with mark price and funding. Spot has neither, so
        the same three slots carry the top of book instead of a dead placeholder.
      */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-4 py-2.5 sm:px-5">
        {feed.derivatives ? (
          <>
            <span className="num text-[11px] text-ink-3">
              Mark {mark ? formatPrice(mark.markPrice) : '--'}
            </span>
            <span className="num text-[11px] text-ink-3">
              Funding {mark ? formatPctPlain(mark.fundingRatePct) : '--'}
            </span>
            <span className="num text-[11px] text-ink-3">
              Next {mark ? formatClock(mark.nextFundingTime, false) : '--'}
            </span>
          </>
        ) : (
          <>
            <span className="num text-[11px] text-ink-3">
              Bid {bestBid ? formatPrice(bestBid.price) : '--'}
            </span>
            <span className="num text-[11px] text-ink-3">
              Ask {bestAsk ? formatPrice(bestAsk.price) : '--'}
            </span>
            <span className="num text-[11px] text-ink-3">
              Spread {book ? formatPctPlain(book.spreadPct) : '--'}
            </span>
          </>
        )}
        <span className="num ml-auto text-[11px] text-ink-3">{TIMEFRAME.toUpperCase()}</span>
      </div>
    </div>
  )
}
