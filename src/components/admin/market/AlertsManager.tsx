import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, Power, History } from 'lucide-react';
import { supabase } from '../../../services/supabase';

interface Alert {
  id: string;
  kind: 'price' | 'institutional';
  symbol: string;
  operator: 'gte' | 'lte';
  target_value: number | null;
  active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}
interface AlertEvent { id: string; symbol: string; message: string; created_at: string; }

interface Props { symbols: { symbol: string; display_name: string }[]; }

const OP_LABEL: Record<string, string> = { gte: '≥ (atingir ou subir)', lte: '≤ (atingir ou cair)' };

const AlertsManager: React.FC<Props> = ({ symbols }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [saving, setSaving] = useState(false);

  const firstSymbol = symbols[0]?.symbol || 'BTC';
  const [kind, setKind] = useState<'price' | 'institutional'>('price');
  const [symbol, setSymbol] = useState(firstSymbol);
  const [operator, setOperator] = useState<'gte' | 'lte'>('gte');
  const [target, setTarget] = useState('');

  const load = useCallback(async () => {
    const { data: a } = await supabase.from('market_alerts').select('*').order('created_at', { ascending: false });
    if (a) setAlerts(a as Alert[]);
    const { data: e } = await supabase.from('market_alert_events').select('*').order('created_at', { ascending: false }).limit(15);
    if (e) setEvents(e as AlertEvent[]);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (symbols.length && !symbols.find(s => s.symbol === symbol)) setSymbol(symbols[0].symbol); }, [symbols, symbol]);

  const handleCreate = async () => {
    const value = parseFloat(target.replace(',', '.'));
    if (Number.isNaN(value)) { alert('Informe um valor numérico para o alerta.'); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {
      kind, symbol, operator, target_value: value, active: true,
      ...(kind === 'institutional' ? { params: { metric: 'coinbase_premium' } } : {}),
    };
    const { error } = await supabase.from('market_alerts').insert(payload);
    setSaving(false);
    if (error) { alert('Erro ao criar alerta: ' + error.message); return; }
    setTarget('');
    load();
  };

  const toggle = async (a: Alert) => {
    await supabase.from('market_alerts').update({ active: !a.active }).eq('id', a.id);
    setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, active: !x.active } : x));
  };

  const remove = async (id: string) => {
    if (!window.confirm('Excluir este alerta?')) return;
    await supabase.from('market_alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(x => x.id !== id));
  };

  const condText = (a: Alert) => {
    const op = a.operator === 'gte' ? '≥' : '≤';
    return a.kind === 'price'
      ? `Preço ${op} ${a.target_value}`
      : `Prêmio Coinbase ${op} ${a.target_value}%`;
  };

  return (
    <div className="anim-fade-in">
      {/* Form de criação */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Novo alerta</div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="form-group" style={{ minWidth: 150 }}>
            <label className="form-label">Tipo</label>
            <select className="input-field form-select" value={kind} onChange={e => setKind(e.target.value as 'price' | 'institutional')}>
              <option value="price">Preço</option>
              <option value="institutional">Institucional (prêmio Coinbase)</option>
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 130 }}>
            <label className="form-label">Ativo</label>
            <select className="input-field form-select" value={symbol} onChange={e => setSymbol(e.target.value)}>
              {symbols.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 200 }}>
            <label className="form-label">Condição</label>
            <select className="input-field form-select" value={operator} onChange={e => setOperator(e.target.value as 'gte' | 'lte')}>
              <option value="gte">{OP_LABEL.gte}</option>
              <option value="lte">{OP_LABEL.lte}</option>
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 130 }}>
            <label className="form-label">{kind === 'price' ? 'Preço alvo' : 'Prêmio % alvo'}</label>
            <input className="input-field" inputMode="decimal" placeholder={kind === 'price' ? 'ex: 70000' : 'ex: 0.3'} value={target} onChange={e => setTarget(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            <Plus size={15} /> {saving ? 'Salvando…' : 'Criar alerta'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 10 }}>
          Os alertas são entregues no Telegram pelo monitor do n8n (ativado após conectar o bot).
        </p>
      </div>

      {/* Lista de alertas */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div className="flex items-center gap-2" style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Bell size={16} style={{ color: 'var(--color-primary)' }} />
          <strong style={{ fontSize: 14 }}>Alertas configurados</strong>
        </div>
        {alerts.length === 0 ? (
          <p style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 13 }}>Nenhum alerta ainda. Crie o primeiro acima.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Ativo</th>
                <th style={{ textAlign: 'left' }}>Condição</th>
                <th style={{ textAlign: 'left' }}>Tipo</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.symbol}</strong></td>
                  <td>{condText(a)}</td>
                  <td><span className={`badge ${a.kind === 'price' ? 'badge-info' : 'badge-pending'}`}>{a.kind === 'price' ? 'PREÇO' : 'INSTITUC.'}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${a.active ? 'badge-active' : 'badge-inactive'}`}>{a.active ? 'ATIVO' : 'PAUSADO'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggle(a)} title={a.active ? 'Pausar' : 'Ativar'} style={{ marginRight: 6 }}><Power size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)} title="Excluir"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Histórico de disparos */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <History size={16} style={{ color: 'var(--color-primary)' }} />
          <strong style={{ fontSize: 14 }}>Histórico de disparos</strong>
        </div>
        {events.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nenhum disparo registrado ainda.</p>
        ) : (
          events.map((e, i) => (
            <div key={e.id} style={{ padding: '10px 4px', borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ fontSize: 13 }}><strong>{e.symbol}</strong> — {e.message}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(e.created_at).toLocaleString('pt-BR')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsManager;
