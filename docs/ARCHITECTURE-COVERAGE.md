## JP Trading Intelligence — architecture coverage map

This document separates what is implemented in the current initial build, what is candle-derived, and what still requires provider/account infrastructure. A module label or placeholder is not proof of live data or runtime validation.


## Market terminal and data flow

The chart is the primary workspace and full width. Its selected market, timeframe, and candle array feed the local overlays and current strategy library. Adjustable controls: candle body width, spacing, chart height, volume height, 1–200 zoom, wheel zoom, timeframe buttons, symbol picker, exchange picker, drawing tools and indicator toggles. The Worker candle endpoint proxies public REST candles for Binance, Bybit, Bitget and OKX spot; Binance spot also uses a public kline WebSocket. The Worker is the same-origin data bridge for chart candles. The current UI disables candles for futures/CFDs until adapters exist, rather than pretending the spot feed is derivative data.

Market data provider future adapters should implement normalized OHLCV, timestamps, source health, retry/backoff, rate-limit handling, market type and symbol mapping. Exchange adapter coverage must be provider-specific and independently checked. Planned exchange groups: Binance, Bitget, Bybit, OKX, Kraken, Coinbase, broker/CFD vendors, OANDA and Alpaca where market/product permissions allow.

## Intelligence engine inventory

- Multi-timeframe technical engine: trend, EMA alignment, momentum, volatility and pattern evidence. Initial candle-only EMA/RSI approximations are active.
- Market structure / Smart Money Concepts: pivots, BOS/CHOCH, sweeps, reclaim, displacement, premium/discount, order blocks, FVGs, setup lifecycle and invalidation. Current sweep/FVG/BOS are simple candle approximations.
- Order-flow and liquidity intelligence: order book imbalance, spread, depth, absorption, liquidity pools, volume delta, footprint/tape and flow anomalies. Current visible book is a UI mock and is not real depth; production engine needs a verified depth/tick source.
- Volume intelligence: RVOL, volume momentum, volume profile, breakout participation, abnormal volume and price-volume divergence. A basic candle-volume impulse is active.
- Market Regime engine: trend/range/volatility state, transitions, regime confidence, persistence, asset/session classification and regime-specific strategy permissions. Current regime read is a rough candle-return/range proxy.
- News/sentiment: headlines, source reliability, event severity, sentiment, topic relevance, freshness, impact scoring, event windows and bias. Not connected in this initial version.
- Fundamental and valuation research: financials, earnings, ratios, valuation models, token fundamentals, equity/company data and source coverage. Not connected in this initial version.
- Macro/event intelligence: economic calendar, central-bank events, CPI/NFP, rates, macro surprise, correlation changes and event risk windows. Not connected in this initial version.
- Forecast engine: directional and range predictions by horizon, probability, calibration, uncertainty, resolution and forecast-error metrics. Local forecast forms exist; automatic resolution/calibration is not yet integrated.
- Portfolio intelligence: equity, balances, exposure, P&L, realized/unrealized separation, concentration, correlations, capital utilization, portfolio limits, survival probability and stress scenarios. Initial local paper portfolio is not server authoritative.
- Execution-quality engine: slippage, fill probability, liquidity, spread, latency, market impact, routing choice, execution outcomes and retry safety. No real order router is enabled.
- Integrity / manipulation: token legitimacy, wallet attribution, wash trading/flow anomalies, market integrity, suspicious volume, source reliability and fraud indicators. Not connected to chain or third-party feeds.
- Adaptive strategy feedback: expectancy, decay, false-sweep tracking, setup-specific outcomes, session windows, adaptive confirmation, strategy health, quarantine and research promotion. Current strategies are immediate candle rules only; no learning loop.

## Strategy library

Active candle-driven prototypes: EMA trend, sweep/reclaim, three-bar FVG, RSI reversal, VWAP reversion, range breakout, volume impulse, structure break, engulfing, Bollinger reversal, Donchian break, 10-bar momentum, wick rejection, pivot reversal, MACD momentum, trend pullback, volatility expansion, volume confirmation, range compression and three-candle star. Each reads the selected market's candle series; the signal list is a prototype voting tally, not a statistically validated ensemble. Future strategy interface must declare inputs, timeframe, setup-state, entry, invalidation, stop/target, sizing/risk, expectancy, sample count, out-of-sample results, market/session/regime applicability, health and version.

## Alpha and opportunity discovery

Global Alpha target: market universe scanner, cross-asset ranking, candidate scoring, watchlist, opportunity radar, setup fingerprinting, strategy match, regime match, quality/confidence, liquidity, risk-adjusted opportunity, explainable score, candidate lifecycle and research prioritization. Alpha must only use verified data, must not trigger orders on ranking alone, and must apply account/risk permissions before any execution intent. Current Alpha score is a simple local strategy vote/price trend estimate.

## Agent council and command assistant

The envisioned twelve-agent council contains specialist perspectives (technical, structure/SMC, flow/liquidity, volume, sentiment/news, fundamental, macro, quant/forecast, risk, portfolio, execution and integrity) plus a commander/synthesis layer. Each specialist should return evidence, timestamps, confidence, source quality, assumptions, disagreement and invalidation. Risk/security have independent veto power. JARVIS is the command interface: natural-language tasks, market research, orchestration, explanation, command validation, audit trail and confirmation. Autopilot should only schedule scans, monitor approved conditions and propose actions under permissions; it must not bypass risk gates. Agent/assistant/autopilot runtimes are not implemented in the initial browser build.

