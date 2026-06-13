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
