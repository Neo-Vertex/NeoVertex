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
