import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, Newspaper, Building2,
  RefreshCw, Coins, LineChart, ExternalLink,
} from 'lucide-react';
import { supabase } from '../../../services/supabase';
import {
  marketApi, fmtCompact, fmtPrice,
  type PriceRow, type StockRow, type InflowRow, type Institutional, type NewsResult,
} from '../../../services/market';

interface WatchItem {
  id: string;
  symbol: string;
  display_name: string;
  kind: 'crypto' | 'stock';
  source: string;
  sort_order: number;
  active: boolean;
}

type Tab = 'watchlist' | 'ranking' | 'institucional' | 'noticias';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'watchlist', label: 'Watchlist', icon: Coins },
  { id: 'ranking', label: 'Ranking de Entradas', icon: BarChart3 },
  { id: 'institucional', label: 'Institucional', icon: Building2 },
  { id: 'noticias', label: 'Notícias', icon: Newspaper },
];

// Variação colorida (verde/vermelho) reutilizada nas tabelas.
const Change: React.FC<{ pct: number }> = ({ pct }) => {
  const up = pct >= 0;
  return (
    <span style={{ color: up ? 'var(--color-success)' : 'var(--color-error)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {up ? '+' : ''}{pct.toFixed(2)}%
    </span>
  );
};

const Aviso: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="card" style={{ borderColor: 'var(--color-primary-a20)', color: 'var(--color-text-soft)', fontSize: 13 }}>
    {msg}
  </div>
);

const MarketView: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('watchlist');

  // Watchlist data
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [wlLoading, setWlLoading] = useState(false);
  const [wlError, setWlError] = useState('');

  // Ranking
  const [rank, setRank] = useState<InflowRow[]>([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState('');

  // Institucional / Notícias
  const [selected, setSelected] = useState('BTC');
  const [inst, setInst] = useState<Institutional | null>(null);
  const [instError, setInstError] = useState('');
  const [news, setNews] = useState<NewsResult | null>(null);
  const [newsError, setNewsError] = useState('');

  const cryptos = watchlist.filter(w => w.kind === 'crypto');

  // ── Carregar watchlist do banco ──
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('market_watchlist')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (data) setWatchlist(data as WatchItem[]);
    })();
  }, []);

  // ── Buscar preços (cripto) + cotações (ações) ──
  const loadWatchlist = useCallback(async () => {
    if (watchlist.length === 0) return;
    setWlLoading(true); setWlError('');
    const cs = watchlist.filter(w => w.kind === 'crypto').map(w => w.symbol);
    const ss = watchlist.filter(w => w.kind === 'stock').map(w => w.symbol);
    try {
      const [p, st] = await Promise.all([
        cs.length ? marketApi.prices(cs) : Promise.resolve([] as PriceRow[]),
        Promise.all(ss.map(s => marketApi.stock(s).catch(() => null))),
      ]);
      setPrices(p);
      setStocks(st.filter(Boolean) as StockRow[]);
    } catch (e) {
      setWlError((e as Error).message);
    } finally {
      setWlLoading(false);
    }
  }, [watchlist]);

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  const loadRanking = useCallback(async () => {
    setRankLoading(true); setRankError('');
    try { setRank(await marketApi.inflowRank(20)); }
    catch (e) { setRankError((e as Error).message); }
    finally { setRankLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'ranking' && rank.length === 0 && !rankLoading) loadRanking(); }, [activeTab, rank.length, rankLoading, loadRanking]);

  // ── Institucional + Notícias do ativo selecionado ──
  useEffect(() => {
    if (activeTab !== 'institucional') return;
    setInst(null); setInstError('');
    marketApi.institutional(selected).then(setInst).catch(e => setInstError((e as Error).message));
  }, [activeTab, selected]);

  useEffect(() => {
    if (activeTab !== 'noticias') return;
    setNews(null); setNewsError('');
    marketApi.news(selected).then(setNews).catch(e => setNewsError((e as Error).message));
  }, [activeTab, selected]);

  return (
    <div className="anim-fade-in" style={{ padding: '4px 2px' }}>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><LineChart size={20} style={{ color: 'var(--color-primary)' }} /> Mercado</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Cripto e ações — preço, entrada líquida, sinal institucional e notícias.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { loadWatchlist(); if (activeTab === 'ranking') loadRanking(); }}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-group" style={{ marginTop: 16 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="inline-flex items-center gap-2"><t.icon size={14} /> {t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Watchlist ── */}
      {activeTab === 'watchlist' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {wlError && <div style={{ padding: 16 }}><Aviso msg={`Não foi possível carregar os dados de mercado: ${wlError}`} /></div>}
          {wlLoading && prices.length === 0 && stocks.length === 0 ? (
            <div className="flex items-center justify-center" style={{ padding: 40 }}>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]" />
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Ativo</th>
                  <th style={{ textAlign: 'right' }}>Preço</th>
                  <th style={{ textAlign: 'right' }}>Variação</th>
                  <th style={{ textAlign: 'right' }}>Vol. / Fluxo</th>
                  <th style={{ textAlign: 'right' }}>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {cryptos.map(w => {
                  const p = prices.find(x => x.symbol === w.symbol);
                  return (
                    <tr key={w.id}>
                      <td><strong>{w.display_name}</strong> <span className="text-[var(--color-text-muted)]">{w.symbol}</span></td>
                      <td style={{ textAlign: 'right' }}>{p ? fmtPrice(p.price) : '—'}</td>
                      <td style={{ textAlign: 'right' }}>{p ? <Change pct={p.changePct} /> : '—'}</td>
                      <td style={{ textAlign: 'right' }}>{p ? fmtCompact(p.quoteVolume) : '—'}</td>
                      <td style={{ textAlign: 'right' }}><span className="badge badge-info">CRIPTO</span></td>
                    </tr>
                  );
                })}
                {watchlist.filter(w => w.kind === 'stock').map(w => {
                  const s = stocks.find(x => x.symbol === w.symbol);
                  return (
                    <tr key={w.id}>
                      <td><strong>{w.display_name}</strong> <span className="text-[var(--color-text-muted)]">{w.symbol}</span></td>
                      <td style={{ textAlign: 'right' }}>{s ? fmtPrice(s.price, s.currency) : '—'}</td>
                      <td style={{ textAlign: 'right' }}>{s ? <Change pct={s.changePct} /> : '—'}</td>
                      <td style={{ textAlign: 'right' }}>{s ? fmtCompact(s.netFlow) : '—'}</td>
                      <td style={{ textAlign: 'right' }}><span className="badge badge-pending">AÇÃO</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Ranking de Entradas ── */}
      {activeTab === 'ranking' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {rankError && <div style={{ padding: 16 }}><Aviso msg={`Não foi possível carregar o ranking: ${rankError}`} /></div>}
          {rankLoading ? (
            <div className="flex items-center justify-center" style={{ padding: 40 }}>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]" />
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>#</th>
                  <th style={{ textAlign: 'left' }}>Ativo</th>
                  <th style={{ textAlign: 'right' }}>Entrada líq.</th>
                  <th style={{ textAlign: 'right' }}>% Compra</th>
                  <th style={{ textAlign: 'right' }}>Variação</th>
                  <th style={{ textAlign: 'right' }}>Vol. total</th>
                </tr>
              </thead>
              <tbody>
                {rank.map((r, i) => (
                  <tr key={r.symbol}>
                    <td className="text-[var(--color-text-muted)]">{i + 1}</td>
                    <td><strong>{r.symbol}</strong></td>
                    <td style={{ textAlign: 'right', color: r.netInflow >= 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700 }}>{fmtCompact(r.netInflow)}</td>
                    <td style={{ textAlign: 'right' }}>{r.buyPct.toFixed(1)}%</td>
                    <td style={{ textAlign: 'right' }}><Change pct={r.changePct} /></td>
                    <td style={{ textAlign: 'right' }}>{fmtCompact(r.quoteVolume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ padding: '10px 16px', fontSize: 11, color: 'var(--color-text-muted)' }}>
            Entrada líquida = compra agressiva − venda agressiva (USDT), candle diário.
          </div>
        </div>
      )}

      {/* Seletor de ativo (institucional + notícias) */}
      {(activeTab === 'institucional' || activeTab === 'noticias') && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="section-label" style={{ margin: 0 }}>Ativo:</span>
          {cryptos.map(w => (
            <button key={w.id} className={`btn btn-sm ${selected === w.symbol ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelected(w.symbol)}>
              {w.symbol}
            </button>
          ))}
        </div>
      )}

      {/* ── Institucional ── */}
      {activeTab === 'institucional' && (
        <div className="kpi-grid">
          {instError && <Aviso msg={`Falha ao carregar institucional: ${instError}`} />}
          {!inst && !instError && <Aviso msg="Carregando sinal institucional…" />}
          {inst && (
            <>
              <div className={`card-kpi ${inst.coinbasePremium.premiumPct >= 0 ? 'bar-green' : 'bar-red'}`}>
                <div className="section-label">Prêmio Coinbase — {inst.symbol}</div>
                {inst.coinbasePremium.available ? (
                  <>
                    <div style={{ fontSize: 24, fontWeight: 800, color: inst.coinbasePremium.premiumPct >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {inst.coinbasePremium.premiumPct >= 0 ? '+' : ''}{inst.coinbasePremium.premiumPct.toFixed(3)}%
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {fmtPrice(inst.coinbasePremium.premiumAbs)} (Coinbase vs Binance). Positivo = demanda institucional US.
                    </div>
                  </>
                ) : <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Indisponível.</div>}
              </div>
              <div className="card-kpi bar-purple">
                <div className="section-label">Fluxo de ETF Spot</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 6 }}>{inst.etfFlows.reason || 'Em breve.'}</div>
              </div>
              <div className="card-kpi bar-blue">
                <div className="section-label">CME (Futuros)</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 6 }}>{inst.cme.reason || 'Em breve.'}</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Notícias ── */}
      {activeTab === 'noticias' && (
        <div className="card">
          {newsError && <Aviso msg={`Falha ao carregar notícias: ${newsError}`} />}
          {!news && !newsError && <p className="text-[var(--color-text-muted)]" style={{ fontSize: 13 }}>Carregando notícias…</p>}
          {news && !news.available && <Aviso msg={news.reason || 'Notícias indisponíveis.'} />}
          {news && news.available && news.articles.length === 0 && (
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 13 }}>Nenhuma notícia recente para {selected}.</p>
          )}
          {news && news.available && news.articles.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noreferrer"
              className="flex items-start justify-between gap-3"
              style={{ padding: '12px 4px', borderBottom: i < news.articles.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 2 }}>
                  {a.source}{a.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleString('pt-BR')}` : ''}
                </div>
              </div>
              <ExternalLink size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 3 }} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketView;
