/**
 * Binance market-data endpoints.
 *
 * COINX can read from either of Binance's two public market-data surfaces, and
 * every price, candle, book and fill in the app comes from whichever one is
 * active here:
 *
 *   futures   https://fapi.binance.com            wss://fstream.binance.com
 *   spot      https://data-api.binance.vision     wss://data-stream.binance.vision
 *
 * Futures is preferred: it carries mark price, funding rate and open interest,
 * which the terminal and the market detail page display. But not every network
 * can reach `*.binance.com` at all. Some Indonesian ISPs redirect those names to
 * a regulator landing page, so every request to them times out while the real
 * servers stay perfectly reachable. Binance's public spot feed lives on the
 * separate `*.binance.vision` domains, which those networks do not touch, so the
 * app degrades to spot rather than showing nothing.
 *
 * Resolution is optimistic rather than a blocking probe, because a blocked host
 * takes roughly 2.5 seconds to fail and gating the first paint on that would make
 * the whole app feel broken. Instead the app starts on futures, and any network
 * level failure demotes it to spot for the rest of the session. A background
 * probe warms the decision so a reload is instant.
 */

export type MarketKind = "futures" | "spot"

export interface MarketProfile {
  kind: MarketKind
  /** Human label shown in the UI when the feed is not futures. */
  label: string
  /** REST host with no trailing slash. */
  restBase: string
  /** Versioned path prefix for this market. */
  restPrefix: string
  /** WebSocket host with no trailing slash. */
  wsBase: string
  /** Whether mark price, funding rate and open interest are available. */
  derivatives: boolean
}

const stripTrailing = (value: string) => value.replace(/\/+$/, "")

export const FUTURES_PROFILE: MarketProfile = {
  kind: "futures",
  label: "USD-M futures",
  restBase: stripTrailing(process.env.NEXT_PUBLIC_BINANCE_FAPI || "https://fapi.binance.com"),
  restPrefix: "/fapi/v1",
  wsBase: stripTrailing(process.env.NEXT_PUBLIC_BINANCE_FSTREAM || "wss://fstream.binance.com"),
  derivatives: true,
}

export const SPOT_PROFILE: MarketProfile = {
  kind: "spot",
  label: "spot",
  restBase: stripTrailing(
    process.env.NEXT_PUBLIC_BINANCE_SPOT_API || "https://data-api.binance.vision",
  ),
  restPrefix: "/api/v3",
  wsBase: stripTrailing(
    process.env.NEXT_PUBLIC_BINANCE_SPOT_STREAM || "wss://data-stream.binance.vision",
  ),
  derivatives: false,
}

/** `auto` (default), `futures`, or `spot`. Pin it to skip detection entirely. */
const FORCED = (process.env.NEXT_PUBLIC_BINANCE_MARKET || "auto").toLowerCase()
const PINNED: MarketProfile | null =
  FORCED === "futures" ? FUTURES_PROFILE : FORCED === "spot" ? SPOT_PROFILE : null

const CACHE_KEY = "coinx.binance.market"
/** A blocked host fails in ~2.5s, so the probe gives up just before that. */
const PROBE_TIMEOUT_MS = 2200

let active: MarketProfile = PINNED ?? FUTURES_PROFILE
let settled = PINNED !== null

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

/** The profile every request and socket should currently use. */
export function activeMarket(): MarketProfile {
  return active
}

/** True once the market has been decided (pinned, cached, or probed). */
export function isMarketSettled(): boolean {
  return settled
}

/**
 * Called when futures proves unreachable. Idempotent, and a no-op when the
 * market is pinned or already on spot.
 */
export function demoteToSpot(): void {
  if (PINNED || active.kind === "spot") return
  active = SPOT_PROFILE
  settled = true
  cache("spot")
  emit()
}

function cache(kind: MarketKind) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(CACHE_KEY, kind)
  } catch {
    // Private mode and storage quotas are not worth failing a request over.
  }
}

function readCache(): MarketKind | null {
  if (typeof window === "undefined") return null
  try {
    const value = window.sessionStorage.getItem(CACHE_KEY)
    return value === "spot" || value === "futures" ? value : null
  } catch {
    return null
  }
}

export function subscribeMarket(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/* -------------------------------------------------------------------------- */
/* Detection                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Confirms a host is reachable *and* speaking Binance's JSON API. A DNS-level
 * block sometimes answers with an HTML landing page, so a bare 200 is not
 * enough: the body has to carry the expected field.
 */
async function reachable(url: string, field: string): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" })
    if (!res.ok) return false
    const body = (await res.json()) as Record<string, unknown>
    return typeof body[field] === "number"
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

let probe: Promise<MarketProfile> | null = null

/**
 * Resolves which market to use, at most once per session. Safe to call from
 * several places concurrently.
 */
export function resolveMarket(): Promise<MarketProfile> {
  if (PINNED) return Promise.resolve(PINNED)
  if (probe) return probe

  const cached = readCache()
  if (cached === "spot") demoteToSpot()
  if (cached) {
    settled = true
    return Promise.resolve(active)
  }

  probe = (async () => {
    const ok = await reachable(`${FUTURES_PROFILE.restBase}${FUTURES_PROFILE.restPrefix}/time`, "serverTime")
    if (ok) {
      settled = true
      cache("futures")
      return FUTURES_PROFILE
    }
    // Futures did not answer, so confirm spot does before committing to it.
    const spotOk = await reachable(`${SPOT_PROFILE.restBase}${SPOT_PROFILE.restPrefix}/time`, "serverTime")
    if (spotOk) {
      demoteToSpot()
      return SPOT_PROFILE
    }
    // Neither answered: stay on futures so error copy names the preferred host.
    settled = true
    return FUTURES_PROFILE
  })()

  return probe
}

/**
 * Warms the decision without awaiting it, so the first blocked request only has
 * to pay the timeout once and later page loads start already resolved. No-op on
 * the server.
 */
export function warmMarket(): void {
  if (typeof window === "undefined") return
  void resolveMarket()
}

/** Full URL for a REST path on the given profile. */
export function restUrl(profile: MarketProfile, path: string): string {
  return `${profile.restBase}${profile.restPrefix}${path}`
}

/**
 * The active profile, or a specific kind. Used by fetchers that must keep
 * pointing at futures so a fallback retry reads the same endpoints.
 */
export function profileFor(kind: MarketKind): MarketProfile {
  return kind === "spot" ? SPOT_PROFILE : FUTURES_PROFILE
}
