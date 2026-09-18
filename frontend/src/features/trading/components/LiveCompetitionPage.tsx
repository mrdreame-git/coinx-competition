'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowRight,
  CaretDown,
  CaretUp,
  CheckCircle,
  Info,
  Plus,
  Trophy,
  X,
} from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { COMPETITIONS } from '@/mocks/competitions'
import { LEADERBOARD_DATA } from '@/mocks/leaderboard'
import { MARKET_SYMBOLS, findSymbol } from '@/lib/binance/symbols'
import { useLiveTickers, useMarketProfile, useMarketWorkspace } from '@/lib/binance/hooks'
import {
  formatClock,
  formatNumber,
  formatPct,
  formatPctPlain,
  formatPrice,
  formatQty,
  formatUsd,
} from '@/lib/format'
import Header from '@/components/layout/Header'
import CandlestickChart from '@/components/common/CandlestickChart'
import ChangeTag from '@/components/common/ChangeTag'
import { ErrorState } from '@/components/common/StatePanel'

type Side = 'long' | 'short'
type OrderType = 'market' | 'limit'
type Panel = 'positions' | 'orders' | 'history'

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
const LEVERAGE = ['1x', '2x', '3x', '5x', '10x']
const SIZE_PRESETS = [25, 50, 75, 100]

/** Simulated competition account. Market data on this page is live. */
const ACCOUNT = { equity: 1108.42, startingCapital: 1000, available: 285 }
const TAKER_FEE = 0.0005

const POSITIONS = [
  { symbol: 'BTC', side: 'long' as Side, leverage: '5x', size: '0.0023', entry: 117800, mark: 118245, liq: 106020 },
  { symbol: 'ETH', side: 'long' as Side, leverage: '3x', size: '0.1250', entry: 3780, mark: 3842, liq: 3024 },
  { symbol: 'SOL', side: 'short' as Side, leverage: '2x', size: '2.5000', entry: 251.2, mark: 247.83, liq: 334.93 },
]

/** One row shape for working and completed orders, so the panel needs no narrowing. */
interface OrderRow {
  time: string
  symbol: string
  side: 'Buy' | 'Sell'
  type: string
  price: string
  qty: string
  /** Absent while the order is still working. */
  status?: 'Filled' | 'Cancelled'
}

const OPEN_ORDERS: OrderRow[] = [
  { time: '16:42:18', symbol: 'BTC', side: 'Buy', type: 'Limit', price: '117,500', qty: '0.0010' },
  { time: '15:31:05', symbol: 'ETH', side: 'Sell', type: 'Limit', price: '3,950', qty: '0.0500' },
]

const FILLED_ORDERS: OrderRow[] = [
  { time: '16:18:42', symbol: 'BTC', side: 'Buy', type: 'Market', price: '117,800', qty: '0.0023', status: 'Filled' },
  { time: '15:55:12', symbol: 'ETH', side: 'Buy', type: 'Market', price: '3,780', qty: '0.1250', status: 'Filled' },
  { time: '14:22:33', symbol: 'SOL', side: 'Sell', type: 'Market', price: '251.20', qty: '2.5000', status: 'Filled' },
  { time: '13:45:08', symbol: 'BTC', side: 'Sell', type: 'Limit', price: '119,200', qty: '0.0050', status: 'Cancelled' },
]

