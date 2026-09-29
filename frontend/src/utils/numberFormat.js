const scales = { K: 1_000, M: 1_000_000, B: 1_000_000_000 };
const nextScale = { K: 'M', M: 'B' };

export const formatNumber = (value, { rounding = 'none', significantDigits = 3 } = {}) => {
  if (value == null) return '—';

  const number = Number(value);
  if (!Number.isFinite(number)) return '—';

  const magnitude = Math.abs(number);
  let scale = rounding === 'auto'
    ? magnitude >= scales.B ? 'B' : magnitude >= scales.M ? 'M' : magnitude >= scales.K ? 'K' : null
    : scales[rounding] && magnitude >= scales[rounding] ? rounding : null;

  if (!scale) return Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(number);

  const digits = Math.max(1, Math.min(6, Number(significantDigits) || 3));
  let scaled = number / scales[scale];

  if (rounding === 'auto' && nextScale[scale] && Math.abs(Number(scaled.toPrecision(digits))) >= 1_000) {
    scale = nextScale[scale];
    scaled = number / scales[scale];
  }

  return Intl.NumberFormat(undefined, { maximumSignificantDigits: digits }).format(scaled) + scale;
};
