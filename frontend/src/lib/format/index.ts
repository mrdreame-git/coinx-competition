/**
 * Number and time formatting for market data.
 *
 * Deliberately ASCII-only: skill.md Section 9.G bans the em-dash and en-dash
 * characters, so an unknown value renders as "--" and ranges use a hyphen.
 */

const PLACEHOLDER = "--"

/** Decimal places that suit a price's magnitude, so 0.00001234 and 118245.3 both read well. */
export function priceDigits(value: number): number {
  const abs = Math.abs(value)
  if (abs === 0) return 2
  if (abs >= 1000) return 2
  if (abs >= 100) return 3
  if (abs >= 1) return 4
  if (abs >= 0.01) return 5
  return 8
}

export function formatPrice(value: number, digits?: number): string {
  if (!Number.isFinite(value) || value === 0) return PLACEHOLDER
  const decimals = digits ?? priceDigits(value)
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Quantity is always shown to 4 significant decimals, mono-spaced by the caller. */
export function formatQty(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return PLACEHOLDER
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** 1_820_000_000 -> "1.82B" */
export function formatCompact(value: number, digits = 2): string {
  if (!Number.isFinite(value) || value === 0) return PLACEHOLDER
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value)
}

/** 1_820_000_000 -> "$1.82B" */
export function formatUsd(value: number, digits = 2): string {
  if (!Number.isFinite(value) || value === 0) return PLACEHOLDER
  return `$${formatCompact(value, digits)}`
}

/** Always signed, so direction is never ambiguous: "+1.24%" / "-0.42%" */
export function formatPct(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return PLACEHOLDER
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`
}

/** Unsigned percent, for funding rates and spreads. */
export function formatPctPlain(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return PLACEHOLDER
  return `${value.toFixed(digits)}%`
}

export function formatSigned(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return PLACEHOLDER
  return `${value >= 0 ? "+" : ""}${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return PLACEHOLDER
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** USDT amount with the unit appended. */
export function formatUsdt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return PLACEHOLDER
  return `${formatNumber(value, digits)} USDT`
}

/** 88_400 -> "24:33:20" for a millisecond duration. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00:00"
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":")
}

/** Clock time for a tape or funding row. */
export function formatClock(epochMs: number, withSeconds = true): string {
  if (!Number.isFinite(epochMs) || epochMs <= 0) return PLACEHOLDER
  return new Date(epochMs).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
  })
}

export function formatDate(epochMs: number): string {
  if (!Number.isFinite(epochMs) || epochMs <= 0) return PLACEHOLDER
  return new Date(epochMs).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatRelative(epochMs: number, now = Date.now()): string {
  if (!Number.isFinite(epochMs) || epochMs <= 0) return PLACEHOLDER
  const seconds = Math.max(0, Math.round((now - epochMs) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

/** Truncates a long wallet address without losing the identifying head and tail. */
export function truncateMiddle(value: string, head = 10, tail = 8): string {
  if (value.length <= head + tail + 3) return value
  return `${value.slice(0, head)}...${value.slice(-tail)}`
}

/* ------------------------------------------------------------------ */
/* Backwards-compatible helpers still used by wallet and leaderboard.  */
/* ------------------------------------------------------------------ */

export function formatCurrency(value: number, currency = "USDT"): string {
  return `${value.toLocaleString("en-US")} ${currency}`
}

export function formatCryptoAmount(value: string | number): string {
  return Number(value).toFixed(7)
}

export function formatPercentage(value: number, sign = true): string {
  return `${sign && value > 0 ? "+" : ""}${value}%`
}

export function formatPnl(value: number, currency = "USDT"): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)} ${currency}`
}

export { PLACEHOLDER as EMPTY_VALUE }