## Risk and execution governance

Risk policies are defined as disclosure defaults: 1% risk per trade, 3% daily loss limit, 10% drawdown, eight open positions, 6% notional ceiling and live trading disabled. The local paper ticket enforces only a basic notional and count check. Production risk must calculate quantity from stop distance, equity, fees, slippage, volatility, leverage, margin, correlation, concentration and product rules; use authoritative account state; reject stale data; include daily loss/drawdown monitoring; enforce kill switch; and keep exchange/broker order status reconciled. Live gates: auth, least-privilege credentials, provider health, explicit enablement, confirmations, order bounds, idempotency, duplicate detection, audit, secret storage and kill switch. Unknown order outcomes must reconcile before retry. Withdrawals and transfers remain outside the trading API.

## Execution products

- Spot: public candle feed and local paper ticket only.
- Perpetual futures: selector currently blocks unsupported chart data; futures adapters still needed for market data, funding, open interest, liquidation streams, margin, leverage and testnet/live execution policies.
- CFDs: selector is a disconnected status option; broker adapters, product symbols, trading hours, financing, spread, contract size and broker risk remain to be implemented.
- Multi-exchange: current candle REST sources only; no private account, order, fill, balance or failover integration yet.
- Paper trading: current browser-only cash/position/order simulation; future server-managed paper exchange requires persistence, deterministic fill model, fee/funding/slippage, mark prices, order lifecycle, stop management and reconciliation.
- MT5: planned local Windows bridge for terminal/broker connection, explicitly local and protected; no remote pairing or live bridge included here.

## Finance, treasury, wallet and audit

Planned double-entry ledger with chart of accounts, balanced journal postings, fixed precision money, immutable posted entries/reversals, hash-chain audit, idempotency, period close, year-end, reconciliation, income statement, balance sheet, cash-flow, AP/AR, fees/funding, trade P&L, expenses, treasury balances, capital allocation and reporting. D1 currently holds forecast rows and starter journal/paper order schemas only; accounting/treasury posting is not implemented. Wallet/chain domains include JSON-RPC balances, addresses, networks, gas, transactions, wallet monitoring, whale flows, DEX/token integrity and on-chain analytics; not connected. Do not expose transfer/withdrawal actions.

## Records and learning

- Prediction ledger: immutable forecast snapshot, price, horizon, probability, thesis, invalidation, source/regime/strategy tags, resolver and outcome; metrics include accuracy, MAE, Brier score and calibration by instrument, timeframe, regime and strategy. Current local records and D1 forecast insert endpoint exist, but resolution/calibration pipelines are not implemented.
- Trade journal: every signal, decision, rejection, order, fill, close, manual action, forecast, lesson and source; tamper-evident immutable event chain. Current browser journal export and basic D1 forecast persistence only.
- Trading memory: searchable research knowledge, strategy/market lessons, decision history, retrieval context and feedback. Not implemented.
- Replay/backtest: historical candle playback, decision reconstruction, strategy testing, execution model, fees, funding, slippage, point-in-time source quality, walk-forward and Monte Carlo. Initial quick test is a simple sample-only directional check.

## Additional research domains

Institutional disclosures: SEC 13F, Form 4, 13D/13G and public filing timeline with delayed-data labels. Quant analytics: performance, expectancy, variance, drawdown, Sharpe/Sortino, risk of ruin, Monte Carlo, regime-specific and portfolio stats. Forecast/counterfactual: compare alternative decisions, what-if scenarios, missed opportunities, trade collision detection, outcome attribution and causal limits. 3D market chart: read-only time/price/volume visualization. Sports intelligence: separate sports forecast and fixture audit module. Company tools: separate business management namespace. These are roadmap domains, not included in the current deployable app.

## Persistence and infrastructure

Cloudflare Worker API + static assets, D1 forecast table and journal/order schema, browser storage fallback. Production persistence design should use D1 for orders, fills, positions, account state, forecasts, journal, audit, strategies, agent decisions and portfolio snapshots; KV only for cache/short-lived operational keys. Cron tasks should handle scheduled scans, autopilot, forecast resolution, position monitoring and research with explicit concurrency, retry/backoff, resource budgets and idempotent jobs. Worker CPU/subrequest limits, API rate limits, provider availability and stale data are operational constraints. A separate Python/FastAPI/Docker backend is optional architecture for compute-heavy research/backtests and not deployed in this first Worker.

## UI workspaces

Terminal, Intelligence Command, Strategy Arsenal, Portfolio/Risk, Execution Desk, Journal/Prediction Ledger, Research/Replay. Future workspaces: Alpha radar, agent council, JARVIS, markets scanner, daily report, alerts, data intelligence, wallet/chain, futures, profit management, treasury/accounting, 3D chart and sports intelligence. Dashboard summaries must reflect backend state and source health, not stale frontend mock state.


## Verification status

Latest main branch includes an Actions syntax/file check for JavaScript and Worker plus required files. It does not constitute functional browser testing, provider verification, Cloudflare deployment, database migration execution, trading simulation QA, integration tests, security audit, or live profitability evidence. Track feature states explicitly: code present, tests passing, provider configured, deployed, verified in runtime, production proven.
