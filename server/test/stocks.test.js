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
