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