export default function LiveCompetitionPage() {
  const params = useParams<{ competitionId: string }>()
  const competitionId = Number(params?.competitionId ?? 1)
  const comp = COMPETITIONS.find((item) => item.id === competitionId) ?? COMPETITIONS[0]

  const initialBase = comp.pair.split('/')[0]?.trim().toUpperCase() ?? 'BTC'
  const [base, setBase] = useState(findSymbol(initialBase)?.base ?? 'BTC')
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>('15m')
  const [panel, setPanel] = useState<Panel>('positions')

  const [side, setSide] = useState<Side>('long')
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [leverage, setLeverage] = useState('5x')
  const [sizePct, setSizePct] = useState(25)
  const [limitPrice, setLimitPrice] = useState('')
  const [tpSlOpen, setTpSlOpen] = useState(false)
  const [takeProfit, setTakeProfit] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [placed, setPlaced] = useState(false)

  const { byBase } = useLiveTickers()
  const feed = useMarketProfile()
  const market = findSymbol(base) ?? MARKET_SYMBOLS[0]

  const { ticker, candles, book, trades, mark, openInterest, loading, error, status, refresh } =
    useMarketWorkspace(market.base, timeframe, {
      candleLimit: 160,
      bookLimit: 14,
      tradeLimit: 22,
    })

  const leverageValue = Number.parseInt(leverage, 10)
  const notional = (ACCOUNT.available * sizePct) / 100
  const margin = notional / leverageValue
  const entryPrice =
    orderType === 'limit' && limitPrice ? Number(limitPrice) : (ticker?.price ?? 0)
  const quantity = entryPrice > 0 ? notional / entryPrice : 0
  const fee = notional * TAKER_FEE

  const depthMax = useMemo(() => {
    if (!book) return 1
    return Math.max(
      ...book.bids.map((level) => level.total),
      ...book.asks.map((level) => level.total),
      1,
    )
  }, [book])

  const positionRows = useMemo(
    () =>
      POSITIONS.map((position) => {
        const live = byBase.get(position.symbol)
        const markPrice = live?.price ?? position.mark
        const direction = position.side === 'long' ? 1 : -1
        const pnl = (markPrice - position.entry) * Number(position.size) * direction
        const notionalAtEntry = position.entry * Number(position.size)
        const pnlPct = notionalAtEntry ? (pnl / notionalAtEntry) * 100 : 0
        return { ...position, markPrice, pnl, pnlPct }
      }),
    [byBase],
  )

  const tournamentRank = LEADERBOARD_DATA.find((row) => row.isUser)

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header notifCount={0} />

      {/* Competition strip */}
      <div className="border-b border-line bg-surface/60">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="live-pip" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-ink">{comp.name}</p>
              <p className="num mt-0.5 text-[11px] text-ink-3">
                {comp.duration} window · {comp.players} of {comp.maxPlayers} seats
              </p>
            </div>
          </div>

          <dl className="flex flex-wrap gap-x-6 gap-y-2 lg:ml-auto">
            <div>
              <dt className="label">Equity</dt>
              <dd className="num mt-1.5 text-[13px] text-ink">
                {formatNumber(ACCOUNT.equity, 2)}
              </dd>
            </div>
            <div>
              <dt className="label">Return</dt>
              <dd className="num mt-1.5 text-[13px]">
                <ChangeTag
                  value={((ACCOUNT.equity - ACCOUNT.startingCapital) / ACCOUNT.startingCapital) * 100}
                  size="sm"
                  caret={false}
                />
              </dd>
            </div>
            <div>
              <dt className="label">Rank</dt>
              <dd className="num mt-1.5 text-[13px] text-accent">
                {tournamentRank ? `#${tournamentRank.rank}` : '--'}
                <span className="text-ink-3"> / {LEADERBOARD_DATA.length}</span>
              </dd>
            </div>
            <div>
              <dt className="label">Positions</dt>
              <dd className="num mt-1.5 text-[13px] text-ink-2">{positionRows.length} open</dd>
            </div>
          </dl>

          <Link href={ROUTES.results(comp.id)} className="btn btn-ghost px-3 py-2 text-[12px]">
            Round results
            <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
      </div>

      {/* Contract switcher */}
      <div className="border-b border-line bg-void">
        <div className="mx-auto flex max-w-[1600px] items-stretch gap-0 overflow-x-auto px-4 lg:px-6">
          {MARKET_SYMBOLS.slice(0, 8).map((option) => {
            const live = byBase.get(option.base)
            const selected = option.base === base
            return (
              <button
                key={option.symbol}
                type="button"
                onClick={() => setBase(option.base)}
                aria-pressed={selected}
                className="flex shrink-0 items-center gap-2.5 border-b-2 px-4 py-2.5 transition-colors"
                style={{
                  borderBottomColor: selected ? 'var(--color-accent)' : 'transparent',
                }}
              >
                <span
                  className="text-[12.5px] font-semibold"
                  style={{ color: selected ? 'var(--color-ink)' : 'var(--color-ink-3)' }}
                >
                  {option.base}
                </span>
                {live ? (
                  <>
                    <span className="num text-[12px] text-ink-2">{formatPrice(live.price)}</span>
                    <ChangeTag value={live.changePct} size="sm" caret={false} />
                  </>
                ) : (
                  <span className="skeleton h-3.5 w-20" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {error && !ticker ? (
        <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-6">
          <div className="panel">
            <ErrorState title="Market feed unavailable" message={error} onRetry={refresh} />
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-[1600px] gap-0 xl:grid-cols-[minmax(0,1fr)_260px_320px]">
          {/* Chart, positions */}
          <div className="min-w-0 border-line xl:border-r">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <div className="flex items-baseline gap-3">
                <span className="num text-[14px] font-semibold text-ink">{market.pair}</span>
                <span className="num text-[15px] font-semibold text-ink">
                  {ticker ? formatPrice(ticker.price) : '...'}
                </span>
                {ticker && <ChangeTag value={ticker.changePct} size="sm" />}
                <span className="num text-[10.5px] text-ink-3">
                  {status === 'open' ? 'live' : 'polling'}
                </span>
              </div>
              <div role="group" aria-label="Chart interval" className="flex gap-0.5">
                {TIMEFRAMES.map((option) => {
                  const selected = option === timeframe
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTimeframe(option)}
                      aria-pressed={selected}
                      className="num rounded-control px-2 py-1.5 text-[11px] transition-colors"
                      style={{
                        color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                        backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                      }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="px-1.5 py-2">
              <CandlestickChart candles={candles} height={330} volume axis />
            </div>

            {/*
              Futures shows mark price, funding and open interest here. On spot
              none of those exist, so the row reads the book instead of showing
              three fields that would never resolve.
            */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-y border-line px-4 py-2">
              {feed.derivatives ? (
                <>
                  <span className="num text-[11px] text-ink-3">
                    Mark {mark ? formatPrice(mark.markPrice) : '...'}
                  </span>
                  <span className="num text-[11px] text-ink-3">
                    Funding {mark ? formatPctPlain(mark.fundingRatePct) : '...'}
                  </span>
                  <span className="num text-[11px] text-ink-3">
                    Open interest{' '}
                    {openInterest ? `${formatQty(openInterest.value, 0)} ${market.base}` : '...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="num text-[11px] text-ink-3">
                    Spread {book ? formatPctPlain(book.spreadPct) : '...'}
                  </span>
                  <span className="num text-[11px] text-ink-3">
                    Depth{' '}
                    {book
                      ? `${formatUsd(book.bidNotional + book.askNotional, 1)} in the top ${book.bids.length}`
                      : '...'}
                  </span>
                  <span className="num text-[11px] text-ink-3">
                    Fills 24h {ticker ? formatNumber(ticker.trades) : '...'}
                  </span>
                </>
              )}
              <span className="num ml-auto text-[11px] text-ink-3">
                {loading ? 'updating' : `updated ${formatClock(ticker?.updatedAt ?? 0)}`}
              </span>
            </div>

            {/* Positions, orders, history */}
            <div className="border-t border-line">
              <div role="tablist" aria-label="Account panels" className="flex border-b border-line px-1.5">
                {(['positions', 'orders', 'history'] as Panel[]).map((option) => {
                  const selected = option === panel
                  const count =
                    option === 'positions'
                      ? positionRows.length
                      : option === 'orders'
                        ? OPEN_ORDERS.length
                        : FILLED_ORDERS.length
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setPanel(option)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium capitalize transition-colors"
                      style={{
                        color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                      }}
                    >
                      {option}
                      <span className="num text-[10.5px] text-ink-3">{count}</span>
                    </button>
                  )
                })}
              </div>

              {panel === 'positions' && (
                <div className="overflow-x-auto">
                  <div
                    className="grid min-w-[720px] items-center gap-3 border-b border-line bg-surface-2/50 px-4 py-2"
                    style={{ gridTemplateColumns: '64px 90px 100px 110px 110px 110px 1fr' }}
                  >
                    <span className="label">Contract</span>
                    <span className="label">Side</span>
                    <span className="label text-right">Size</span>
                    <span className="label text-right">Entry</span>
                    <span className="label text-right">Mark</span>
                    <span className="label text-right">P&amp;L</span>
                    <span className="label text-right">Liq. price</span>
                  </div>
                  {positionRows.map((position) => (
                    <div
                      key={`${position.symbol}-${position.side}`}
                      className="grid min-w-[720px] items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                      style={{ gridTemplateColumns: '64px 90px 100px 110px 110px 110px 1fr' }}
                    >
                      <span className="text-[12.5px] font-semibold text-ink">
                        {position.symbol}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[12px]"
                        style={{
                          color:
                            position.side === 'long'
                              ? 'var(--color-long)'
                              : 'var(--color-short)',
                        }}
                      >
                        {position.side === 'long' ? (
                          <CaretUp size={10} weight="bold" aria-hidden />
                        ) : (
                          <CaretDown size={10} weight="bold" aria-hidden />
                        )}
                        {position.side} {position.leverage}
                      </span>
                      <span className="num text-right text-[12px] text-ink-2">
                        {position.size}
                      </span>
                      <span className="num text-right text-[12px] text-ink-2">
                        {formatPrice(position.entry)}
                      </span>
                      <span className="num text-right text-[12px] text-ink-2">
                        {formatPrice(position.markPrice)}
                      </span>
                      <span
                        className="num text-right text-[12px]"
                        style={{
                          color: position.pnl >= 0 ? 'var(--color-long)' : 'var(--color-short)',
                        }}
                      >
                        {position.pnl >= 0 ? '+' : ''}
                        {position.pnl.toFixed(2)} ({formatPct(position.pnlPct, 2)})
                      </span>
                      <span className="num text-right text-[12px] text-short">
                        {formatPrice(position.liq)}
                      </span>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <p className="text-[11.5px] text-ink-3">
                      Mark prices are live. Size, entry and liquidation on these rows are simulated
                      competition positions.
                    </p>
                    <button type="button" className="btn btn-danger px-3 py-1.5 text-[11.5px]">
                      <X size={11} aria-hidden />
                      Close all
                    </button>
                  </div>
                </div>
              )}

              {(panel === 'orders' || panel === 'history') && (
                <div className="overflow-x-auto">
                  <div
                    className="grid min-w-[680px] items-center gap-3 border-b border-line bg-surface-2/50 px-4 py-2"
                    style={{ gridTemplateColumns: '96px 76px 76px 88px 116px 116px 1fr' }}
                  >
                    <span className="label">Time</span>
                    <span className="label">Contract</span>
                    <span className="label">Side</span>
                    <span className="label">Type</span>
                    <span className="label text-right">Price</span>
                    <span className="label text-right">Quantity</span>
                    <span className="label text-right">
                      {panel === 'orders' ? 'Action' : 'Status'}
                    </span>
                  </div>
                  {(panel === 'orders' ? OPEN_ORDERS : FILLED_ORDERS).map((order) => (
                    <div
                      key={`${order.time}-${order.symbol}`}
                      className="grid min-w-[680px] items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                      style={{ gridTemplateColumns: '96px 76px 76px 88px 116px 116px 1fr' }}
                    >
                      <span className="num text-[12px] text-ink-3">{order.time}</span>
                      <span className="text-[12.5px] font-semibold text-ink">{order.symbol}</span>
                      <span
                        className="text-[12px]"
                        style={{
                          color:
                            order.side === 'Buy' ? 'var(--color-long)' : 'var(--color-short)',
                        }}
                      >
                        {order.side}
                      </span>
                      <span className="text-[12px] text-ink-2">{order.type}</span>
                      <span className="num text-right text-[12px] text-ink-2">{order.price}</span>
                      <span className="num text-right text-[12px] text-ink-2">{order.qty}</span>
                      <span className="flex justify-end">
                        {order.status ? (
                          <span
                            className="num text-[11.5px]"
                            style={{
                              color:
                                order.status === 'Filled'
                                  ? 'var(--color-long)'
                                  : 'var(--color-ink-3)',
                            }}
                          >
                            {order.status}
                          </span>
                        ) : (
                          <button type="button" className="btn btn-ghost px-2.5 py-1 text-[11px]">
                            Cancel
                          </button>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order book and tape */}
          <aside className="border-b border-line xl:border-r xl:border-b-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="text-[12px] text-ink-2">Order book</span>
              <span className="num text-[10.5px] text-ink-3">
                {book ? formatPctPlain(book.spreadPct) : '...'}
              </span>
            </div>

            <div className="grid grid-cols-3 px-3 py-1.5">
              <span className="label">Price</span>
              <span className="label text-right">Size</span>
              <span className="label text-right">Total</span>
            </div>

            <div>
              {[...(book?.asks ?? [])].reverse().map((level) => (
                <div key={`ask-${level.price}`} className="relative grid grid-cols-3 px-3 py-[3px]">
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0"
                    style={{
                      width: `${(level.total / depthMax) * 100}%`,
                      backgroundColor: 'rgba(248, 113, 113, 0.09)',
                    }}
                  />
                  <span className="num relative text-[11px] text-short">
                    {formatPrice(level.price)}
                  </span>
                  <span className="num relative text-right text-[11px] text-ink-2">
                    {formatQty(level.qty, 3)}
                  </span>
                  <span className="num relative text-right text-[11px] text-ink-3">
                    {formatQty(level.total, 3)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline justify-between border-y border-line bg-surface-2 px-3 py-2">
              <span
                className="num text-[15px] font-semibold"
                style={{
                  color:
                    (ticker?.changePct ?? 0) >= 0 ? 'var(--color-long)' : 'var(--color-short)',
                }}
              >
                {ticker ? formatPrice(ticker.price) : '...'}
              </span>
              <span className="num text-[10.5px] text-ink-3">
                mid {book ? formatPrice(book.mid) : '...'}
              </span>
            </div>

            <div>
              {book?.bids.map((level) => (
                <div key={`bid-${level.price}`} className="relative grid grid-cols-3 px-3 py-[3px]">
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0"
                    style={{
                      width: `${(level.total / depthMax) * 100}%`,
                      backgroundColor: 'rgba(52, 211, 153, 0.09)',
                    }}
                  />
                  <span className="num relative text-[11px] text-long">
                    {formatPrice(level.price)}
                  </span>
                  <span className="num relative text-right text-[11px] text-ink-2">
                    {formatQty(level.qty, 3)}
                  </span>
                  <span className="num relative text-right text-[11px] text-ink-3">
                    {formatQty(level.total, 3)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-line">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="label">Recent fills</span>
                <span className="num text-[10.5px] text-ink-3">{trades.length}</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                {trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="grid grid-cols-3 border-b border-line px-3 py-1 last:border-b-0"
                  >
                    <span
                      className="num text-[11px]"
                      style={{
                        color: trade.side === 'buy' ? 'var(--color-long)' : 'var(--color-short)',
                      }}
                    >
                      {formatPrice(trade.price)}
                    </span>
                    <span className="num text-right text-[11px] text-ink-2">
                      {formatQty(trade.qty, 4)}
                    </span>
                    <span className="num text-right text-[11px] text-ink-3">
                      {formatClock(trade.time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Order form */}
          <aside>
            <div role="group" aria-label="Order type" className="flex border-b border-line">
              {(['market', 'limit'] as OrderType[]).map((option) => {
                const selected = option === orderType
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setOrderType(option)}
                    aria-pressed={selected}
                    className="flex-1 py-2.5 text-[12px] font-medium capitalize transition-colors"
                    style={{
                      color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                      backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-px bg-line">
              {(['long', 'short'] as Side[]).map((option) => {
                const selected = side === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSide(option)}
                    aria-pressed={selected}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold capitalize transition-colors"
                    style={{
                      color: selected
                        ? option === 'long'
                          ? '#6ee7b7'
                          : '#fca5a5'
                        : 'var(--color-ink-3)',
                      backgroundColor: selected
                        ? option === 'long'
                          ? 'rgba(52, 211, 153, 0.14)'
                          : 'rgba(248, 113, 113, 0.14)'
                        : 'var(--color-surface)',
                    }}
                  >
                    {option === 'long' ? (
                      <CaretUp size={11} weight="bold" aria-hidden />
                    ) : (
                      <CaretDown size={11} weight="bold" aria-hidden />
                    )}
                    {option}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-4 p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="label">Leverage</span>
                  <span className="num text-[11.5px] text-accent">{leverage}</span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {LEVERAGE.map((option) => {
                    const selected = option === leverage
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLeverage(option)}
                        aria-pressed={selected}
                        className="num rounded-control py-1.5 text-[11.5px] transition-colors"
                        style={{
                          color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                          backgroundColor: selected
                            ? 'var(--color-accent-soft)'
                            : 'var(--color-surface-2)',
                        }}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="label" htmlFor="limit-price">
                    Limit price
                  </label>
                  <input
                    id="limit-price"
                    inputMode="decimal"
                    value={limitPrice}
                    onChange={(event) => setLimitPrice(event.target.value)}
                    placeholder={ticker ? formatPrice(ticker.price) : '0.00'}
                    className="field num mt-2 text-[12.5px]"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="label">Notional</span>
                  <span className="num text-[11.5px] text-ink-2">
                    {formatNumber(notional, 2)} USDT
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={sizePct}
                  onChange={(event) => setSizePct(Number(event.target.value))}
                  aria-label="Position size as percent of available margin"
                  className="mt-3"
                />
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {SIZE_PRESETS.map((preset) => {
                    const selected = preset === sizePct
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSizePct(preset)}
                        aria-pressed={selected}
                        className="num rounded-control py-1.5 text-[11px] transition-colors"
                        style={{
                          color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                          backgroundColor: selected
                            ? 'var(--color-accent-soft)'
                            : 'var(--color-surface-2)',
                        }}
                      >
                        {preset}%
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setTpSlOpen((open) => !open)}
                  aria-expanded={tpSlOpen}
                  className="flex w-full items-center justify-between"
                >
                  <span className="label">Take profit and stop loss</span>
                  <Plus
                    size={13}
                    className="text-accent"
                    style={{ transform: tpSlOpen ? 'rotate(45deg)' : undefined }}
                    aria-hidden
                  />
                </button>
                {tpSlOpen && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="label" htmlFor="take-profit">
                        Take profit
                      </label>
                      <input
                        id="take-profit"
                        inputMode="decimal"
                        value={takeProfit}
                        onChange={(event) => setTakeProfit(event.target.value)}
                        placeholder="Price"
                        className="field num mt-2 text-[12px]"
                        style={{ borderLeft: '2px solid var(--color-long)' }}
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="stop-loss">
                        Stop loss
                      </label>
                      <input
                        id="stop-loss"
                        inputMode="decimal"
                        value={stopLoss}
                        onChange={(event) => setStopLoss(event.target.value)}
                        placeholder="Price"
                        className="field num mt-2 text-[12px]"
                        style={{ borderLeft: '2px solid var(--color-short)' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <dl className="flex flex-col gap-2 border-t border-line pt-4">
                {[
                  ['Entry price', entryPrice ? formatPrice(entryPrice) : '--'],
                  ['Quantity', `${formatQty(quantity, 5)} ${market.base}`],
                  ['Margin', `${formatNumber(margin, 2)} USDT`],
                  ['Fee at 0.05%', `${formatNumber(fee, 4)} USDT`],
                  ['Available margin', `${formatNumber(ACCOUNT.available, 2)} USDT`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-[11.5px] text-ink-3">{label}</dt>
                    <dd className="num text-[11.5px] text-ink-2">{value}</dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={!entryPrice}
                className={`btn py-3 text-[13px] ${side === 'long' ? 'btn-long' : 'btn-short'}`}
              >
                {side === 'long' ? 'Buy / long' : 'Sell / short'} {market.base}
              </button>

              <p className="text-[11px] leading-relaxed text-ink-3">
                Orders fill against simulated competition capital at live Binance prices. Nothing
                here reaches a real exchange book.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm order"
        >
          <div className="panel-glass w-full max-w-sm p-6">
            {placed ? (
              <>
                <span
                  className="flex size-11 items-center justify-center rounded-control border"
                  style={{
                    borderColor: 'rgba(52, 211, 153, 0.4)',
                    backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  }}
                >
                  <CheckCircle size={19} className="text-long" aria-hidden />
                </span>
                <h2 className="mt-4 text-base font-semibold text-ink">Order filled</h2>
                <p className="num mt-2 text-[12.5px] text-ink-2">
                  {side === 'long' ? 'Bought' : 'Sold'} {formatQty(quantity, 5)} {market.base} at{' '}
                  {formatPrice(entryPrice)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPlaced(false)
                    setConfirming(false)
                  }}
                  className="btn btn-primary mt-6 w-full py-2.5"
                >
                  Back to terminal
                </button>
              </>
            ) : (
              <>
                <h2 className="text-base font-semibold capitalize text-ink">
                  Confirm {side} order
                </h2>
                <p className="num mt-1.5 text-[12px] text-ink-3">
                  {market.pair} · {leverage} · {orderType}
                </p>

                <dl className="mt-5 flex flex-col gap-2 border-y border-line py-4">
                  {[
                    ['Entry price', formatPrice(entryPrice)],
                    ['Quantity', `${formatQty(quantity, 5)} ${market.base}`],
                    ['Notional', `${formatNumber(notional, 2)} USDT`],
                    ['Margin', `${formatNumber(margin, 2)} USDT`],
                    ['Fee', `${formatNumber(fee, 4)} USDT`],
                    ...(takeProfit ? ([['Take profit', takeProfit]] as [string, string][]) : []),
                    ...(stopLoss ? ([['Stop loss', stopLoss]] as [string, string][]) : []),
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <dt className="text-[12px] text-ink-3">{label}</dt>
                      <dd className="num text-[12px] text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="btn btn-ghost flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaced(true)}
                    className={`btn flex-1 py-2.5 ${side === 'long' ? 'btn-long' : 'btn-short'}`}
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-line px-4 py-5 lg:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2 text-[11.5px] text-ink-3">
            <Info size={12} aria-hidden />
            Market data streams from Binance USD-M futures. Positions, margin and equity are
            simulated competition figures.
          </span>
          <Link
            href={ROUTES.leaderboard}
            className="ml-auto flex items-center gap-1.5 text-[11.5px] text-accent hover:underline"
          >
            <Trophy size={12} aria-hidden />
            Competition leaderboard
          </Link>
        </div>
      </footer>
    </div>
  )
}
