// Notícias de cripto via CryptoPanic (requer CRYPTOPANIC_TOKEN no .env).
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
