# COINX

Frontend for the CoinX trading competition platform. Timed crypto trading rounds on
live market data: everyone starts on the same balance, and the board ranks on percent
return.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

## Market data

All market data is live from Binance's public APIs. Nothing is hardcoded and
nothing is synthesised.

The app can read either Binance surface and picks one automatically:

| Feed | REST | WebSocket | Carries |
|---|---|---|---|
| futures (preferred) | `fapi.binance.com` | `fstream.binance.com` | Everything, plus mark price, funding and open interest |
| spot (fallback) | `data-api.binance.vision` | `data-stream.binance.vision` | Prices, candles, depth, trades |

| Layer | File | What it does |
|---|---|---|
| Symbol universe | `src/lib/binance/symbols.ts` | The 16 instruments, and the single place that defines "the market" |
| Feed selection | `src/lib/binance/endpoints.ts` | Both profiles, detection, and the active-market store |
| REST | `src/lib/binance/rest.ts` | Tickers, candles, depth, trades, mark price, funding, open interest, aggregates |
| WebSocket | `src/lib/binance/stream.ts` | Combined streams, reconnect with backoff, closed while the tab is hidden |
| Hooks | `src/lib/binance/hooks.ts` | REST seed plus live patching, and one combined workspace hook |

Main entry points:

- `useLiveTickers()` - the whole universe, REST snapshot every 15s patched by
  per-symbol `@ticker` streams.
- `useMarketWorkspace(base, interval)` - candles, book, tape, mark price and settled
  funding for one contract on **one** socket. Incoming frames are buffered in a ref
  and flushed once per animation frame, because depth at 100ms plus aggregate trades
  would otherwise re-render the tree dozens of times a second.
- `useMarketProfile()` - which feed is live, so views can render derivatives-only
  fields honestly instead of leaving them loading forever.
- `useSparklines(bases)` - hourly closes for the trend column.

Every symbol is deliberately listed on **both** Binance spot and USD-M futures under
an identical name, so a fallback never changes what an instrument means. That rules
out futures-only contracts such as `1000PEPEUSDT` (spot quotes plain `PEPEUSDT`, at a
thousandth of the price) and spot-only names such as `TONUSDT`, which futures
delisted. `NEAR` and `AAVE` stand in for those two.

### If Binance is blocked on your network

`*.binance.com` is blocked at the DNS level on some networks. On an Indonesian ISP
those names resolve to a regulator landing page (`lamanlabuh.aduankonten.id`) and
every request to them times out, even though the real Binance servers are reachable.

The app handles this on its own. It starts on futures, and when a request fails at
the network layer rather than with an HTTP status it demotes itself to Binance's
spot feed and retries the same call. The decision is remembered in `sessionStorage`,
so the cost is paid once per session, and a background probe on mount means a reload
is instant. A blocked host takes about 2.5 seconds to fail, which is why detection is
optimistic rather than a blocking probe: gating the first paint on it would make the
whole app feel broken.

To skip detection and pin a feed, set `NEXT_PUBLIC_BINANCE_MARKET` to `futures` or
`spot`. To route through a mirror or a proxy you control, point the host variables at
it in `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_BINANCE_MARKET=futures
NEXT_PUBLIC_BINANCE_FAPI=https://your-mirror.example
NEXT_PUBLIC_BINANCE_FSTREAM=wss://your-relay.example
```

Leaving a value blank falls back to the public host.

## Design rules

`skill.md` governs the visual surface. The rules the codebase actually enforces:

- **One theme, dark.** No section inverts. Tokens live in `app/globals.css`, and
  there is no pure `#000000` or `#ffffff` in the palette.
- **One accent.** `--color-accent` is a single blue; long/short/warn are semantic
  state colours, not accents. Gradients and outer glows are gone.
- **One radius system.** Controls 8px, cards 14px, panels 18px, pills full. Use the
  `.btn`, `.field`, `.panel`, `.pill` component classes rather than raw utilities.
- **No em-dashes.** ASCII only: `-` for ranges, `--` for an unknown value.
  `src/lib/format` exists partly to make that impossible to get wrong.
- **No emoji as UI, no hand-rolled icons.** Phosphor only. The sole `<svg>` elements
  in the app are three real charts: `CandlestickChart`, `DepthChart`, `Sparkline`.
- **Motion is motivated and gated.** `motion/react` for scroll reveals and the tape;
  everything collapses under `prefers-reduced-motion`. `window.addEventListener("scroll")`
  is banned, so the nav reads scroll position through Motion's `useScroll`.
- **Real states.** Loading, empty and error states are built into every market view
  via `src/components/common/StatePanel`.

## Routes

| Route | Notes |
|---|---|
| `/` | Landing page |
| `/markets`, `/markets/[symbol]` | Contract list and full workspace |
| `/dashboard` | Account overview and live watchlist |
| `/competitions`, `/competitions/[id]` | Listing and round terms |
| `/competitions/[id]/lobby` | Waiting room with countdown |
| `/competitions/[id]/trade` | Trading terminal |
| `/competitions/[id]/results` | Settlement and payouts |
| `/leaderboard`, `/wallet`, `/notifications`, `/profile` | Account surfaces |
| `/login`, `/register` | Auth |

Rows under `/dashboard`, `/wallet`, `/leaderboard`, `/notifications`, `/profile` and
the round sub-pages are behind `src/middleware.ts`, which checks the session cookie.

## Verifying the feed

Which feed is live is visible in the UI: the market header reads `Streaming futures`
or `Streaming spot`, and on spot the derivatives-only fields are replaced by their
spot equivalents rather than sitting empty.

To check the hosts themselves, bypassing the app entirely (this is what a
DNS-level block looks like):

```bash
# Futures. Fails on a blocked network; ETIMEDOUT after roughly 2.5s.
curl -s -o /dev/null -w "%{http_code}\n" "https://fapi.binance.com/fapi/v1/time"

# Spot. Binance's public market-data host, reachable on the same network.
curl -s "https://data-api.binance.vision/api/v3/time"
```

If the first fails and the second succeeds, the fallback is doing its job. Force a
feed with `NEXT_PUBLIC_BINANCE_MARKET` to confirm either path in isolation.

## Simulated data

Competition pools, entry fees, seat counts, positions, wallet balance, prizes and the
leaderboard are platform figures, not exchange data, and the UI labels them as
simulated wherever they appear. Only prices, candles, books, trades, funding and open
interest come from Binance.

Account data currently lives in `src/mocks/`. It is the natural seam for a real
backend: swap those imports for service calls and the pages are unchanged.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Phosphor Icons ·
Motion · Geist and Geist Mono via `next/font`
