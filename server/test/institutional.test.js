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
