import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Bitcoin, RefreshCw } from 'lucide-react';
import { marketApi, fmtPrice, type PriceRow, type UsdtBrl } from '../../../services/market';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'SUI', 'XRP'];

interface Props {
  /** Cotação USD→BRL (do FinancialView), usada como fallback se o USDT/BRL falhar. */
  usdBrl?: number;
}

// Card de cotações de cripto ao vivo (pares /USDT) + cotação USDT/BRL, para o Financeiro.
const CryptoTickerCard: React.FC<Props> = ({ usdBrl }) => {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [usdt, setUsdt] = useState<UsdtBrl | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [prices, usdtBrl] = await Promise.all([
        marketApi.prices(SYMBOLS),
        marketApi.usdtBrl().catch(() => null),
      ]);
      setRows(prices);
      setUsdt(usdtBrl);
      setUpdatedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const brlRate = usdt?.price ?? usdBrl; // BRL por USDT

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 14 }}>
        <h3 className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 700 }}>
          <Bitcoin size={16} style={{ color: 'var(--color-primary)' }} /> Criptomoedas — cotação ao vivo
        </h3>
        <div className="flex items-center gap-3">
          {usdt && (
            <span style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>USDT/BRL</strong>{' '}
              {fmtPrice(usdt.price, 'BRL')}{' '}
              <span style={{ color: usdt.changePct >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                ({usdt.changePct >= 0 ? '+' : ''}{usdt.changePct.toFixed(2)}%)
              </span>
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading} title="Atualizar">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {updatedAt ? `às ${updatedAt}` : 'Atualizar'}
          </button>
        </div>
      </div>

      {error ? (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Não foi possível carregar as cotações: {error}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SYMBOLS.map(sym => {
            const r = rows.find(x => x.symbol === sym);
            const up = (r?.changePct ?? 0) >= 0;
            return (
              <div key={sym} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '12px 14px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{sym}<span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/USDT</span></span>
                  {r && (
                    <span style={{ color: up ? 'var(--color-success)' : 'var(--color-error)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{up ? '+' : ''}{r.changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{r ? `${r.price.toLocaleString('pt-BR', { minimumFractionDigits: r.price < 1 ? 4 : 2, maximumFractionDigits: r.price < 1 ? 4 : 2 })} USDT` : '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {r && brlRate ? `≈ ${fmtPrice(r.price * brlRate, 'BRL')}` : (r ? '' : 'carregando…')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CryptoTickerCard;
