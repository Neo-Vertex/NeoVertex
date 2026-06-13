// Ações via Yahoo Finance: preço, variação e money-flow proxy (volume por direção).
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
