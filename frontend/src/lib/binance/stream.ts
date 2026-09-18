/**
 * Thin WebSocket plumbing over Binance's public market streams.
 *
 * One socket per subscribed stream set, automatic reconnect with backoff, and a
 * hard stop path so a caller can tear down cleanly. The host follows whichever
 * market the REST layer settled on, because a network that blocks `*.binance.com`
 * blocks `fstream.binance.com` just as thoroughly.
 */

import { activeMarket, demoteToSpot } from "./endpoints"

export type StreamStatus = "connecting" | "open" | "reconnecting" | "closed"

export interface StreamMessage {
  stream: string
  data: unknown
}

export interface StreamHandle {
  close: () => void
}

interface OpenStreamOptions {
  /** Stream names, e.g. ["btcusdt@ticker", "btcusdt@depth20@100ms"]. */
  streams: string[]
  onMessage: (message: StreamMessage) => void
  onStatus: (status: StreamStatus) => void
}

/**
 * Streams that only exist on futures. Mark price carries the funding rate and
 * the index price, which spot has no equivalent for.
 */
const FUTURES_ONLY = ["@markPrice", "@forceOrder", "@compositeIndex"]

function isAvailable(name: string): boolean {
  return !FUTURES_ONLY.some((token) => name.includes(token))
}

/**
 * Depth frames arrive in two different shapes and the app has to read both:
 *
 *   futures  { b: [[price, qty]], a: [[price, qty]] }
 *   spot     { bids: [[price, qty]], asks: [[price, qty]] }
 *
 * Older futures builds also used `bids`/`asks`, so both keys are accepted.
 */
export function readDepth(data: unknown): { bids: unknown; asks: unknown } {
  const row = (data ?? {}) as { b?: unknown; a?: unknown; bids?: unknown; asks?: unknown }
  return { bids: row.bids ?? row.b, asks: row.asks ?? row.a }
}

/**
 * Subscribes to a combined stream. The browser answers Binance's ping frames
 * natively, so no manual heartbeat is required.
 *
 * If futures fails to open more than once, the layer demotes to the spot host
 * and reconnects immediately with the futures-only streams removed, rather than
 * retrying a host the network will never let through.
 */
export function openStream({ streams, onMessage, onStatus }: OpenStreamOptions): StreamHandle {
  let socket: WebSocket | null = null
  let attempt = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let disposed = false

  const connect = () => {
    if (disposed) return

    const profile = activeMarket()
    const usable = profile.derivatives ? streams : streams.filter(isAvailable)

    // Nothing left to subscribe to (a spot feed with only mark-price streams).
    if (usable.length === 0) {
      onStatus("closed")
      return
    }

    onStatus(attempt === 0 ? "connecting" : "reconnecting")

    const url = `${profile.wsBase}/stream?streams=${usable.join("/")}`
    socket = new WebSocket(url)

    socket.onopen = () => {
      attempt = 0
      onStatus("open")
    }

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as Partial<StreamMessage>
        if (typeof parsed.stream === "string" && parsed.data !== undefined) {
          onMessage({ stream: parsed.stream, data: parsed.data })
        }
      } catch {
        // A malformed frame is not worth tearing the socket down for.
      }
    }

    socket.onclose = () => {
      if (disposed) return
      attempt += 1

      if (profile.kind === "futures" && attempt >= 2) {
        // The futures host is not answering on this network.
        demoteToSpot()
        attempt = 0
        timer = setTimeout(connect, 300)
        return
      }

      // 1s, 2s, 4s, 8s, capped at 15s.
      const wait = Math.min(1000 * 2 ** (attempt - 1), 15000)
      timer = setTimeout(connect, wait)
    }

    socket.onerror = () => {
      socket?.close()
    }
  }

  connect()

  return {
    close: () => {
      disposed = true
      if (timer) clearTimeout(timer)
      socket?.close()
      socket = null
      onStatus("closed")
    },
  }
}

/** True while the document is visible, so polling can pause in background tabs. */
export function isDocumentVisible(): boolean {
  return typeof document === "undefined" || !document.hidden
}
