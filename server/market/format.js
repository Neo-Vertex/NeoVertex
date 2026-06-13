// Formatação compacta de números para o módulo de mercado.
function fmtCompact(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return 'N/D';
  const a = Math.abs(v);
  const s = v < 0 ? '-' : '';
  if (a >= 1e9) return `${s}${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(2)}K`;
  return `${s}${a.toFixed(2)}`;
}

module.exports = { fmtCompact };
