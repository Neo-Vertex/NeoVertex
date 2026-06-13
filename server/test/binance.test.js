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
