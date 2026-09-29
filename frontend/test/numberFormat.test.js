import test from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber } from '../src/utils/numberFormat.js';

test('automatic abbreviations retain useful precision across scales', () => {
  const options = { rounding: 'auto', significantDigits: 3 };
  assert.equal(formatNumber(2_886_265, options), '2.89M');
  assert.equal(formatNumber(900_068, options), '900K');
  assert.equal(formatNumber(12_245_995, options), '12.2M');
  assert.equal(formatNumber(289, options), '289');
});

test('precision is adjustable without adding trailing zeroes', () => {
  assert.equal(formatNumber(2_886_265, { rounding: 'auto', significantDigits: 2 }), '2.9M');
  assert.equal(formatNumber(2_886_265, { rounding: 'auto', significantDigits: 4 }), '2.886M');
  assert.equal(formatNumber(2_886_265, { rounding: 'M', significantDigits: 3 }), '2.89M');
});

test('automatic units advance when rounding crosses a boundary', () => {
  const options = { rounding: 'auto', significantDigits: 3 };
  assert.equal(formatNumber(999_500, options), '1M');
  assert.equal(formatNumber(999_500_000, options), '1B');
});

test('full values and missing values keep their existing display', () => {
  assert.equal(formatNumber(2_886_265, { rounding: 'none' }), '2,886,265');
  assert.equal(formatNumber(null, { rounding: 'auto' }), '—');
});
