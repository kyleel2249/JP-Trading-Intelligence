## JP Trading Intelligence

Cloudflare-first multi-market research and trading terminal. This initial foundation provides a dark, full-width chart workspace, local candle-based strategy signals, paper-only ticket, browser journal and initial API Worker.

### Included
- Responsive terminal interface with adjustable candle width (2–24 px), spacing (0–16 px), chart height (300–1000 px), volume height (50–300 px), and zoom (1–200x).
- EMA20/EMA50, VWAP and approximate support/resistance overlays, OHLC labels, volume panel.
- Public spot candle REST adapter options for Binance, Bybit, Bitget, OKX; Binance spot websocket candles and mini-ticker.
- Eight candle-driven strategy prototypes: EMA trend, sweep/reclaim, FVG, RSI reversal, VWAP reversion, range breakout, volume impulse, structure BOS.
- Twelve intelligence status modules spanning technical, structure, order-flow/liquidity, volume, regime, news, fundamentals, macro, forecast, portfolio, execution and integrity.
- Alpha/confluence views, local paper ticket, browser paper account, forecast journal/export and simplified candle research test.
- Cloudflare Worker endpoints for health, candle proxy, ticker, provider universe, intelligence status, risk disclosure, execution validation and D1 forecasts.

### Local development
Node 20+, install dependencies, then run npm install, npm run check and npm run dev.


### Cloudflare setup
1. Create D1 named jp-trading-intelligence.
2. Replace placeholder database UUID in wrangler.toml with the real ID.
3. Wrangler login; apply migrations using `npx wrangler d1 migrations apply jp-trading-intelligence --remote`.
4. Test API health, risk policy and intelligence-status endpoints.
5. Deploy using npm run deploy after reviewing Worker/static-assets settings.

### API endpoints
- GET /api/health
- GET /api/risk/policy
- GET /api/intelligence/status
- GET /api/market/universe
- GET /api/market/candles with exchange, symbol, interval and limit query values
- GET /api/market/ticker
- GET or POST /api/journal
- POST /api/execution/validate (validation only; no order submission)

### Coverage caveats
The current candle adapters are spot-market data only. Futures/CFD selectors are informational and are not yet backed by trading data or execution adapters. Kraken/Coinbase selector choices are placeholders. The Worker does not place authenticated exchange orders. Live trading, broker credentials, private balances, server paper execution, leverage/margin, funding/liquidation feeds, CFD broker integrations, reconciliation and verified multi-exchange failover remain unimplemented.


### Safety limitations
Live execution is disabled. Paper orders are simulated in the browser and are not server-authoritative. The basic paper ticket checks order notional and position count only; it does not correctly model netting, fee/funding, leverage, slippage, market impact, portfolio correlations, loss limits or authoritative positions. The quick research test is a simple in-sample directional proxy, not a validated backtest.


### Roadmap
Regime engine, order-flow/liquidity, Monte Carlo, portfolio survival, adaptive strategies and decay monitoring, market fingerprints, opportunity radar, liquidation intelligence, macro/event research, execution optimization, trade memory, collision detection, counterfactuals, token integrity, institutional filing research, forecast calibration, replay, immutable audits, futures/CFD integrations and server-side risk/execution.
