# JP Trading Intelligence

Cloudflare-first multi-market research and trading terminal. This initial foundation provides a dark, full-width chart workspace, local candle-based strategy signals, paper-only ticket, browser journal and initial API Worker.

## Included
- Liquidity Behavior & Footprint Engine 2.0: bounded 500-event synchronized timeline joining sampled price-level depth diffs, venue trade prints and candle reactions. New/disappearing levels, quantity reductions, replenishment estimates, trade/quote interactions, failed breaks, displacement and low-confidence absorption candidates are tagged with timestamps, venue, symbol, market and evidence confidence.
- Event classifications distinguish observed data from inference. Sampled depth changes cannot prove cancellations, spoofing, queue priority or intent; trade/depth timestamps are not a fully synchronized exchange-native event stream. The timeline is session-memory only and resets on market/symbol changes.
- Persistent local order-book depth snapshots (8-second sampling, 240-point cap) keyed by exchange/instrument/symbol; local bid/ask liquidity change comparisons, snapshot imbalance history and chart liquidity heatmap bands.
- Candle-level aggressor delta table from buffered live trade prints, with unknown-side volume and limited-history warnings; flow is venue-local, not consolidated.
- Liquidity heatmap toggle on the chart; historical depth samples overlay recent candles, and snapshot-based depth trends remain explicitly separate from true reconstructed historical order books.
- Order-book impact estimator with average fill, notional, partial-depth remainder and snapshot price impact; no real orders are transmitted.

- Responsive terminal interface with adjustable candle width (2–24 px), spacing (0–16 px), chart height (300–1000 px), volume height (50–300 px), and zoom (1–200x).
- EMA20/EMA50, VWAP and approximate support/resistance overlays, OHLC labels, volume panel.
- Public spot candle REST adapter options for Binance, Bybit, Bitget, OKX; Binance spot websocket candles and mini-ticker.
- Live Bitget trade-flow stream on the chart: rolling 60-second buy/sell volume, notional, net delta, aggressor pressure, side-coverage, buffered CVD, latest trade marker and sweep/reclaim watch labels; stream reconnects with exponential backoff and is clearly venue-specific.
- Eight candle-driven strategy prototypes: EMA trend, sweep/reclaim, FVG, RSI reversal, VWAP reversion, range breakout, volume impulse, structure BOS.
- Twelve intelligence status modules spanning technical, structure, order-flow/liquidity, volume, regime, news, fundamentals, macro, forecast, portfolio, execution and integrity.
- Alpha/confluence views, local paper ticket, browser paper account, forecast journal/export and simplified candle research test.
- Cloudflare Worker endpoints for health, candle proxy, ticker, provider universe, intelligence status, risk disclosure, execution validation and D1 forecasts.

## Project structure
- `public/`: browser assets only (`index.html`, `styles.css`, `app.js`)
- `worker/index.js`: API Worker code
- `migrations/`: D1 SQL migrations
- `docs/`: architecture and coverage notes
- `.github/workflows/ci.yml`: syntax and repository structure checks

## Local development
Node 20+, then:
```bash
npm install
npm run check
npm run dev
``

## Cloudflare Workers deployment
1. Create a D1 database named `jp-trading-intelligence`.
2. Replace the placeholder database UUID in `wrangler.toml` with the actual database ID.
3. Run `npx wrangler login`.
4. Apply migrations: `npx wrangler d1 migrations apply jp-trading-intelligence --remote`.
5. Validate API health, risk policy and intelligence-status endpoints.
6. Deploy: `npm run deploy`.

Wrangler serves only the `public/` directory as static assets. Backend source, dependencies, migrations and documentation are excluded from the asset upload.

## API endpoints
- GET /api/health
- GET /api/risk/policy
- GET /api/intelligence/status
- GET /api/market/universe
- GET /api/market/candles with exchange, symbol, interval and limit query values
- GET /api/market/ticker
- GET or POST /api/journal
- POST /api/execution/validate (validation only; no order submission)

## Coverage caveats
The current candle adapters are spot-market data only. Futures/CFD selectors are informational and are not yet backed by trading data or execution adapters. Kraken/Coinbase selector choices are placeholders. The Worker does not place authenticated exchange orders. Live trading, broker credentials, private balances, server paper execution, leverage/margin, funding/liquidation feeds, CFD broker integrations, reconciliation and verified multi-exchange failover remain unimplemented.

## Safety limitations
Live execution is disabled. Paper orders are simulated in the browser and are not server-authoritative. The basic paper ticket checks order notional and position count only; it does not correctly model netting, fee/funding, leverage, slippage, market impact, portfolio correlations, loss limits or authoritative positions. The quick research test is a simple in-sample directional proxy, not a validated backtest.

## Roadmap
Regime engine, order-flow/liquidity, Monte Carlo, portfolio survival, adaptive strategies and decay monitoring, market fingerprints, opportunity radar, liquidation intelligence, macro/event research, execution optimization, trade memory, collision detection, counterfactuals, token integrity, institutional filing research, forecast calibration, replay, immutable audits, futures/CFD integrations and server-side risk/execution.

## Session Intelligence 4.0
- IANA timezone-aware Sydney, Tokyo, London and New York clocks; DST is resolved from each market's timezone rather than fixed UTC offsets.
- Live overlap display, session transition memory, per-session high/low/range/volume aggregation, and candle-tagged session history.
- Conservative setup classifier for failed recent-high/low breaks and session range expansion candidates, with transparent evidence notes and low/moderate candidate scores.
- Session performance ledger accepts explicitly recorded outcomes, calculates win rate, net R and sample quality, and exposes an Alpha evidence contract. Alpha weighting is ineligible until a session has at least 30 recorded outcomes; no automatic empirical weighting or performance claims are made from unlabelled data.
- The default session windows use local market hours (Sydney 08:00–17:00, Tokyo 09:00–18:00, London 08:00–17:00, New York 08:00–17:00). Windows are configurable through the engine API and validated against IANA timezones.
- Session range history and outcome records are currently browser-runtime memory only; no D1 persistence or user-facing outcome-entry form is included in this milestone. Candle sampling follows the selected chart timeframe, so intrabar sweeps and exact session-open prices can be missed.
