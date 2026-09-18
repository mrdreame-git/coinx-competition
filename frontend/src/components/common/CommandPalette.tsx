'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { useLiveTickers } from '@/lib/binance/hooks'
import { formatPrice } from '@/lib/format'
import ChangeTag from '@/components/common/ChangeTag'

interface PaletteItem {
  id: string
  label: string
  meta: string
  section: string
  /** Extra tokens that should match the query. */
  keywords: string[]
  run: () => void
}

const PAGE_ITEMS: { label: string; meta: string; route: string; keywords: string[] }[] = [
  { label: 'Dashboard', meta: 'Overview', route: ROUTES.dashboard, keywords: ['home', 'account', 'summary'] },
  { label: 'Markets', meta: 'All contracts', route: ROUTES.markets, keywords: ['trade', 'prices', 'tickers'] },
  { label: 'Competitions', meta: 'Browse rounds', route: ROUTES.competitions, keywords: ['challenge', 'round', 'enter'] },
  { label: 'Leaderboard', meta: 'Live ranking', route: ROUTES.leaderboard, keywords: ['rank', 'top', 'standings'] },
  { label: 'Wallet', meta: 'Balance and transfers', route: ROUTES.wallet, keywords: ['deposit', 'withdraw', 'balance'] },
  { label: 'Notifications', meta: 'Alerts', route: ROUTES.notifications, keywords: ['messages', 'alerts'] },
  { label: 'Profile', meta: 'Security and preferences', route: ROUTES.profile, keywords: ['account', 'settings', '2fa'] },
]

export default function CommandPalette() {
  const router = useRouter()
  const { tickers } = useLiveTickers()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<PaletteItem[]>(() => {
    const pages = PAGE_ITEMS.map<PaletteItem>((item) => ({
      id: `page-${item.label.toLowerCase()}`,
      label: item.label,
      meta: item.meta,
      section: 'Pages',
      keywords: item.keywords,
      run: () => router.push(item.route),
    }))

    const markets = tickers.map<PaletteItem>((ticker) => ({
      id: `market-${ticker.symbol}`,
      label: ticker.pair,
      meta: formatPrice(ticker.price),
      section: 'Markets',
      keywords: [ticker.base.toLowerCase(), ticker.name.toLowerCase(), 'usdt'],
      run: () => router.push(ROUTES.marketDetail(ticker.base)),
    }))

    return [...pages, ...markets]
  }, [router, tickers])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.meta.toLowerCase().includes(needle) ||
        item.keywords.some((keyword) => keyword.includes(needle)),
    )
  }, [items, query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelected(0)
  }, [])

  /* Global open shortcut. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => {
          if (prev) setQuery('')
          return !prev
        })
        setSelected(0)
      }
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  /* Arrow and enter handling only while the dialog is open. */
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (filtered.length === 0) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelected((index) => (index + 1) % filtered.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelected((index) => (index - 1 + filtered.length) % filtered.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const item = filtered[selected]
        if (item) {
          item.run()
          close()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, filtered, selected, close])

  if (!open) return null

  const sections = [...new Set(filtered.map((item) => item.section))]
  let flatIndex = -1

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]"
      style={{ backgroundColor: 'rgba(8, 9, 11, 0.72)' }}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search COINX"
        className="panel-glass w-full max-w-xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <MagnifyingGlass size={15} className="shrink-0 text-ink-3" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search markets and pages"
            aria-label="Search markets and pages"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="num rounded border border-line px-1.5 py-0.5 text-[10px] text-ink-3">
            Esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-[13px] text-ink-2">
              Nothing matches &ldquo;{query}&rdquo;. Try a symbol such as BTC, or a page name.
            </p>
          )}

          {sections.map((section) => (
            <div key={section}>
              <p className="label px-4 pb-1.5 pt-3">{section}</p>
              {filtered
                .filter((item) => item.section === section)
                .map((item) => {
                  flatIndex += 1
                  const index = flatIndex
                  const active = index === selected
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setSelected(index)}
                      onClick={() => {
                        item.run()
                        close()
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{ backgroundColor: active ? 'var(--color-accent-soft)' : undefined }}
                    >
                      <span
                        className="flex-1 truncate text-[13px]"
                        style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink-2)' }}
                      >
                        {item.label}
                      </span>
                      {item.section === 'Markets' ? (
                        <span className="flex items-center gap-2.5">
                          <span className="num text-[12px] text-ink-2">{item.meta}</span>
                          {(() => {
                            const ticker = tickers.find((t) => `market-${t.symbol}` === item.id)
                            return ticker ? <ChangeTag value={ticker.changePct} size="sm" caret={false} /> : null
                          })()}
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-ink-3">{item.meta}</span>
                      )}
                    </button>
                  )
                })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-3">
          <span>Up and down to move</span>
          <span>Enter to open</span>
        </div>
      </div>
    </div>
  )
}
