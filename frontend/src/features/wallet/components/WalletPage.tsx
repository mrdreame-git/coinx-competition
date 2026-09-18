'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  DownloadSimple,
  ShieldWarning,
  UploadSimple,
  WarningCircle,
} from '@phosphor-icons/react'
import {
  ASSETS,
  DEPOSIT_ADDRESS,
  NETWORKS,
  TRANSACTIONS,
  WALLET_BALANCE,
} from '@/mocks/wallet'
import { useLiveTickers } from '@/lib/binance/hooks'
import { formatNumber, formatPrice, formatUsd, truncateMiddle } from '@/lib/format'
import type { TransactionType } from '@/types/wallet'
import Header from '@/components/layout/Header'
import { EmptyState } from '@/components/common/StatePanel'

type WalletTab = 'deposit' | 'withdraw'

const TX_FILTERS: { key: 'all' | TransactionType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'deposit', label: 'Deposits' },
  { key: 'withdrawal', label: 'Withdrawals' },
  { key: 'entry', label: 'Entry fees' },
  { key: 'prize', label: 'Prizes' },
]

const WITHDRAW_FEE = 2
const MIN_WITHDRAWAL = 20

export default function WalletPage() {
  const { byBase } = useLiveTickers()

  const [tab, setTab] = useState<WalletTab>('deposit')
  const [network, setNetwork] = useState('TRC20')
  const [txFilter, setTxFilter] = useState<'all' | TransactionType>('all')
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('500')
  const [address, setAddress] = useState('')

  const balance = Number.parseFloat(WALLET_BALANCE.replace(/,/g, ''))

  /** Valuations come from live prices, so the asset list moves with the market. */
  const holdings = useMemo(
    () =>
      ASSETS.map((asset) => {
        const quantity = Number.parseFloat(asset.amount.replace(/,/g, ''))
        if (asset.coin === 'USDT') {
          return { ...asset, quantity, price: 1, value: quantity }
        }
        const ticker = byBase.get(asset.coin)
        const price = ticker?.price ?? 0
        return { ...asset, quantity, price, value: quantity * price }
      }),
    [byBase],
  )

  const holdingsTotal = holdings.reduce((sum, asset) => sum + asset.value, 0)
  const filteredTransactions =
    txFilter === 'all'
      ? TRANSACTIONS
      : TRANSACTIONS.filter((transaction) => transaction.type === txFilter)

  const numericAmount = Number.parseFloat(amount || '0')
  const amountValid = Number.isFinite(numericAmount) && numericAmount >= MIN_WITHDRAWAL
  const addressValid = /^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33})$/.test(address.trim())
  const receives = Math.max(numericAmount - WITHDRAW_FEE, 0)
  const withdrawExceedsBalance = numericAmount > balance

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(DEPOSIT_ADDRESS)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="label">Simulated account balance</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Wallet
            </h1>
          </div>
          <dl className="flex divide-x divide-line">
            <div className="px-5 first:pl-0">
              <dt className="label">Cash</dt>
              <dd className="num mt-2 text-[19px] font-semibold text-ink">
                {formatNumber(balance, 2)} USDT
              </dd>
            </div>
            <div className="px-5 last:pr-0">
              <dt className="label">Total holdings</dt>
              <dd className="num mt-2 text-[19px] font-semibold text-ink">
                {holdingsTotal ? formatUsd(holdingsTotal) : '...'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          {/* Transfer panel */}
          <div className="panel overflow-hidden">
            <div role="tablist" aria-label="Transfer type" className="flex border-b border-line">
              {(['deposit', 'withdraw'] as WalletTab[]).map((option) => {
                const selected = option === tab
                return (
                  <button
                    key={option}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setTab(option)}
                    className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-medium capitalize transition-colors"
                    style={{
                      color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                      backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                      borderBottom: selected ? '2px solid var(--color-accent-deep)' : '2px solid transparent',
                    }}
                  >
                    {option === 'deposit' ? (
                      <DownloadSimple size={13} aria-hidden />
                    ) : (
                      <UploadSimple size={13} aria-hidden />
                    )}
                    {option}
                  </button>
                )
              })}
            </div>

            <div className="p-6">
              <div>
                <label className="label" htmlFor="network">
                  Network
                </label>
                <select
                  id="network"
                  value={network}
                  onChange={(event) => setNetwork(event.target.value)}
                  className="field mt-2"
                >
                  {NETWORKS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11.5px] text-ink-3">
                  The network must match the one you send from. USDT sent on the wrong chain is not
                  recoverable.
                </p>
              </div>

              {tab === 'deposit' ? (
                <div className="mt-6">
                  <label className="label" htmlFor="deposit-address">
                    Deposit address
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="deposit-address"
                      readOnly
                      value={DEPOSIT_ADDRESS}
                      className="field num flex-1 text-[12px]"
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="btn btn-secondary shrink-0 px-4"
                      aria-label="Copy deposit address"
                    >
                      {copied ? (
                        <>
                          <Check size={13} aria-hidden />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} aria-hidden />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="num mt-2 text-[11px] text-ink-3">
                    {truncateMiddle(DEPOSIT_ADDRESS, 12, 10)} · {network}
                  </p>

                  <div className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
                    <div className="bg-surface px-4 py-3.5">
                      <p className="label">Minimum deposit</p>
                      <p className="num mt-2 text-[14px] text-ink">10 USDT</p>
                    </div>
                    <div className="bg-surface px-4 py-3.5">
                      <p className="label">Credited after</p>
                      <p className="num mt-2 text-[14px] text-ink">2 confirmations</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-control border border-warn/25 bg-warn/6 px-3.5 py-3">
                    <ShieldWarning size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden />
                    <p className="text-[11.5px] leading-relaxed text-ink-2">
                      Send USDT only, and only on the {network} network. Deposits of other assets,
                      or of USDT on a different chain, are not credited.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-5">
                  <div>
                    <label className="label" htmlFor="withdraw-address">
                      Destination address
                    </label>
                    <input
                      id="withdraw-address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="0x... or T..."
                      aria-invalid={address.length > 0 && !addressValid}
                      className="field num mt-2 text-[12px]"
                    />
                    {address.length > 0 && !addressValid && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-short">
                        <WarningCircle size={12} aria-hidden />
                        That does not look like an EVM or Tron address.
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="label" htmlFor="withdraw-amount">
                        Amount
                      </label>
                      <span className="num text-[11.5px] text-ink-3">
                        Available {formatNumber(balance, 2)} USDT
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        id="withdraw-amount"
                        inputMode="decimal"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        className="field num flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setAmount(String(balance))}
                        className="btn btn-secondary shrink-0 px-4"
                      >
                        Max
                      </button>
                    </div>
                    {withdrawExceedsBalance && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-short">
                        <WarningCircle size={12} aria-hidden />
                        That is more than your available balance.
                      </p>
                    )}
                    {!withdrawExceedsBalance && amountValid && (
                      <p className="mt-2 text-[11.5px] text-ink-3">
                        Minimum withdrawal is {MIN_WITHDRAWAL} USDT.
                      </p>
                    )}
                  </div>

                  <dl className="flex flex-col gap-2.5 rounded-card border border-line bg-surface-2/50 px-4 py-4">
                    {[
                      ['Network fee', `${WITHDRAW_FEE} USDT`],
                      ['You receive', `${formatNumber(receives, 2)} USDT`],
                      ['Balance after', `${formatNumber(Math.max(balance - numericAmount, 0), 2)} USDT`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between">
                        <dt className="text-[12.5px] text-ink-3">{label}</dt>
                        <dd
                          className="num text-[12.5px]"
                          style={{
                            color: label === 'You receive' ? 'var(--color-long)' : 'var(--color-ink)',
                          }}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    disabled={!addressValid || !amountValid || withdrawExceedsBalance}
                    className="btn btn-primary w-full py-3"
                  >
                    Request withdrawal
                  </button>
                  <p className="text-[11.5px] leading-relaxed text-ink-3">
                    Withdrawals from a competition balance are reviewed before broadcast. Requests
                    placed after 18:00 UTC settle on the next working day.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Holdings */}
          <div className="flex flex-col gap-6">
            <div className="panel overflow-hidden">
              <div className="border-b border-line px-5 py-3">
                <h2 className="text-[14px] font-semibold text-ink">Holdings</h2>
              </div>
              <ul>
                {holdings.map((asset) => (
                  <li
                    key={asset.coin}
                    className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0"
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-control text-[12px] font-semibold text-white"
                      style={{ backgroundColor: 'var(--color-accent-deep)' }}
                    >
                      {asset.coin.slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-ink">{asset.coin}</span>
                      <span className="block text-[11.5px] text-ink-3">{asset.name}</span>
                    </span>
                    <span className="text-right">
                      <span className="num block text-[13px] text-ink">
                        {formatNumber(asset.quantity, asset.coin === 'USDT' ? 2 : 4)}
                      </span>
                      <span className="num block text-[11.5px] text-ink-3">
                        {asset.price ? formatUsd(asset.value) : 'awaiting price'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
                <span className="text-[12.5px] text-ink-3">Total</span>
                <span className="num text-[13px] font-semibold text-ink">
                  {holdingsTotal ? formatUsd(holdingsTotal) : '...'}
                </span>
              </div>
            </div>

            <div className="rounded-card border border-line bg-surface p-5">
              <p className="text-[13px] font-semibold text-ink">What this balance is</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">
                Competition capital is simulated. Coin valuations beside each holding are priced
                live from Binance, so the totals move with the market even though the balance itself
                is a platform figure.
              </p>
            </div>
          </div>
        </div>

        {/* History */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-[15px] font-semibold text-ink">Transaction history</h2>
            <div role="tablist" aria-label="Filter transactions" className="flex flex-wrap gap-1.5">
              {TX_FILTERS.map((filter) => {
                const selected = txFilter === filter.key
                return (
                  <button
                    key={filter.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setTxFilter(filter.key)}
                    className="rounded-control px-3 py-2 text-[12px] font-medium transition-colors"
                    style={{
                      color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                      backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                    }}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="panel mt-4 overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <EmptyState
                title="Nothing in this category"
                body="Once a transfer, entry fee or prize lands in this category it will be listed here with its amount and timestamp."
              />
            ) : (
              <>
                <div
                  className="hidden items-center gap-4 border-b border-line bg-surface-2/60 px-5 py-2.5 sm:grid"
                  style={{ gridTemplateColumns: 'minmax(0,1.6fr) 130px 130px 130px' }}
                >
                  <span className="label">Entry</span>
                  <span className="label">Type</span>
                  <span className="label">When</span>
                  <span className="label text-right">Amount</span>
                </div>
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0 sm:grid sm:gap-4"
                    style={{ gridTemplateColumns: 'minmax(0,1.6fr) 130px 130px 130px' }}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-control border"
                        style={{
                          borderColor: transaction.positive
                            ? 'rgba(52, 211, 153, 0.3)'
                            : 'rgba(248, 113, 113, 0.3)',
                          color: transaction.positive
                            ? 'var(--color-long)'
                            : 'var(--color-short)',
                        }}
                      >
                        {transaction.positive ? (
                          <DownloadSimple size={13} aria-hidden />
                        ) : (
                          <UploadSimple size={13} aria-hidden />
                        )}
                      </span>
                      <span className="truncate text-[13px] text-ink">{transaction.label}</span>
                    </span>
                    <span className="text-[12px] text-ink-3 capitalize">{transaction.type}</span>
                    <span className="num text-[12px] text-ink-3">{transaction.time}</span>
                    <span
                      className="num text-right text-[13px]"
                      style={{
                        color: transaction.positive ? 'var(--color-long)' : 'var(--color-short)',
                      }}
                    >
                      {transaction.positive ? '+' : ''}
                      {formatNumber(transaction.amount)} USDT
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
