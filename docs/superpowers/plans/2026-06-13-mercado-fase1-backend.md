# Mercado — Fase 1: Backend (camada /api/market/*) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar ao backend Express uma camada `/api/market/*` (preço, ranking de entrada, ações, notícias, prêmio Coinbase) + 4 tabelas de mercado, reusando o padrão de CRUD genérico e migrations automáticas.

**Architecture:** Módulos isolados e puros em `server/market/` (lógica testável sem rede) + wrappers finos de fetch + um router Express read-only. Watchlist/alertas reusam o CRUD genérico via `ALLOWED_TABLES`. Sem novas dependências (usa `node:test` e `fetch` nativos do Node 24).

**Tech Stack:** Node 24, Express 4, pg, `node:test`/`node:assert`, `fetch` global.

> **Nota de escopo:** ETF spot e CME ficam para uma sub-fase posterior (fontes frágeis/precisam de chave). Fase 1 entrega institucional via **prêmio Coinbase** (real, grátis). Notícias dependem de token CryptoPanic; sem token o endpoint responde `{ available: false }`. Auth nas rotas segue a postura atual do app (CRUD sem auth) — hardening fica como follow-up.

---

## File Structure

- Create `server/market/format.js` — formatação compacta de números (puro).
- Create `server/market/cache.js` — cache TTL em memória com clock injetável (puro).
- Create `server/market/binance.js` — `computeNetInflow` (puro) + fetchers Binance.
- Create `server/market/stocks.js` — `computeMoneyFlow` (puro) + quote Yahoo.
- Create `server/market/institutional.js` — `computeCoinbasePremium` (puro) + fetch Coinbase.
- Create `server/market/news.js` — `mapCryptoPanic` (puro) + fetch CryptoPanic.
- Create `server/routes/market.js` — router Express read-only montado em `/api/market`.
- Create `server/test/*.test.js` — testes unitários das funções puras.
- Modify `server/index.js` — migrations das 4 tabelas + `ALLOWED_TABLES` + seed + montar router.

---

## Task 1: Formatação compacta (puro)

**Files:**
- Create: `server/market/format.js`
- Test: `server/test/format.test.js`

- [ ] **Step 1: Write the failing test**

```js
// server/test/format.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { fmtCompact } = require('../market/format');

test('fmtCompact formata bilhões, milhões, milhares', () => {
  assert.strictEqual(fmtCompact(1_500_000_000), '1.50B');
  assert.strictEqual(fmtCompact(2_280_000), '2.28M');
  assert.strictEqual(fmtCompact(843_630), '843.63K');
  assert.strictEqual(fmtCompact(12.5), '12.50');
});

test('fmtCompact lida com negativo e nulo', () => {
  assert.strictEqual(fmtCompact(-2_000_000), '-2.00M');
  assert.strictEqual(fmtCompact(null), 'N/D');
  assert.strictEqual(fmtCompact(NaN), 'N/D');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && node --test test/format.test.js`
Expected: FAIL — `Cannot find module '../market/format'`.

- [ ] **Step 3: Write minimal implementation**

```js
// server/market/format.js
function fmtCompact(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return 'N/D';
  const a = Math.abs(v);
  const s = v < 0 ? '-' : '';
  if (a >= 1e9) return `${s}${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(2)}K`;
  return `${s}${a.toFixed(2)}`;
}

module.exports = { fmtCompact };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && node --test test/format.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add server/market/format.js server/test/format.test.js
git commit -m "feat(market): compact number formatter"
```

---

## Task 2: Cache TTL (puro, clock injetável)

**Files:**
- Create: `server/market/cache.js`
- Test: `server/test/cache.test.js`

- [ ] **Step 1: Write the failing test**

```js
// server/test/cache.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { makeCache } = require('../market/cache');

test('cache devolve valor dentro do TTL e expira depois', () => {
  let now = 1000;
  const cache = makeCache(500, () => now);
  cache.set('k', 42);
  assert.strictEqual(cache.get('k'), 42);
  now = 1400; // dentro do TTL
  assert.strictEqual(cache.get('k'), 42);
  now = 1600; // expirou
  assert.strictEqual(cache.get('k'), undefined);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && node --test test/cache.test.js`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write minimal implementation**

