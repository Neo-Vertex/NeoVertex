// Sinal institucional: prêmio Coinbase (Coinbase USD vs Binance USDT).
// ETF spot e CME ficam para sub-fase posterior (fontes frágeis / chave CoinGlass).
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
