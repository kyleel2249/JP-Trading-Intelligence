CREATE TABLE IF NOT EXISTS forecasts (
 id TEXT PRIMARY KEY,
 symbol TEXT NOT NULL,
 direction TEXT NOT NULL CHECK(direction IN ('BULLISH','BEARISH','NEUTRAL')),
 horizon TEXT NOT NULL,
 target_price REAL,
 confidence INTEGER NOT NULL CHECK(confidence BETWEEN 0 AND 100),
 thesis TEXT NOT NULL DEFAULT '',
 reference_price REAL,
 created_at TEXT NOT NULL,
 resolved_at TEXT,
 outcome TEXT,
 actual_price REAL,
 resolution_error REAL
);
CREATE INDEX IF NOT EXISTS forecasts_symbol_created_idx ON forecasts(symbol, created_at DESC);
CREATE TABLE IF NOT EXISTS journal_events (
 id TEXT PRIMARY PRIMARY KEY,
 event_type TEXT NOT NULL,
 payload TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS paper_orders (
 id TEXT PRIMARY PRIMARY KEY,
 symbol TEXT NOT NULL,
 side TEXT NOT NULL CHECK(side IN ('buy','sell')),
 quantity REAL NOT NULL CHECK(quantity > 0),
 entry_price REAL NOT NULL,
 state TEXT NOT NULL,
 created_at TEXT NOT NULL,
 closed_at TEXT,
 pnl REAL
);
CREATE INDEX IF NOT EXISTS paper_orders_symbol_idx ON paper_orders(symbol);