```js
// server/market/cache.js
function makeCache(ttlMs, now = () => Date.now()) {
  const store = new Map();
  return {
    get(key) {
      const e = store.get(key);
      if (!e) return undefined;
      if (now() - e.t > ttlMs) { store.delete(key); return undefined; }
      return e.v;
    },
    set(key, v) { store.set(key, { v, t: now() }); return v; },
  };
}

module.exports = { makeCache };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && node --test test/cache.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/market/cache.js server/test/cache.test.js
git commit -m "feat(market): TTL cache with injectable clock"
```

---

## Task 3: Binance — entrada líquida (puro) + fetchers

**Files:**
- Create: `server/market/binance.js`
- Test: `server/test/binance.test.js`

- [ ] **Step 1: Write the failing test**

```js
// server/test/binance.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { computeNetInflow } = require('../market/binance');

test('computeNetInflow = 2*takerBuy - quoteVolume e buyPct', () => {
  const r = computeNetInflow(100, 60);
  assert.strictEqual(r.netInflow, 20);   // 60 - 40
  assert.strictEqual(r.buyPct, 60);
});

test('computeNetInflow protege divisão por zero', () => {
  const r = computeNetInflow(0, 0);
  assert.strictEqual(r.netInflow, 0);
  assert.strictEqual(r.buyPct, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && node --test test/binance.test.js`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write minimal implementation**

```js
// server/market/binance.js
const { makeCache } = require('./cache');

const BASES = ['https://api.binance.com', 'https://data-api.binance.vision'];
const cache = makeCache(30_000);

function computeNetInflow(quoteVolume, takerBuyQuote) {
  const qv = Number(quoteVolume) || 0;
  const tb = Number(takerBuyQuote) || 0;
  return { netInflow: tb - (qv - tb), buyPct: qv > 0 ? (tb / qv) * 100 : 0 };
}

async function getJSON(path) {
  let lastErr;
  for (const base of BASES) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12_000);
      const res = await fetch(base + path, { signal: ctrl.signal, headers: { 'User-Agent': 'neovertex/1.0' } });
      clearTimeout(t);
      if (res.ok) return await res.json();
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

async function getPrices(symbols) {
  const out = [];
  for (const sym of symbols) {
    const pair = sym.endsWith('USDT') ? sym : `${sym}USDT`;
    const ck = `t:${pair}`;
    let d = cache.get(ck);
    if (!d) { d = await getJSON(`/api/v3/ticker/24hr?symbol=${pair}`); cache.set(ck, d); }
    out.push({
      symbol: sym.replace('USDT', ''),
      price: Number(d.lastPrice),
      changePct: Number(d.priceChangePercent),
      quoteVolume: Number(d.quoteVolume),
    });
  }
  return out;
}

async function getInflowRank(limit = 20, scan = 150) {
  const all = await getJSON('/api/v3/ticker/24hr');
  const EXCLUDE = new Set(['USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT', 'BUSDUSDT', 'EURUSDT', 'DAIUSDT', 'USDPUSDT', 'AEURUSDT', 'EURIUSDT']);
  const pairs = all
    .filter(t => t.symbol.endsWith('USDT') && !EXCLUDE.has(t.symbol)
      && !['UP', 'DOWN', 'BULL', 'BEAR'].some(x => t.symbol.includes(x))
      && Number(t.quoteVolume) > 0)
    .sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))
    .slice(0, scan);

  const rows = [];
  for (const t of pairs) {
    try {
      const k = await getJSON(`/api/v3/klines?symbol=${t.symbol}&interval=1d&limit=1`);
      const c = k[0];
      const { netInflow, buyPct } = computeNetInflow(c[7], c[10]);
      rows.push({
        symbol: t.symbol.replace('USDT', ''),
        netInflow, buyPct,
        changePct: Number(t.priceChangePercent),
        quoteVolume: Number(c[7]),
      });
    } catch { /* ignora par com falha */ }
  }
  rows.sort((a, b) => b.netInflow - a.netInflow);
  return rows.slice(0, limit);
}

module.exports = { computeNetInflow, getPrices, getInflowRank };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && node --test test/binance.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add server/market/binance.js server/test/binance.test.js
git commit -m "feat(market): binance net-inflow + price/rank fetchers"
```

---

## Task 4: Ações — money flow (puro) + quote Yahoo

**Files:**
- Create: `server/market/stocks.js`
- Test: `server/test/stocks.test.js`

- [ ] **Step 1: Write the failing test**

