// Dados públicos da Binance: preço, variação e entrada líquida (taker buy - taker sell).
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

async function getUsdtBrl() {
  const ck = 't:USDTBRL';
  let d = cache.get(ck);
  if (!d) { d = await getJSON('/api/v3/ticker/24hr?symbol=USDTBRL'); cache.set(ck, d); }
  return { price: Number(d.lastPrice), changePct: Number(d.priceChangePercent) };
}

module.exports = { computeNetInflow, getPrices, getInflowRank, getUsdtBrl };
