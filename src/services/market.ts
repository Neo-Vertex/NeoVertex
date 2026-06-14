// Cliente da camada /api/market/* do backend (dados públicos de mercado).
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const TOKEN_KEY = 'nv_auth_token';

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(TOKEN_KEY);
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export interface PriceRow { symbol: string; price: number; changePct: number; quoteVolume: number; }
export interface UsdtBrl { price: number; changePct: number; }
export interface InflowRow { symbol: string; netInflow: number; buyPct: number; changePct: number; quoteVolume: number; }
export interface StockRow { symbol: string; price: number; currency: string; changePct: number; netFlow: number; turnover: number; proxy: boolean; }
export interface Premium { premiumAbs: number; premiumPct: number; available: boolean; }
export interface Institutional {
  symbol: string;
  coinbasePremium: Premium;
  etfFlows: { available: boolean; reason?: string };
  cme: { available: boolean; reason?: string };
}
export interface Article { title: string; url: string; source: string; publishedAt: string | null; }
export interface NewsResult { available: boolean; reason?: string; articles: Article[]; }

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api/market${path}`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const marketApi = {
  prices: (symbols: string[]) => get<PriceRow[]>(`/price?symbols=${encodeURIComponent(symbols.join(','))}`),
  usdtBrl: () => get<UsdtBrl>('/usdt-brl'),
  inflowRank: (limit = 20) => get<InflowRow[]>(`/inflow-rank?limit=${limit}`),
  stock: (symbol: string) => get<StockRow>(`/stock?symbol=${encodeURIComponent(symbol)}`),
  institutional: (symbol: string) => get<Institutional>(`/institutional?symbol=${encodeURIComponent(symbol)}`),
  news: (symbol: string) => get<NewsResult>(`/news?symbol=${encodeURIComponent(symbol)}`),
};

// ── Formatação compartilhada na UI ──
export function fmtCompact(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return 'N/D';
  const a = Math.abs(v);
  const s = v < 0 ? '-' : '';
  if (a >= 1e9) return `${s}${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(2)}K`;
  return `${s}${a.toFixed(2)}`;
}

export function fmtPrice(v: number, currency = 'USD'): string {
  const symbol = currency === 'BRL' ? 'R$' : '$';
  const digits = v < 1 ? 4 : 2;
  return `${symbol}${v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