```js
// server/test/stocks.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { computeMoneyFlow } = require('../market/stocks');

test('computeMoneyFlow soma barras de alta e subtrai de baixa', () => {
  const bars = [
    { open: 10, close: 11, volume: 100 }, // alta: +1100
    { open: 11, close: 10, volume: 50 },  // baixa: -500
    { open: 10, close: 10, volume: 0 },   // ignorada (vol 0)
    null,                                  // ignorada
  ];
  const r = computeMoneyFlow(bars);
  assert.strictEqual(r.netFlow, 600);     // 1100 - 500
  assert.strictEqual(r.turnover, 1600);   // 1100 + 500
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && node --test test/stocks.test.js`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write minimal implementation**

```js
// server/market/stocks.js
const { makeCache } = require('./cache');
const cache = makeCache(60_000);

function computeMoneyFlow(bars) {
  let netFlow = 0, turnover = 0;
  for (const b of bars) {
    if (!b) continue;
    const { open, close, volume } = b;
    if (open == null || close == null || volume == null || volume === 0) continue;
    const money = volume * close;
    turnover += money;
    netFlow += close >= open ? money : -money;
  }
  return { netFlow, turnover };
}

async function getStockQuote(symbol) {
  const ck = `s:${symbol}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
  clearTimeout(t);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const r = json.chart.result[0];
  const meta = r.meta;
  const q = r.indicators.quote[0];
  const bars = (q.open || []).map((o, i) => ({ open: o, close: q.close[i], volume: q.volume[i] }));
  const { netFlow, turnover } = computeMoneyFlow(bars);
  const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice);
  const price = Number(meta.regularMarketPrice);
  const out = {
    symbol,
    price,
    currency: meta.currency || 'USD',
    changePct: prev ? ((price - prev) / prev) * 100 : 0,
    netFlow, turnover,
    proxy: true,
  };
  return cache.set(ck, out);
}

module.exports = { computeMoneyFlow, getStockQuote };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && node --test test/stocks.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/market/stocks.js server/test/stocks.test.js
git commit -m "feat(market): stock money-flow proxy + yahoo quote"
```

---

## Task 5: Institucional — prêmio Coinbase (puro) + fetch

**Files:**
- Create: `server/market/institutional.js`
- Test: `server/test/institutional.test.js`

- [ ] **Step 1: Write the failing test**

```js
// server/test/institutional.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { computeCoinbasePremium } = require('../market/institutional');

test('prêmio Coinbase = diferença absoluta e percentual vs Binance', () => {
  const r = computeCoinbasePremium(64200, 64000);
  assert.strictEqual(r.premiumAbs, 200);
  assert.ok(Math.abs(r.premiumPct - 0.3125) < 1e-9);
});

test('prêmio Coinbase protege preços inválidos', () => {
  const r = computeCoinbasePremium(0, 64000);
  assert.deepStrictEqual(r, { premiumAbs: 0, premiumPct: 0 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && node --test test/institutional.test.js`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write minimal implementation**

```js
// server/market/institutional.js
const { makeCache } = require('./cache');
const cache = makeCache(30_000);

function computeCoinbasePremium(coinbasePrice, binancePrice) {
  const cb = Number(coinbasePrice), bn = Number(binancePrice);
  if (!cb || !bn) return { premiumAbs: 0, premiumPct: 0 };
  const premiumAbs = cb - bn;
  return { premiumAbs, premiumPct: (premiumAbs / bn) * 100 };
}

async function getJSON(url, headers = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  const res = await fetch(url, { signal: ctrl.signal, headers });
  clearTimeout(t);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// símbolo base ('BTC','ETH','SOL'...) — pares USD na Coinbase, USDT na Binance
async function getInstitutional(symbol) {
  const base = symbol.replace('USDT', '').toUpperCase();
  const ck = `inst:${base}`;
  const hit = cache.get(ck);
  if (hit) return hit;

  let premium = { premiumAbs: 0, premiumPct: 0, available: false };
  try {
    const [cb, bn] = await Promise.all([
      getJSON(`https://api.exchange.coinbase.com/products/${base}-USD/ticker`, { 'User-Agent': 'neovertex/1.0' }),
      getJSON(`https://api.binance.com/api/v3/ticker/price?symbol=${base}USDT`, { 'User-Agent': 'neovertex/1.0' }),
    ]);
    premium = { ...computeCoinbasePremium(cb.price, bn.price), available: true };
  } catch { /* mantém available:false */ }

  const out = {
    symbol: base,
    coinbasePremium: premium,
    etfFlows: { available: false, reason: 'Sub-fase posterior (Farside/CoinGlass)' },
    cme: { available: false, reason: 'Requer chave CoinGlass (sub-fase posterior)' },
  };
  return cache.set(ck, out);
}

module.exports = { computeCoinbasePremium, getInstitutional };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && node --test test/institutional.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/market/institutional.js server/test/institutional.test.js
git commit -m "feat(market): coinbase premium institutional signal"
```

---

## Task 6: Notícias — mapper CryptoPanic (puro) + fetch

**Files:**
- Create: `server/market/news.js`
- Test: `server/test/news.test.js`

- [ ] **Step 1: Write the failing test**

```js
// server/test/news.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { mapCryptoPanic } = require('../market/news');

test('mapCryptoPanic normaliza resultados', () => {
  const json = { results: [
    { title: 'BTC sobe', url: 'http://x/1', source: { title: 'CoinDesk' }, published_at: '2026-06-13T10:00:00Z' },
    { title: 'ETH news', url: 'http://x/2', domain: 'theblock.co', created_at: '2026-06-13T09:00:00Z' },
  ] };
  const out = mapCryptoPanic(json);
  assert.strictEqual(out.length, 2);
  assert.deepStrictEqual(out[0], { title: 'BTC sobe', url: 'http://x/1', source: 'CoinDesk', publishedAt: '2026-06-13T10:00:00Z' });
  assert.strictEqual(out[1].source, 'theblock.co');
});

test('mapCryptoPanic tolera resposta vazia', () => {
  assert.deepStrictEqual(mapCryptoPanic({}), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && node --test test/news.test.js`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write minimal implementation**

```js
// server/market/news.js
const { makeCache } = require('./cache');
const cache = makeCache(120_000);

function mapCryptoPanic(json) {
  const results = Array.isArray(json?.results) ? json.results : [];
  return results.map(r => ({
    title: r.title,
    url: r.url,
    source: r.source?.title || r.domain || 'desconhecido',
    publishedAt: r.published_at || r.created_at || null,
  }));
}

async function getCryptoNews(symbol) {
  const token = process.env.CRYPTOPANIC_TOKEN;
  if (!token) return { available: false, reason: 'Defina CRYPTOPANIC_TOKEN no .env', articles: [] };
  const base = symbol.replace('USDT', '').toUpperCase();
  const ck = `news:${base}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${token}&currencies=${base}&public=true`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const out = { available: true, articles: mapCryptoPanic(json).slice(0, 10) };
    return cache.set(ck, out);
  } catch (e) {
    return { available: false, reason: e.message, articles: [] };
  }
}

module.exports = { mapCryptoPanic, getCryptoNews };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && node --test test/news.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add server/market/news.js server/test/news.test.js
git commit -m "feat(market): cryptopanic news mapper + fetch"
```

---

## Task 7: Router `/api/market/*`

**Files:**
- Create: `server/routes/market.js`

- [ ] **Step 1: Write the router**

```js
// server/routes/market.js
const express = require('express');
const router = express.Router();
const binance = require('../market/binance');
const stocks = require('../market/stocks');
const institutional = require('../market/institutional');
const news = require('../market/news');

router.get('/price', async (req, res) => {
  try {
    const symbols = String(req.query.symbols || 'BTC').split(',').map(s => s.trim()).filter(Boolean);
    res.json(await binance.getPrices(symbols));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/inflow-rank', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const scan = Math.min(parseInt(req.query.scan) || 150, 300);
    res.json(await binance.getInflowRank(limit, scan));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/stock', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || '').trim();
    if (!symbol) return res.status(400).json({ message: 'symbol obrigatório' });
    res.json(await stocks.getStockQuote(symbol));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/institutional', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || 'BTC').trim();
    res.json(await institutional.getInstitutional(symbol));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/news', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || 'BTC').trim();
    res.json(await news.getCryptoNews(symbol));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

module.exports = router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/market.js
git commit -m "feat(market): read-only market router"
```

---

## Task 8: Migrations, ALLOWED_TABLES, seed e montagem do router

**Files:**
- Modify: `server/index.js`

- [ ] **Step 1: Adicionar tabelas ao `ALLOWED_TABLES`**

Em `server/index.js`, na const `ALLOWED_TABLES` (linha ~85), acrescentar os 4 nomes:

```js
const ALLOWED_TABLES = [
  'profiles', 'projects', 'financial_records', 'contact_requests', 'messages',
  'services', 'products', 'colab_brands', 'appointments', 'crm_pipelines',
  'crm_stages', 'crm_leads', 'crm_interactions', 'project_logs', 'languages',
  'expenses',
  'market_watchlist', 'market_alerts', 'market_alert_events', 'telegram_subscribers',
];
```

- [ ] **Step 2: Criar as tabelas em `runMigrations()`**

Dentro de `runMigrations()`, antes de `console.log('Migrations concluídas...')`, inserir:

```js
    await client.query(`CREATE TABLE IF NOT EXISTS market_watchlist (
      id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      symbol       TEXT NOT NULL,
      display_name TEXT NOT NULL,
      kind         TEXT CHECK (kind IN ('crypto','stock')) NOT NULL,
      source       TEXT,
      sort_order   INTEGER DEFAULT 0,
      active        BOOLEAN DEFAULT true,
      created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS market_alerts (
      id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      kind              TEXT CHECK (kind IN ('price','institutional')) NOT NULL,
      symbol            TEXT NOT NULL,
      operator          TEXT CHECK (operator IN ('gte','lte')) DEFAULT 'gte',
      target_value      NUMERIC,
      params            JSONB DEFAULT '{}'::jsonb,
      telegram_chat_id  TEXT,
      active            BOOLEAN DEFAULT true,
      last_triggered_at TIMESTAMP WITH TIME ZONE,
      created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS market_alert_events (
      id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      alert_id   UUID REFERENCES market_alerts(id) ON DELETE CASCADE,
      symbol     TEXT NOT NULL,
      message    TEXT NOT NULL,
      payload    JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS telegram_subscribers (
      id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      chat_id    TEXT UNIQUE NOT NULL,
      label      TEXT,
      is_admin   BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`INSERT INTO market_watchlist (symbol, display_name, kind, source, sort_order) VALUES
      ('BTC','Bitcoin','crypto','binance',1),
      ('ETH','Ethereum','crypto','binance',2),
      ('SOL','Solana','crypto','binance',3),
      ('SUI','Sui','crypto','binance',4),
      ('XRP','XRP','crypto','binance',5),
      ('NVDA','NVIDIA','stock','yahoo',6),
      ('PETR4.SA','Petrobras','stock','yahoo',7)
      ON CONFLICT DO NOTHING`);
```

- [ ] **Step 3: Montar o router**

Logo após `app.use(express.json());` (linha ~19), adicionar:

```js
app.use('/api/market', require('./routes/market'));
```

- [ ] **Step 4: Verificar que o servidor sobe sem erro de sintaxe**

Run: `cd server && node -e "require('./index.js')" ` — então `Ctrl+C`.
(Ou, se houver `DATABASE_URL`, `npm run dev` e conferir o log "NeoVertex API rodando".)
Expected: processo inicia sem erro de sintaxe/`require`. Sem DB, a migration loga erro mas o servidor continua (comportamento já existente).

- [ ] **Step 5: Commit**

```bash
git add server/index.js
git commit -m "feat(market): tables, allowed tables, seed and mount router"
```

---

## Task 9: Smoke test dos endpoints (manual, com rede)

**Files:** nenhum (verificação).

- [ ] **Step 1: Subir o servidor e bater nos endpoints públicos**

Run (com servidor no ar em :3001):
```bash
curl -s "http://localhost:3001/api/market/price?symbols=BTC,ETH,SOL" | head -c 400
curl -s "http://localhost:3001/api/market/inflow-rank?limit=5" | head -c 400
curl -s "http://localhost:3001/api/market/institutional?symbol=BTC" | head -c 400
curl -s "http://localhost:3001/api/market/stock?symbol=NVDA" | head -c 400
```
Expected: JSON com `price`/`netInflow`/`coinbasePremium` preenchidos (institucional `available:true`; etf/cme `available:false`).

- [ ] **Step 2: Rodar a suíte completa**

Run: `cd server && node --test`
Expected: todos os testes unitários PASS.

---

## Self-Review (preenchido)

- **Cobertura do spec:** preço/entrada (T3), ações (T4), notícias (T6), institucional via prêmio Coinbase (T5), tabelas watchlist/alertas/eventos/subscribers (T8). ETF/CME explicitamente adiados (nota de escopo). ✅
- **Placeholders:** nenhum — todo passo tem código/comando reais. ✅
- **Consistência de tipos:** `computeNetInflow`→`{netInflow,buyPct}`, `computeMoneyFlow`→`{netFlow,turnover}`, `computeCoinbasePremium`→`{premiumAbs,premiumPct}`, `getInstitutional`→`{coinbasePremium,etfFlows,cme}` usados de forma consistente entre módulos e router. ✅
- **Sem novas dependências:** `node:test` e `fetch` nativos. ✅
