/* NeoVertex — Admin (Login + CRM + Financeiro + Agenda) */
const { useState: aUseState, useEffect: aUseEffect, useMemo: aUseMemo } = React;

const NV_AUTH_KEY = 'nv-auth-v1';
const NV_CLIENTES = 'nv-clientes-v1';
const NV_FIN = 'nv-financeiro-v1';
const NV_AGENDA = 'nv-agenda-v1';
const NV_LEADS = 'nv-leads-v1';
const NV_TASKS = 'nv-tasks-v1';
const NV_NOTES = 'nv-notes-v1';
const NV_PROJECTS = 'nv-projects-v1';
const NV_MENSAGENS = 'nv-mensagens-v1';
const NV_CRED = { user: 'nelsinhololx', pass: '31577244' };

const SEED_CLIENTES = [
  { id: 1, nome: 'Clínica Espaço Família', contato: 'Dra. Marina', email: 'contato@clinicaespacofamilia.com.br', tel: '+55 11 99876-1010', plano: 'Sistema completo', mensalidade: 1850, diaVencimento: 5, status: 'ativo' },
  { id: 2, nome: 'Aquarise Shop', contato: 'Camila Roth', email: 'hello@aquariseshop.com', tel: '+41 76 412 88 02', plano: 'E-commerce', mensalidade: 1200, diaVencimento: 10, status: 'ativo' },
  { id: 3, nome: 'Skintech Switzerland', contato: 'Jean Müller', email: 'info@skintechswitzerland.ch', tel: '+41 22 555 87 14', plano: 'Site institucional', mensalidade: 680, diaVencimento: 15, status: 'ativo' },
  { id: 4, nome: 'Luazul Community', contato: 'Helena Costa', email: 'team@luazulcommunity.ch', tel: '+41 79 333 21 09', plano: 'Plataforma comunidade', mensalidade: 950, diaVencimento: 20, status: 'ativo' },
];
const SEED_FIN = [
  { id: 1, data: '2026-05-01', cliente: 'Clínica Espaço Família', categoria: 'Mensalidade', valor: 1850, tipo: 'entrada', pago: true },
  { id: 2, data: '2026-05-01', cliente: 'Aquarise Shop',           categoria: 'Mensalidade', valor: 1200, tipo: 'entrada', pago: true },
  { id: 3, data: '2026-05-03', cliente: 'Skintech Switzerland',    categoria: 'Mensalidade', valor: 680,  tipo: 'entrada', pago: true },
  { id: 4, data: '2026-05-05', cliente: '—',                       categoria: 'Servidor (DigitalOcean)', valor: 240, tipo: 'saida', pago: true },
  { id: 5, data: '2026-05-07', cliente: 'Luazul Community',        categoria: 'Mensalidade', valor: 950,  tipo: 'entrada', pago: false },
  { id: 6, data: '2026-05-08', cliente: '—',                       categoria: 'Domínios (.com.br)', valor: 89,  tipo: 'saida', pago: true },
];
const SEED_LEADS = [
  { id: 1, nome: 'Studio Aurora', contato: 'Beatriz Lima', email: 'bia@studioaurora.com.br', tel: '+55 11 98123-7766', interesse: 'Site institucional + agenda online', valor: 4800, etapa: 'proposta', origem: 'Indicação', notas: 'Enviou referências. Aguardar resposta sobre orçamento.', criado: '2026-04-22' },
  { id: 2, nome: 'Café Colheita', contato: 'Roger M.', email: 'roger@cafecolheita.com', tel: '+55 31 99412-0098', interesse: 'Loja virtual + integração WhatsApp', valor: 6200, etapa: 'conversa', origem: 'Instagram', notas: 'Reunião marcada para 12/05.', criado: '2026-05-02' },
  { id: 3, nome: 'Boutique Flôr de Lis', contato: 'Manuela Schäfer', email: 'manu@flordelis.ch', tel: '+41 78 644 11 22', interesse: 'E-commerce CH/FR', valor: 8500, etapa: 'novo', origem: 'Site', notas: 'Primeiro contato pelo formulário.', criado: '2026-05-08' },
];
const SEED_AGENDA = [
  { id: 1, data: '2026-05-09', hora: '09:30', titulo: 'Reunião Aquarise — nova landing', cliente: 'Aquarise Shop', tipo: 'reuniao' },
  { id: 2, data: '2026-05-09', hora: '14:00', titulo: 'Deploy Espaço Família — módulo orto', cliente: 'Clínica Espaço Família', tipo: 'deploy' },
  { id: 3, data: '2026-05-12', hora: '10:00', titulo: 'Apresentação Luazul — v2', cliente: 'Luazul Community', tipo: 'reuniao' },
  { id: 4, data: '2026-05-15', hora: '15:30', titulo: 'Manutenção Skintech', cliente: 'Skintech Switzerland', tipo: 'manutencao' },
];
const SEED_TASKS = [
  { id: 1, titulo: 'Revisar bug do login mobile', clienteId: 1, data: '2026-05-09', prioridade: 'alta', concluida: false, desc: 'Erro 500 ao logar pelo Safari iOS' },
  { id: 2, titulo: 'Implementar módulo ortodontia', clienteId: 1, data: '2026-05-09', prioridade: 'media', concluida: false, desc: 'Tela de plano de tratamento + parcelas' },
  { id: 3, titulo: 'Atualizar produtos da Aquarise', clienteId: 2, data: '2026-05-09', prioridade: 'baixa', concluida: true, desc: 'Subir 12 SKUs novos da linha verão' },
  { id: 4, titulo: 'Reunião de alinhamento', clienteId: 4, data: '2026-05-12', prioridade: 'alta', concluida: false, desc: 'Definir escopo da v2 com a Helena' },
  { id: 5, titulo: 'Renovar SSL do domínio', clienteId: 3, data: '2026-05-15', prioridade: 'media', concluida: false, desc: '' },
  { id: 6, titulo: 'Postar artigo no blog', clienteId: null, data: '2026-05-10', prioridade: 'baixa', concluida: false, desc: 'Tema: por que custom > genérico' },
];
const SEED_PROJECTS = [
  { id: 1, clienteId: 1, data: '2026-01-15', tipo: 'entrega', titulo: 'Sistema lançado em produção', desc: 'V1 com módulos: pacientes, agenda, prontuário, financeiro. Treinamento da equipe (4 pessoas).' },
  { id: 2, clienteId: 1, data: '2026-02-20', tipo: 'feature', titulo: 'WhatsApp de confirmação automática', desc: 'Integração com API oficial. Reduziu 40% de no-shows.' },
  { id: 3, clienteId: 1, data: '2026-03-08', tipo: 'manutencao', titulo: 'Migração para servidor maior', desc: 'Crescimento orgânico — upgrade de droplet 2GB → 4GB.' },
  { id: 4, clienteId: 1, data: '2026-04-12', tipo: 'feature', titulo: 'Relatório financeiro mensal', desc: 'Dashboard com receita por procedimento, ticket médio, comparativo mês a mês.' },
  { id: 5, clienteId: 2, data: '2025-11-10', tipo: 'entrega', titulo: 'E-commerce Aquarise no ar', desc: 'Loja completa em pt-BR + EN + DE. Stripe + checkout transparente. 8 marcas catalogadas.' },
  { id: 6, clienteId: 2, data: '2025-12-22', tipo: 'feature', titulo: 'Programa de fidelidade', desc: 'Pontos por compra + clube de descontos pra clientes recorrentes.' },
  { id: 7, clienteId: 2, data: '2026-03-15', tipo: 'feature', titulo: 'Frete internacional automático', desc: 'Cálculo via Swiss Post + DHL. Cobertura: CH, FR, DE, IT, PT.' },
  { id: 8, clienteId: 3, data: '2026-02-04', tipo: 'entrega', titulo: 'Site institucional Skintech', desc: 'Apresentação da linha de máquinas + formulário de orçamento. FR + DE.' },
  { id: 9, clienteId: 3, data: '2026-04-01', tipo: 'manutencao', titulo: 'Atualização de catálogo', desc: 'Adicionados 3 equipamentos novos com fichas técnicas em PDF.' },
  { id: 10, clienteId: 4, data: '2025-10-05', tipo: 'entrega', titulo: 'Plataforma da comunidade Luazul', desc: 'Área de membros, fórum, eventos, conteúdo exclusivo. Login social.' },
  { id: 11, clienteId: 4, data: '2026-01-22', tipo: 'feature', titulo: 'Sistema de eventos pagos', desc: 'Inscrição, pagamento Stripe, lista de presença, certificado automático.' },
  { id: 12, clienteId: 4, data: '2026-03-30', tipo: 'bug', titulo: 'Correção de notificações duplicadas', desc: 'Worker do email estava disparando 2× — fix em produção.' },
];

const loadLS = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const fmtBRL = n => 'R$ ' + Number(n||0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── LOGIN MODAL ── */
function LoginModal({ onClose, onLogin }) {
  const [user, setUser] = aUseState('');
  const [pass, setPass] = aUseState('');
  const [err, setErr] = aUseState('');
  const submit = (e) => {
    e.preventDefault();
    if (user.trim() === NV_CRED.user && pass === NV_CRED.pass) {
      saveLS(NV_AUTH_KEY, { user, ts: Date.now() });
      onLogin(user);
    } else {
      setErr('Usuário ou senha incorretos.');
    }
  };
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-login" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose} aria-label="Fechar">×</button>
        <div className="adm-login-brand">
          <span className="adm-mark">N<span className="adm-arrow">↗</span></span>
          <span className="adm-brand-name">NeoVertex</span>
        </div>
        <h2>Acessar painel</h2>
        <p className="adm-login-sub">Entre para gerenciar clientes, financeiro e agenda.</p>
        <form onSubmit={submit} className="adm-form">
          <label>
            <span>Usuário</span>
            <input type="text" autoComplete="username" autoFocus value={user} onChange={e => { setUser(e.target.value); setErr(''); }} placeholder="seu usuário"/>
          </label>
          <label>
            <span>Senha</span>
            <input type="password" autoComplete="current-password" value={pass} onChange={e => { setPass(e.target.value); setErr(''); }} placeholder="sua senha"/>
          </label>
          {err && <div className="adm-err">{err}</div>}
          <button type="submit" className="adm-submit">Entrar</button>
        </form>
        <div className="adm-login-foot">Acesso restrito · NeoVertex 2026</div>
      </div>
    </div>
  );
}

/* ── CRM TAB ── */
function CRMTab({ onOpenClient }) {
  const [clientes, setClientes] = aUseState(() => loadLS(NV_CLIENTES, SEED_CLIENTES));
  const [q, setQ] = aUseState('');
  const [editing, setEditing] = aUseState(null);
  aUseEffect(() => saveLS(NV_CLIENTES, clientes), [clientes]);

  const filtered = clientes.filter(c =>
    !q || c.nome.toLowerCase().includes(q.toLowerCase()) || c.contato?.toLowerCase().includes(q.toLowerCase())
  );
  const ativos = clientes.filter(c => c.status === 'ativo').length;
  const mrr = clientes.filter(c => c.status === 'ativo').reduce((s, c) => s + Number(c.mensalidade || 0), 0);

  const save = (data) => {
    if (data.id) setClientes(cs => cs.map(c => c.id === data.id ? data : c));
    else { const id = Math.max(0, ...clientes.map(c => c.id)) + 1; setClientes(cs => [...cs, { ...data, id }]); }
    setEditing(null);
  };
  const remove = (id) => { if (confirm('Remover este cliente?')) setClientes(cs => cs.filter(c => c.id !== id)); };

  return (
    <div className="adm-tab">
      <div className="adm-kpis">
        <div className="adm-kpi"><span>Clientes ativos</span><strong>{ativos}</strong></div>
        <div className="adm-kpi"><span>Receita recorrente (MRR)</span><strong>{fmtBRL(mrr)}</strong></div>
        <div className="adm-kpi"><span>Total de clientes</span><strong>{clientes.length}</strong></div>
      </div>
      <div className="adm-toolbar">
        <input className="adm-search" placeholder="Buscar cliente..." value={q} onChange={e => setQ(e.target.value)}/>
        <button className="adm-btn-primary" onClick={() => setEditing({ nome:'', contato:'', email:'', tel:'', plano:'', mensalidade:0, status:'ativo' })}>+ Novo cliente</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Cliente</th><th>Contato</th><th>Plano</th><th style={{textAlign:'right'}}>Mensalidade</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="adm-row-clickable" onClick={() => onOpenClient(c.id)}>
                <td><strong className="adm-link">{c.nome} →</strong><div className="adm-sub">{c.email}</div></td>
                <td>{c.contato}<div className="adm-sub">{c.tel}</div></td>
                <td>{c.plano}</td>
                <td style={{textAlign:'right'}}>{fmtBRL(c.mensalidade)}</td>
                <td><span className={`adm-pill ${c.status}`}>{c.status === 'ativo' ? 'Ativo' : c.status === 'pausado' ? 'Pausado' : 'Cancelado'}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="adm-icon-btn" onClick={() => setEditing(c)}>Editar</button>
                  <button className="adm-icon-btn danger" onClick={() => remove(c.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" className="adm-empty">Nenhum cliente encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <ClientEditor data={editing} onSave={save} onClose={() => setEditing(null)}/>}
    </div>
  );
}

function ClientEditor({ data, onSave, onClose }) {
  const [d, setD] = aUseState(data);
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose}>×</button>
        <h3>{d.id ? 'Editar cliente' : 'Novo cliente'}</h3>
        <div className="adm-form-grid">
          <label><span>Empresa</span><input value={d.nome} onChange={e => set('nome', e.target.value)}/></label>
          <label><span>Contato</span><input value={d.contato} onChange={e => set('contato', e.target.value)}/></label>
          <label><span>E-mail</span><input type="email" value={d.email} onChange={e => set('email', e.target.value)}/></label>
          <label><span>Telefone</span><input value={d.tel} onChange={e => set('tel', e.target.value)}/></label>
          <label><span>Plano</span><input value={d.plano} onChange={e => set('plano', e.target.value)}/></label>
          <label><span>Mensalidade (R$)</span><input type="number" step="0.01" value={d.mensalidade} onChange={e => set('mensalidade', Number(e.target.value))}/></label>
          <label><span>Dia do vencimento</span>
            <select value={d.diaVencimento || ''} onChange={e => set('diaVencimento', e.target.value === '' ? null : Number(e.target.value))}>
              <option value="">— Sem mensalidade —</option>
              {Array.from({length:31}, (_,i) => i+1).map(n => <option key={n} value={n}>Dia {n}</option>)}
            </select>
          </label>
          <label><span>Status</span>
            <select value={d.status} onChange={e => set('status', e.target.value)}>
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>
        </div>
        <div className="adm-actions">
          <button className="adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn-primary" onClick={() => onSave(d)} disabled={!d.nome}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/* ── LEADS TAB ── */
function LeadsTab({ onConvert }) {
  const [leads, setLeads] = aUseState(() => loadLS(NV_LEADS, SEED_LEADS));
  const [editing, setEditing] = aUseState(null);
  const [filtro, setFiltro] = aUseState('ativos');
  aUseEffect(() => saveLS(NV_LEADS, leads), [leads]);

  const ETAPAS = [
    { k:'novo', l:'Novo', color:'var(--cyan)' },
    { k:'conversa', l:'Em conversa', color:'var(--purple)' },
    { k:'proposta', l:'Proposta enviada', color:'var(--yellow)' },
    { k:'ganho', l:'Ganho — virou cliente', color:'var(--green)' },
    { k:'perdido', l:'Perdido', color:'var(--red)' },
  ];
  const filtered = leads.filter(l => filtro === 'todos' ? true : filtro === 'ativos' ? !['ganho','perdido'].includes(l.etapa) : l.etapa === filtro);
  const grouped = ETAPAS.map(e => ({ ...e, items: filtered.filter(l => l.etapa === e.k) })).filter(g => g.items.length > 0);
  const valorPipe = filtered.filter(l => !['ganho','perdido'].includes(l.etapa)).reduce((s,l) => s + Number(l.valor || 0), 0);

  const save = (d) => {
    if (d.id) setLeads(xs => xs.map(x => x.id === d.id ? d : x));
    else setLeads(xs => [...xs, { ...d, id: Math.max(0, ...leads.map(l => l.id)) + 1, criado: new Date().toISOString().slice(0,10) }]);
    setEditing(null);
  };
  const remove = (id) => { if (confirm('Remover lead?')) setLeads(xs => xs.filter(x => x.id !== id)); };
  const move = (id, etapa) => setLeads(xs => xs.map(l => l.id === id ? {...l, etapa} : l));
  const converter = (lead) => {
    if (!confirm(`Converter "${lead.nome}" em cliente ativo?`)) return;
    onConvert({
      nome: lead.nome, contato: lead.contato, email: lead.email, tel: lead.tel,
      plano: lead.interesse, mensalidade: 0, diaVencimento: null, status: 'ativo'
    });
    setLeads(xs => xs.map(l => l.id === lead.id ? {...l, etapa:'ganho'} : l));
  };

  return (
    <div className="adm-tab">
      <div className="adm-kpis">
        <div className="adm-kpi"><span>Leads ativos</span><strong>{filtered.filter(l => !['ganho','perdido'].includes(l.etapa)).length}</strong></div>
        <div className="adm-kpi entrada"><span>Valor no pipeline</span><strong>{fmtBRL(valorPipe)}</strong></div>
        <div className="adm-kpi"><span>Ganhos</span><strong>{leads.filter(l => l.etapa === 'ganho').length}</strong></div>
        <div className="adm-kpi pend"><span>Perdidos</span><strong>{leads.filter(l => l.etapa === 'perdido').length}</strong></div>
      </div>
      <div className="adm-toolbar">
        <div className="adm-tabs-mini">
          {[['ativos','Ativos'],['novo','Novos'],['conversa','Em conversa'],['proposta','Proposta'],['ganho','Ganhos'],['perdido','Perdidos'],['todos','Todos']].map(([k,l]) => (
            <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{l}</button>
          ))}
        </div>
        <button className="adm-btn-primary" onClick={() => setEditing({ nome:'', contato:'', email:'', tel:'', interesse:'', valor:0, etapa:'novo', origem:'', notas:'' })}>+ Novo lead</button>
      </div>
      <div className="adm-list">
        {grouped.map(g => (
          <div key={g.k}>
            <div className="adm-list-head" style={{color: g.color}}>{g.l} · {g.items.length}</div>
            {g.items.map(l => (
              <div key={l.id} className="adm-task" style={{borderLeft:`3px solid ${g.color}`}}>
                <div className="adm-task-body">
                  <div className="adm-task-head">
                    <strong>{l.nome}</strong>
                    {l.valor > 0 && <span className="adm-event-tipo" style={{background:'rgba(80,250,123,0.15)',color:'var(--green)',borderColor:'rgba(80,250,123,0.3)'}}>{fmtBRL(l.valor)}</span>}
                    {l.origem && <span className="adm-sub">via {l.origem}</span>}
                  </div>
                  <div className="adm-sub" style={{marginTop:4}}>{l.contato} · {l.email} · {l.tel}</div>
                  <div className="adm-sub" style={{marginTop:4,color:'var(--fg)',opacity:0.75}}><strong style={{color:g.color}}>Interesse:</strong> {l.interesse}</div>
                  {l.notas && <div className="adm-sub" style={{marginTop:6,padding:'8px 10px',background:'rgba(241,250,140,0.04)',border:'1px solid rgba(241,250,140,0.10)',borderRadius:8}}>{l.notas}</div>}
                  <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                    {ETAPAS.filter(e => e.k !== l.etapa && e.k !== 'ganho').map(e => (
                      <button key={e.k} className="adm-icon-btn" onClick={() => move(l.id, e.k)}>→ {e.l}</button>
                    ))}
                    {l.etapa !== 'ganho' && <button className="adm-icon-btn" style={{borderColor:'var(--green)',color:'var(--green)'}} onClick={() => converter(l)}>✓ Converter em cliente</button>}
                  </div>
                </div>
                <div className="adm-event-actions">
                  <button className="adm-icon-btn" onClick={() => setEditing(l)}>Editar</button>
                  <button className="adm-icon-btn danger" onClick={() => remove(l.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && <div className="adm-empty">Nenhum lead neste filtro.</div>}
      </div>
      {editing && <LeadEditor data={editing} etapas={ETAPAS} onSave={save} onClose={() => setEditing(null)}/>}
    </div>
  );
}

function LeadEditor({ data, etapas, onSave, onClose }) {
  const [d, setD] = aUseState(data);
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose}>×</button>
        <h3>{d.id ? 'Editar lead' : 'Novo lead'}</h3>
        <div className="adm-form-grid">
          <label className="span2"><span>Empresa / Pessoa</span><input value={d.nome} onChange={e => set('nome', e.target.value)} autoFocus/></label>
          <label><span>Contato</span><input value={d.contato} onChange={e => set('contato', e.target.value)}/></label>
          <label><span>Origem</span><input value={d.origem} onChange={e => set('origem', e.target.value)} placeholder="Indicação, Instagram, Site..."/></label>
          <label><span>E-mail</span><input type="email" value={d.email} onChange={e => set('email', e.target.value)}/></label>
          <label><span>Telefone</span><input value={d.tel} onChange={e => set('tel', e.target.value)}/></label>
          <label className="span2"><span>Interesse</span><input value={d.interesse} onChange={e => set('interesse', e.target.value)} placeholder="O que ele quer"/></label>
          <label><span>Valor estimado (R$)</span><input type="number" step="0.01" value={d.valor} onChange={e => set('valor', Number(e.target.value))}/></label>
          <label><span>Etapa</span><select value={d.etapa} onChange={e => set('etapa', e.target.value)}>
            {etapas.map(et => <option key={et.k} value={et.k}>{et.l}</option>)}
          </select></label>
          <label className="span2"><span>Notas</span><textarea rows={3} value={d.notas} onChange={e => set('notas', e.target.value)} style={{padding:'11px 14px',background:'rgba(248,248,242,0.03)',border:'1px solid rgba(248,248,242,0.10)',borderRadius:10,color:'var(--fg)',font:'500 14px/1.4 var(--sans)',resize:'vertical'}}/></label>
        </div>
        <div className="adm-actions">
          <button className="adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn-primary" onClick={() => onSave(d)} disabled={!d.nome}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/* ── FINANCEIRO TAB ── */
function FinTab() {
  const [items, setItems] = aUseState(() => loadLS(NV_FIN, SEED_FIN));
  const [filtro, setFiltro] = aUseState('todos');
  const [editing, setEditing] = aUseState(null);
  aUseEffect(() => saveLS(NV_FIN, items), [items]);

  const yMonth = new Date().toISOString().slice(0,7); // AAAA-MM atual
  const noMes = (i) => typeof i.data === 'string' && i.data.startsWith(yMonth);
  const entradas = items.filter(i => i.tipo === 'entrada' && i.pago && noMes(i)).reduce((s, i) => s + Number(i.valor), 0);
  const saidas = items.filter(i => i.tipo === 'saida' && i.pago && noMes(i)).reduce((s, i) => s + Number(i.valor), 0);
  const aReceber = items.filter(i => i.tipo === 'entrada' && !i.pago).reduce((s, i) => s + Number(i.valor), 0);
  const saldo = entradas - saidas;

  const filtered = items.filter(i => filtro === 'todos' || (filtro === 'entrada' && i.tipo === 'entrada') || (filtro === 'saida' && i.tipo === 'saida') || (filtro === 'pendente' && !i.pago))
    .sort((a, b) => b.data.localeCompare(a.data));

  const save = (d) => {
    if (d.id) setItems(xs => xs.map(x => x.id === d.id ? d : x));
    else setItems(xs => [...xs, { ...d, id: Math.max(0, ...items.map(i => i.id)) + 1 }]);
    setEditing(null);
  };
  const remove = (id) => { if (confirm('Excluir lançamento?')) setItems(xs => xs.filter(x => x.id !== id)); };
  const togglePago = (id) => setItems(xs => xs.map(x => x.id === id ? { ...x, pago: !x.pago } : x));

  return (
    <div className="adm-tab">
      <div className="adm-kpis">
        <div className="adm-kpi entrada"><span>Entradas (mês)</span><strong>{fmtBRL(entradas)}</strong></div>
        <div className="adm-kpi saida"><span>Saídas (mês)</span><strong>{fmtBRL(saidas)}</strong></div>
        <div className="adm-kpi"><span>Saldo</span><strong>{fmtBRL(saldo)}</strong></div>
        <div className="adm-kpi pend"><span>A receber</span><strong>{fmtBRL(aReceber)}</strong></div>
      </div>
      <div className="adm-toolbar">
        <div className="adm-tabs-mini">
          {[['todos','Todos'],['entrada','Entradas'],['saida','Saídas'],['pendente','Pendentes']].map(([k,l]) => (
            <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{l}</button>
          ))}
        </div>
        <button className="adm-btn-primary" onClick={() => setEditing({ data: new Date().toISOString().slice(0,10), cliente:'', categoria:'', valor:0, tipo:'entrada', pago:false })}>+ Lançamento</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Data</th><th>Cliente</th><th>Categoria</th><th>Tipo</th><th style={{textAlign:'right'}}>Valor</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td>{new Date(i.data).toLocaleDateString('pt-BR')}</td>
                <td>{i.cliente}</td>
                <td>{i.categoria}</td>
                <td><span className={`adm-pill ${i.tipo === 'entrada' ? 'ativo' : 'cancelado'}`}>{i.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span></td>
                <td style={{textAlign:'right', fontWeight:600, color: i.tipo === 'entrada' ? 'var(--green)' : 'var(--red)'}}>{i.tipo==='entrada'?'+':'−'}{fmtBRL(i.valor)}</td>
                <td><button className={`adm-pill ${i.pago ? 'ativo' : 'pausado'}`} onClick={() => togglePago(i.id)} style={{cursor:'pointer', border:'none'}}>{i.pago ? 'Pago' : 'Pendente'}</button></td>
                <td>
                  <button className="adm-icon-btn" onClick={() => setEditing(i)}>Editar</button>
                  <button className="adm-icon-btn danger" onClick={() => remove(i.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="adm-empty">Nenhum lançamento.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <FinEditor data={editing} onSave={save} onClose={() => setEditing(null)}/>}
    </div>
  );
}

function FinEditor({ data, onSave, onClose }) {
  const [d, setD] = aUseState(data);
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose}>×</button>
        <h3>{d.id ? 'Editar lançamento' : 'Novo lançamento'}</h3>
        <div className="adm-form-grid">
          <label><span>Data</span><input type="date" value={d.data} onChange={e => set('data', e.target.value)}/></label>
          <label><span>Tipo</span><select value={d.tipo} onChange={e => set('tipo', e.target.value)}><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label>
          <label><span>Cliente / Origem</span><input value={d.cliente} onChange={e => set('cliente', e.target.value)}/></label>
          <label><span>Categoria</span><input value={d.categoria} onChange={e => set('categoria', e.target.value)}/></label>
          <label><span>Valor (R$)</span><input type="number" step="0.01" value={d.valor} onChange={e => set('valor', Number(e.target.value))}/></label>
          <label><span>Status</span><select value={d.pago ? '1' : '0'} onChange={e => set('pago', e.target.value === '1')}><option value="0">Pendente</option><option value="1">Pago</option></select></label>
        </div>
        <div className="adm-actions">
          <button className="adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn-primary" onClick={() => onSave(d)} disabled={!d.categoria || !d.valor}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/* ── AGENDA TAB ── */
function AgendaTab() {
  const [events, setEvents] = aUseState(() => loadLS(NV_AGENDA, SEED_AGENDA));
  const [editing, setEditing] = aUseState(null);
  const [view, setView] = aUseState('lista'); // lista | mes
  const today = new Date().toISOString().slice(0,10);
  aUseEffect(() => saveLS(NV_AGENDA, events), [events]);

  const sorted = [...events].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  const futuros = sorted.filter(e => e.data >= today);
  const passados = sorted.filter(e => e.data < today);

  const save = (d) => {
    if (d.id) setEvents(xs => xs.map(x => x.id === d.id ? d : x));
    else setEvents(xs => [...xs, { ...d, id: Math.max(0, ...events.map(i => i.id)) + 1 }]);
    setEditing(null);
  };
  const remove = (id) => { if (confirm('Remover compromisso?')) setEvents(xs => xs.filter(x => x.id !== id)); };

  // Mini calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const eventsByDay = {};
  events.forEach(e => {
    const d = new Date(e.data);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;
    }
  });

  const tipoLabel = (t) => t === 'reuniao' ? 'Reunião' : t === 'deploy' ? 'Deploy' : t === 'manutencao' ? 'Manutenção' : 'Outro';
  const tipoColor = (t) => t === 'reuniao' ? 'var(--cyan)' : t === 'deploy' ? 'var(--green)' : t === 'manutencao' ? 'var(--yellow)' : 'var(--purple)';

  return (
    <div className="adm-tab">
      <div className="adm-kpis">
        <div className="adm-kpi"><span>Próximos compromissos</span><strong>{futuros.length}</strong></div>
        <div className="adm-kpi"><span>Hoje</span><strong>{events.filter(e => e.data === today).length}</strong></div>
        <div className="adm-kpi"><span>Total no histórico</span><strong>{events.length}</strong></div>
      </div>
      <div className="adm-toolbar">
        <div className="adm-tabs-mini">
          <button className={view === 'lista' ? 'on' : ''} onClick={() => setView('lista')}>Lista</button>
          <button className={view === 'mes' ? 'on' : ''} onClick={() => setView('mes')}>Mês</button>
        </div>
        <button className="adm-btn-primary" onClick={() => setEditing({ data: today, hora:'10:00', titulo:'', cliente:'', tipo:'reuniao' })}>+ Compromisso</button>
      </div>

      {view === 'mes' ? (
        <div className="adm-cal">
          <div className="adm-cal-head"><strong>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</strong></div>
          <div className="adm-cal-grid">
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => <div key={d} className="adm-cal-dow">{d}</div>)}
            {Array.from({length: firstDay}).map((_, i) => <div key={'e'+i} className="adm-cal-cell empty"/>)}
            {Array.from({length: daysInMonth}).map((_, i) => {
              const day = i + 1;
              const isToday = day === now.getDate();
              const count = eventsByDay[day] || 0;
              return (
                <div key={day} className={`adm-cal-cell ${isToday ? 'today' : ''} ${count ? 'has' : ''}`}>
                  <span>{day}</span>
                  {count > 0 && <em>{count}</em>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="adm-list">
          {futuros.length > 0 && <div className="adm-list-head">Próximos</div>}
          {futuros.map(e => (
            <div key={e.id} className="adm-event">
              <div className="adm-event-date">
                <strong>{new Date(e.data).getDate().toString().padStart(2,'0')}</strong>
                <span>{new Date(e.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')}</span>
              </div>
              <div className="adm-event-body">
                <div className="adm-event-head">
                  <span className="adm-event-tipo" style={{ background: tipoColor(e.tipo) + '22', color: tipoColor(e.tipo), borderColor: tipoColor(e.tipo) + '55' }}>{tipoLabel(e.tipo)}</span>
                  <strong>{e.titulo}</strong>
                </div>
                <div className="adm-sub">{e.hora} · {e.cliente || 'sem cliente'}</div>
              </div>
              <div className="adm-event-actions">
                <button className="adm-icon-btn" onClick={() => setEditing(e)}>Editar</button>
                <button className="adm-icon-btn danger" onClick={() => remove(e.id)}>Excluir</button>
              </div>
            </div>
          ))}
          {passados.length > 0 && <div className="adm-list-head">Histórico</div>}
          {passados.slice().reverse().map(e => (
            <div key={e.id} className="adm-event past">
              <div className="adm-event-date">
                <strong>{new Date(e.data).getDate().toString().padStart(2,'0')}</strong>
                <span>{new Date(e.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')}</span>
              </div>
              <div className="adm-event-body">
                <div className="adm-event-head">
                  <span className="adm-event-tipo" style={{ background: tipoColor(e.tipo) + '15', color: tipoColor(e.tipo), borderColor: tipoColor(e.tipo) + '33' }}>{tipoLabel(e.tipo)}</span>
                  <strong>{e.titulo}</strong>
                </div>
                <div className="adm-sub">{e.hora} · {e.cliente || 'sem cliente'}</div>
              </div>
              <div className="adm-event-actions">
                <button className="adm-icon-btn" onClick={() => setEditing(e)}>Editar</button>
                <button className="adm-icon-btn danger" onClick={() => remove(e.id)}>Excluir</button>
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="adm-empty">Nenhum compromisso. Clique em "+ Compromisso" pra começar.</div>}
        </div>
      )}

      {editing && <AgendaEditor data={editing} onSave={save} onClose={() => setEditing(null)}/>}
    </div>
  );
}

function AgendaEditor({ data, onSave, onClose }) {
  const [d, setD] = aUseState(data);
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose}>×</button>
        <h3>{d.id ? 'Editar compromisso' : 'Novo compromisso'}</h3>
        <div className="adm-form-grid">
          <label><span>Data</span><input type="date" value={d.data} onChange={e => set('data', e.target.value)}/></label>
          <label><span>Hora</span><input type="time" value={d.hora} onChange={e => set('hora', e.target.value)}/></label>
          <label className="span2"><span>Título</span><input value={d.titulo} onChange={e => set('titulo', e.target.value)}/></label>
          <label><span>Cliente</span><input value={d.cliente} onChange={e => set('cliente', e.target.value)}/></label>
          <label><span>Tipo</span><select value={d.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="reuniao">Reunião</option>
            <option value="deploy">Deploy</option>
            <option value="manutencao">Manutenção</option>
            <option value="outro">Outro</option>
          </select></label>
        </div>
        <div className="adm-actions">
          <button className="adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn-primary" onClick={() => onSave(d)} disabled={!d.titulo}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/* ── TASKS TAB (afazeres pessoais) ── */
function TasksTab({ clientes }) {
  const [allTasks, setAllTasks] = aUseState(() => loadLS(NV_TASKS, SEED_TASKS));
  const [editing, setEditing] = aUseState(null);
  const [filtro, setFiltro] = aUseState('hoje');
  const today = new Date().toISOString().slice(0,10);
  aUseEffect(() => saveLS(NV_TASKS, allTasks), [allTasks]);

  // Universal tab shows ONLY personal tasks (clienteId == null)
  const tasks = allTasks.filter(t => t.clienteId == null);
  const sorted = [...tasks].sort((a,b) => {
    if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
    const pri = { alta: 0, media: 1, baixa: 2 };
    if (pri[a.prioridade] !== pri[b.prioridade]) return pri[a.prioridade] - pri[b.prioridade];
    return a.data.localeCompare(b.data);
  });
  const filtered = sorted.filter(t => {
    if (filtro === 'todos') return true;
    if (filtro === 'hoje') return t.data === today && !t.concluida;
    if (filtro === 'atrasadas') return t.data < today && !t.concluida;
    if (filtro === 'concluidas') return t.concluida;
    return true;
  });

  const grouped = { 'Meus afazeres': filtered };
  const setTasks = (updater) => setAllTasks(updater);
  const pendentes = tasks.filter(t => !t.concluida).length;
  const hoje = tasks.filter(t => t.data === today && !t.concluida).length;
  const atrasadas = tasks.filter(t => t.data < today && !t.concluida).length;

  const toggle = (id) => setTasks(xs => xs.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));
  const remove = (id) => { if (confirm('Remover tarefa?')) setTasks(xs => xs.filter(t => t.id !== id)); };
  const save = (d) => {
    const personal = { ...d, clienteId: null }; // universal tab = personal only
    if (personal.id) setTasks(xs => xs.map(x => x.id === personal.id ? personal : x));
    else setTasks(xs => [...xs, { ...personal, id: Math.max(0, ...allTasks.map(t => t.id)) + 1 }]);
    setEditing(null);
  };

  const priColor = (p) => p === 'alta' ? 'var(--red)' : p === 'media' ? 'var(--yellow)' : 'var(--cyan)';

  return (
    <div className="adm-tab">
      <div className="adm-kpis">
        <div className="adm-kpi"><span>Para hoje</span><strong>{hoje}</strong></div>
        <div className="adm-kpi pend"><span>Atrasadas</span><strong>{atrasadas}</strong></div>
        <div className="adm-kpi"><span>Pendentes (total)</span><strong>{pendentes}</strong></div>
        <div className="adm-kpi entrada"><span>Concluídas</span><strong>{tasks.length - pendentes}</strong></div>
      </div>
      <div className="adm-toolbar">
        <div className="adm-tabs-mini">
          {[['hoje','Hoje'],['atrasadas','Atrasadas'],['todos','Todas pendentes'],['concluidas','Concluídas']].map(([k,l]) => (
            <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{l}</button>
          ))}
        </div>
        <button className="adm-btn-primary" onClick={() => setEditing({ titulo:'', clienteId: null, data: today, prioridade:'media', concluida:false, desc:'' })}>+ Novo afazer</button>
      </div>
      <div className="adm-list">
        {Object.entries(grouped).map(([k, arr]) => (
          <div key={k}>
            <div className="adm-list-head">{k} · {arr.length}</div>
            {arr.map(t => (
              <div key={t.id} className={`adm-task ${t.concluida ? 'done' : ''}`}>
                <button className="adm-checkbox" onClick={() => toggle(t.id)} aria-label="Concluir">
                  {t.concluida ? '✓' : ''}
                </button>
                <div className="adm-task-body">
                  <div className="adm-task-head">
                    <span className="adm-event-tipo" style={{ background: priColor(t.prioridade)+'22', color: priColor(t.prioridade), borderColor: priColor(t.prioridade)+'55' }}>{t.prioridade}</span>
                    <strong>{t.titulo}</strong>
                  </div>
                  {t.desc && <div className="adm-sub">{t.desc}</div>}
                  <div className="adm-sub" style={{marginTop:4}}>Para {new Date(t.data).toLocaleDateString('pt-BR')}{t.data < today && !t.concluida ? ' · atrasada' : ''}</div>
                </div>
                <div className="adm-event-actions">
                  <button className="adm-icon-btn" onClick={() => setEditing(t)}>Editar</button>
                  <button className="adm-icon-btn danger" onClick={() => remove(t.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && <div className="adm-empty">Nada na sua lista por aqui.</div>}
      </div>
      {editing && <TaskEditor data={editing} clientes={clientes} onSave={save} onClose={() => setEditing(null)}/>}
    </div>
  );
}

function TaskEditor({ data, clientes, onSave, onClose, hideClient }) {
  const [d, setD] = aUseState(data);
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose}>×</button>
        <h3>{d.id ? 'Editar' : 'Nova'} {hideClient ? (d.clienteId == null ? 'tarefa pessoal' : 'tarefa') : 'tarefa'}</h3>
        <div className="adm-form-grid">
          <label className="span2"><span>Título</span><input value={d.titulo} onChange={e => set('titulo', e.target.value)} autoFocus/></label>
          {!hideClient && <label><span>Cliente</span>
            <select value={d.clienteId == null ? '' : d.clienteId} onChange={e => set('clienteId', e.target.value === '' ? null : Number(e.target.value))}>
              <option value="">— Pessoal —</option>
              {clientes && clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>}
          <label><span>Data</span><input type="date" value={d.data} onChange={e => set('data', e.target.value)}/></label>
          <label><span>Prioridade</span><select value={d.prioridade} onChange={e => set('prioridade', e.target.value)}>
            <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
          </select></label>
          <label><span>Status</span><select value={d.concluida ? '1' : '0'} onChange={e => set('concluida', e.target.value === '1')}>
            <option value="0">Pendente</option><option value="1">Concluída</option>
          </select></label>
          <label className="span2"><span>Descrição</span><textarea rows={3} value={d.desc} onChange={e => set('desc', e.target.value)} style={{padding:'11px 14px',background:'rgba(248,248,242,0.03)',border:'1px solid rgba(248,248,242,0.10)',borderRadius:10,color:'var(--fg)',font:'500 14px/1.4 var(--sans)',resize:'vertical'}}/></label>
        </div>
        <div className="adm-actions">
          <button className="adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn-primary" onClick={() => onSave(d)} disabled={!d.titulo}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/* ── CLIENT PROFILE DRAWER ── */
function ClientProfile({ clientId, onClose }) {
  const clientes = loadLS(NV_CLIENTES, SEED_CLIENTES);
  const [projects, setProjects] = aUseState(() => loadLS(NV_PROJECTS, SEED_PROJECTS));
  const [tasks, setTasks] = aUseState(() => loadLS(NV_TASKS, SEED_TASKS));
  const [notes, setNotes] = aUseState(() => loadLS(NV_NOTES, {}));
  const [finItems, setFinItems] = aUseState(() => loadLS(NV_FIN, SEED_FIN));
  const [editingProj, setEditingProj] = aUseState(null);
  const [editingFin, setEditingFin] = aUseState(null);
  aUseEffect(() => saveLS(NV_PROJECTS, projects), [projects]);
  aUseEffect(() => saveLS(NV_TASKS, tasks), [tasks]);
  aUseEffect(() => saveLS(NV_NOTES, notes), [notes]);
  aUseEffect(() => saveLS(NV_FIN, finItems), [finItems]);

  const c = clientes.find(x => x.id === clientId);
  if (!c) return null;
  const fin = finItems.filter(f => f.cliente === c.nome).sort((a,b) => b.data.localeCompare(a.data));
  const agenda = loadLS(NV_AGENDA, SEED_AGENDA).filter(e => e.cliente === c.nome);
  const myProjects = projects.filter(p => p.clienteId === clientId).sort((a,b) => b.data.localeCompare(a.data));
  const myTasks = tasks.filter(t => t.clienteId === clientId).sort((a,b) => (a.concluida?1:0) - (b.concluida?1:0));
  const totalRecebido = fin.filter(f => f.tipo === 'entrada' && f.pago).reduce((s,f) => s + Number(f.valor), 0);
  const aReceber = fin.filter(f => f.tipo === 'entrada' && !f.pago).reduce((s,f) => s + Number(f.valor), 0);
  const noteValue = notes[clientId] || '';

  const saveFin = (d) => {
    const withClient = { ...d, cliente: c.nome };
    if (withClient.id) setFinItems(xs => xs.map(x => x.id === withClient.id ? withClient : x));
    else setFinItems(xs => [...xs, { ...withClient, id: Math.max(0, ...finItems.map(f => f.id)) + 1 }]);
    setEditingFin(null);
  };
  const removeFin = (id) => { if (confirm('Remover lançamento?')) setFinItems(xs => xs.filter(x => x.id !== id)); };
  const togglePago = (id) => setFinItems(xs => xs.map(x => x.id === id ? { ...x, pago: !x.pago } : x));

  const tipoColor = (t) => t === 'entrega' ? 'var(--green)' : t === 'feature' ? 'var(--purple)' : t === 'manutencao' ? 'var(--yellow)' : t === 'bug' ? 'var(--red)' : 'var(--cyan)';
  const tipoLabel = (t) => ({entrega:'Entrega',feature:'Funcionalidade',manutencao:'Manutenção',bug:'Correção',reuniao:'Reunião'}[t] || t);

  const saveProj = (d) => {
    if (d.id) setProjects(xs => xs.map(x => x.id === d.id ? d : x));
    else setProjects(xs => [...xs, { ...d, id: Math.max(0, ...projects.map(p => p.id)) + 1, clienteId: clientId }]);
    setEditingProj(null);
  };
  const removeProj = (id) => { if (confirm('Remover do histórico?')) setProjects(xs => xs.filter(x => x.id !== id)); };
  const [editingTask, setEditingTask] = aUseState(null);
  const toggleTask = (id) => setTasks(xs => xs.map(t => t.id === id ? {...t, concluida: !t.concluida} : t));
  const removeTask = (id) => { if (confirm('Remover tarefa?')) setTasks(xs => xs.filter(t => t.id !== id)); };
  const saveTask = (d) => {
    const withClient = { ...d, clienteId };
    if (withClient.id) setTasks(xs => xs.map(x => x.id === withClient.id ? withClient : x));
    else setTasks(xs => [...xs, { ...withClient, id: Math.max(0, ...tasks.map(t => t.id)) + 1 }]);
    setEditingTask(null);
  };

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div className="adm-drawer" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose}>×</button>
        <div className="adm-profile-head">
          <span className="eyebrow" style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--comment)'}}>Perfil do cliente</span>
          <h2 style={{margin:'8px 0 6px',font:'700 28px/1.15 var(--sans)',letterSpacing:'-0.02em'}}>{c.nome}</h2>
          <div className="adm-sub">{c.contato} · {c.email} · {c.tel}</div>
          <div style={{display:'flex',gap:10,marginTop:14,flexWrap:'wrap'}}>
            <span className={`adm-pill ${c.status}`}>{c.status}</span>
            <span className="adm-pill ativo" style={{background:'rgba(189,147,249,0.10)',color:'var(--purple)',borderColor:'rgba(189,147,249,0.3)'}}>{c.plano}</span>
            {c.diaVencimento ? (
              <span className="adm-pill ativo" style={{background:'rgba(139,233,253,0.10)',color:'var(--cyan)',borderColor:'rgba(139,233,253,0.3)'}}>Mensalidade {fmtBRL(c.mensalidade)} · vence dia {c.diaVencimento}</span>
            ) : (
              <span className="adm-pill" style={{background:'rgba(248,248,242,0.04)',color:'var(--comment)',borderColor:'rgba(248,248,242,0.10)'}}>Sem mensalidade</span>
            )}
          </div>
          {(() => {
            if (!c.diaVencimento) return null;
            const today = new Date();
            const venc = new Date(today.getFullYear(), today.getMonth(), c.diaVencimento);
            const diff = Math.round((venc - today) / 86400000);
            const yMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
            const pagoEsteMes = finItems.some(f => f.cliente === c.nome && f.tipo === 'entrada' && f.pago && f.categoria.toLowerCase().includes('mensal') && f.data.startsWith(yMonth));
            if (pagoEsteMes) return <div className="adm-vence-alert ok">Mensalidade deste mês já paga.</div>;
            if (diff < 0) return <div className="adm-vence-alert overdue">Vencimento atrasado em {Math.abs(diff)} dia(s) — venceu em {venc.toLocaleDateString('pt-BR')}.</div>;
            if (diff === 0) return <div className="adm-vence-alert today">Vence hoje — cobrar {fmtBRL(c.mensalidade)}.</div>;
            if (diff <= 7) return <div className="adm-vence-alert soon">Vence em {diff} dia(s) — {venc.toLocaleDateString('pt-BR')}.</div>;
            return <div className="adm-vence-alert future">Próximo vencimento em {diff} dias — {venc.toLocaleDateString('pt-BR')}.</div>;
          })()}
        </div>

        <div className="adm-profile-kpis">
          <div className="adm-kpi"><span>Total recebido</span><strong style={{color:'var(--green)'}}>{fmtBRL(totalRecebido)}</strong></div>
          <div className="adm-kpi pend"><span>A receber</span><strong>{fmtBRL(aReceber)}</strong></div>
          <div className="adm-kpi"><span>Entregas</span><strong>{myProjects.length}</strong></div>
          <div className="adm-kpi"><span>Tarefas abertas</span><strong>{myTasks.filter(t => !t.concluida).length}</strong></div>
        </div>

        <section className="adm-profile-sec">
          <div className="adm-profile-sec-head">
            <h3>Notas internas</h3>
          </div>
          <textarea
            className="adm-notes"
            placeholder="Anotações privadas sobre este cliente — preferências, contexto, gatilhos, contatos paralelos..."
            value={noteValue}
            onChange={e => setNotes(n => ({ ...n, [clientId]: e.target.value }))}
            rows={3}
          />
        </section>

        <section className="adm-profile-sec">
          <div className="adm-profile-sec-head">
            <h3>Histórico do projeto</h3>
            <button className="adm-btn-primary" onClick={() => setEditingProj({ data: new Date().toISOString().slice(0,10), tipo:'feature', titulo:'', desc:'' })}>+ Adicionar entrada</button>
          </div>
          <div className="adm-timeline">
            {myProjects.map(p => (
              <div key={p.id} className="adm-timeline-item" style={{borderLeftColor: tipoColor(p.tipo)}}>
                <div className="adm-timeline-dot" style={{background: tipoColor(p.tipo)}}/>
                <div className="adm-timeline-meta">
                  <span className="adm-event-tipo" style={{background: tipoColor(p.tipo)+'22', color: tipoColor(p.tipo), borderColor: tipoColor(p.tipo)+'55'}}>{tipoLabel(p.tipo)}</span>
                  <span className="adm-sub">{new Date(p.data).toLocaleDateString('pt-BR', {day:'2-digit', month:'short', year:'numeric'})}</span>
                </div>
                <div className="adm-timeline-title">{p.titulo}</div>
                {p.desc && <div className="adm-timeline-desc">{p.desc}</div>}
                <div className="adm-timeline-actions">
                  <button className="adm-icon-btn" onClick={() => setEditingProj(p)}>Editar</button>
                  <button className="adm-icon-btn danger" onClick={() => removeProj(p.id)}>Excluir</button>
                </div>
              </div>
            ))}
            {myProjects.length === 0 && <div className="adm-empty">Sem histórico ainda. Adicione a primeira entrega.</div>}
          </div>
        </section>

        <section className="adm-profile-sec">
          <div className="adm-profile-sec-head">
            <h3>Tarefas deste cliente</h3>
            <button className="adm-btn-primary" onClick={() => setEditingTask({ titulo:'', clienteId, data: new Date().toISOString().slice(0,10), prioridade:'media', concluida:false, desc:'' })}>+ Nova tarefa</button>
          </div>
          <div className="adm-list">
            {myTasks.map(t => {
              const priColor = t.prioridade === 'alta' ? 'var(--red)' : t.prioridade === 'media' ? 'var(--yellow)' : 'var(--cyan)';
              return (
                <div key={t.id} className={`adm-task ${t.concluida ? 'done' : ''}`}>
                  <button className="adm-checkbox" onClick={() => toggleTask(t.id)}>{t.concluida ? '✓' : ''}</button>
                  <div className="adm-task-body">
                    <div className="adm-task-head">
                      <span className="adm-event-tipo" style={{background: priColor+'22', color: priColor, borderColor: priColor+'55'}}>{t.prioridade}</span>
                      <strong>{t.titulo}</strong>
                    </div>
                    {t.desc && <div className="adm-sub">{t.desc}</div>}
                    <div className="adm-sub" style={{marginTop:4}}>Para {new Date(t.data).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="adm-event-actions">
                    <button className="adm-icon-btn" onClick={() => setEditingTask(t)}>Editar</button>
                    <button className="adm-icon-btn danger" onClick={() => removeTask(t.id)}>Excluir</button>
                  </div>
                </div>
              );
            })}
            {myTasks.length === 0 && <div className="adm-empty">Sem tarefas. Clique em + Nova tarefa.</div>}
          </div>
        </section>

        <section className="adm-profile-sec">
          <div className="adm-profile-sec-head">
            <h3>Financeiro</h3>
            <button className="adm-btn-primary" onClick={() => setEditingFin({ data: new Date().toISOString().slice(0,10), cliente: c.nome, categoria:'Mensalidade', valor: c.mensalidade || 0, tipo:'entrada', pago:false })}>+ Lançamento</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Data</th><th>Categoria</th><th>Tipo</th><th style={{textAlign:'right'}}>Valor</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {fin.map(f => (
                  <tr key={f.id}>
                    <td>{new Date(f.data).toLocaleDateString('pt-BR')}</td>
                    <td>{f.categoria}</td>
                    <td><span className="adm-event-tipo" style={{background: (f.tipo==='entrada'?'var(--green)':'var(--red)')+'22', color: f.tipo==='entrada'?'var(--green)':'var(--red)', borderColor: (f.tipo==='entrada'?'var(--green)':'var(--red)')+'55'}}>{f.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                    <td style={{textAlign:'right',color: f.tipo==='entrada' ? 'var(--green)' : 'var(--red)',fontWeight:600}}>{f.tipo==='entrada' ? '+' : '−'}{fmtBRL(f.valor)}</td>
                    <td><button className={`adm-pill ${f.pago ? 'ativo' : 'pausado'}`} style={{cursor:'pointer',border:0}} onClick={() => togglePago(f.id)}>{f.pago ? 'Pago' : 'Pendente'}</button></td>
                    <td style={{textAlign:'right'}}>
                      <button className="adm-icon-btn" onClick={() => setEditingFin(f)}>Editar</button>
                      <button className="adm-icon-btn danger" onClick={() => removeFin(f.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
                {fin.length === 0 && <tr><td colSpan="6" className="adm-empty">Sem lançamentos. Adicione o primeiro.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {editingProj && <ProjectEditor data={editingProj} onSave={saveProj} onClose={() => setEditingProj(null)}/>}
        {editingFin && <FinEditor data={editingFin} onSave={saveFin} onClose={() => setEditingFin(null)}/>}
        {editingTask && <TaskEditor data={editingTask} hideClient onSave={saveTask} onClose={() => setEditingTask(null)}/>}
      </div>
    </div>
  );
}

function ProjectEditor({ data, onSave, onClose }) {
  const [d, setD] = aUseState(data);
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose}>×</button>
        <h3>{d.id ? 'Editar entrada' : 'Nova entrada no histórico'}</h3>
        <div className="adm-form-grid">
          <label><span>Data</span><input type="date" value={d.data} onChange={e => set('data', e.target.value)}/></label>
          <label><span>Tipo</span><select value={d.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="entrega">Entrega</option><option value="feature">Funcionalidade</option><option value="manutencao">Manutenção</option><option value="bug">Correção</option><option value="reuniao">Reunião</option>
          </select></label>
          <label className="span2"><span>Título</span><input value={d.titulo} onChange={e => set('titulo', e.target.value)}/></label>
          <label className="span2"><span>Descrição</span><textarea rows={3} value={d.desc} onChange={e => set('desc', e.target.value)} style={{padding:'11px 14px',background:'rgba(248,248,242,0.03)',border:'1px solid rgba(248,248,242,0.10)',borderRadius:10,color:'var(--fg)',font:'500 14px/1.4 var(--sans)',resize:'vertical'}}/></label>
        </div>
        <div className="adm-actions">
          <button className="adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn-primary" onClick={() => onSave(d)} disabled={!d.titulo}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/* ── MENSAGENS TAB (Caixa de Entrada / Inbox) ── */
function MensagensTab({ mensagens, setMensagens, onConvertLead }) {
  const [q, setQ] = aUseState('');
  const [filtro, setFiltro] = aUseState('todas'); // todas | nao-lidas
  const [selectedMsg, setSelectedMsg] = aUseState(null);

  aUseEffect(() => {
    saveLS(NV_MENSAGENS, mensagens);
  }, [mensagens]);

  const filtered = mensagens.filter(m => {
    const matchesSearch = !q || 
      m.nome.toLowerCase().includes(q.toLowerCase()) || 
      m.email.toLowerCase().includes(q.toLowerCase()) || 
      m.empresa.toLowerCase().includes(q.toLowerCase()) || 
      m.msg.toLowerCase().includes(q.toLowerCase());
    
    const matchesFilter = filtro === 'todas' || (filtro === 'nao-lidas' && !m.lida);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => b.data.localeCompare(a.data));

  const openMsg = (msg) => {
    setSelectedMsg(msg);
    if (!msg.lida) {
      setMensagens(prev => prev.map(m => m.id === msg.id ? { ...m, lida: true } : m));
    }
  };

  const deleteMsg = (id, ev) => {
    ev.stopPropagation();
    if (confirm('Excluir esta mensagem permanentemente?')) {
      setMensagens(prev => prev.filter(m => m.id !== id));
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg(null);
      }
    }
  };

  const toggleLida = (id, ev) => {
    ev.stopPropagation();
    setMensagens(prev => prev.map(m => m.id === id ? { ...m, lida: !m.lida } : m));
    if (selectedMsg && selectedMsg.id === id) {
      setSelectedMsg(curr => ({ ...curr, lida: !curr.lida }));
    }
  };

  const handleConvert = (msg, ev) => {
    ev.stopPropagation();
    onConvertLead(msg);
  };

  const naoLidas = mensagens.filter(m => !m.lida).length;
  const recebidasHoje = mensagens.filter(m => {
    const hojeStr = new Date().toISOString().slice(0, 10);
    return m.data.startsWith(hojeStr);
  }).length;

  return (
    <div className="adm-tab">
      <div className="adm-kpis">
        <div className="adm-kpi"><span>Não lidas</span><strong style={{color: naoLidas > 0 ? 'var(--yellow)' : 'var(--fg)'}}>{naoLidas}</strong></div>
        <div className="adm-kpi entrada"><span>Recebidas hoje</span><strong>{recebidasHoje}</strong></div>
        <div className="adm-kpi"><span>Total de mensagens</span><strong>{mensagens.length}</strong></div>
      </div>
      
      <div className="adm-toolbar">
        <input className="adm-search" placeholder="Buscar nas mensagens..." value={q} onChange={e => setQ(e.target.value)}/>
        <div className="adm-tabs-mini">
          <button className={filtro === 'todas' ? 'on' : ''} onClick={() => setFiltro('todas')}>Todas</button>
          <button className={filtro === 'nao-lidas' ? 'on' : ''} onClick={() => setFiltro('nao-lidas')}>Não Lidas {naoLidas > 0 && `(${naoLidas})`}</button>
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Remetente</th>
              <th>Área de Interesse</th>
              <th>Mensagem</th>
              <th>Data</th>
              <th>IP</th>
              <th style={{textAlign: 'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr 
                key={m.id} 
                className="adm-row-clickable" 
                onClick={() => openMsg(m)}
                style={{ fontWeight: !m.lida ? '600' : 'normal', background: !m.lida ? 'rgba(189,147,249,0.03)' : 'transparent' }}
              >
                <td>
                  <span className="adm-link">{m.nome} →</span>
                  {!m.lida && <span style={{marginLeft: 8, fontSize: 10, background: 'var(--yellow)', color: '#04040a', padding: '1px 5px', borderRadius: 4, fontWeight: '700'}}>NOVA</span>}
                  <div className="adm-sub">{m.empresa} · {m.email}</div>
                </td>
                <td>
                  <span className="adm-event-tipo" style={{background: 'rgba(139,233,253,0.15)', color: 'var(--cyan)', borderColor: 'rgba(139,233,253,0.3)'}}>{m.area}</span>
                </td>
                <td style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                  {m.msg || <span style={{fontStyle: 'italic', color: 'var(--comment)'}}>Sem contexto</span>}
                </td>
                <td>{new Date(m.data).toLocaleString('pt-BR')}</td>
                <td style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--comment)'}}>{m.ip}</td>
                <td onClick={e => e.stopPropagation()} style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <button className="adm-icon-btn" onClick={(e) => toggleLida(m.id, e)}>
                    {m.lida ? 'Não lida' : 'Lida'}
                  </button>
                  <button className="adm-icon-btn" style={{borderColor: 'var(--green)', color: 'var(--green)'}} onClick={(e) => handleConvert(m, e)}>
                    + Lead
                  </button>
                  <button className="adm-icon-btn danger" onClick={(e) => deleteMsg(m.id, e)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="adm-empty">Caixa de entrada vazia.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMsg && (
        <MensagemViewer msg={selectedMsg} onClose={() => setSelectedMsg(null)} onDelete={(id, e) => { deleteMsg(id, e); }} onConvert={(msg, e) => handleConvert(msg, e)} />
      )}
    </div>
  );
}

function MensagemViewer({ msg, onClose, onDelete, onConvert }) {
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <button className="adm-close" onClick={onClose}>×</button>
        <span className="eyebrow" style={{color: 'var(--comment)'}}>Detalhes do Contato</span>
        <h3 style={{marginTop: 8, marginBottom: 4}}>{msg.nome}</h3>
        <div className="adm-sub" style={{marginBottom: 20}}>{msg.empresa} · {msg.email}</div>
        
        <div className="adm-form-grid" style={{background: 'rgba(248,248,242,0.02)', border: '1px solid rgba(248,248,242,0.06)', borderRadius: 12, padding: 18, marginBottom: 20}}>
          <div>
            <span style={{fontSize: 10, textTransform: 'uppercase', color: 'var(--comment)', display: 'block', fontWeight: 600}}>Área de Interesse</span>
            <span className="adm-event-tipo" style={{background: 'rgba(139,233,253,0.15)', color: 'var(--cyan)', borderColor: 'rgba(139,233,253,0.3)', marginTop: 4}}>{msg.area}</span>
          </div>
          <div>
            <span style={{fontSize: 10, textTransform: 'uppercase', color: 'var(--comment)', display: 'block', fontWeight: 600}}>Enviado em</span>
            <span style={{display: 'block', marginTop: 4, fontSize: 13.5}}>{new Date(msg.data).toLocaleString('pt-BR')}</span>
          </div>
          <div className="span2">
            <span style={{fontSize: 10, textTransform: 'uppercase', color: 'var(--comment)', display: 'block', fontWeight: 600}}>IP do Remetente</span>
            <span style={{fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--purple)', display: 'block', marginTop: 4}}>{msg.ip}</span>
          </div>
          <div className="span2" style={{marginTop: 10}}>
            <span style={{fontSize: 10, textTransform: 'uppercase', color: 'var(--comment)', display: 'block', fontWeight: 600, marginBottom: 6}}>Mensagem</span>
            <div style={{
              padding: '12px 14px',
              background: 'rgba(30,31,41,0.6)',
              border: '1px solid rgba(248,248,242,0.08)',
              borderRadius: 10,
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              maxHeight: '240px',
              overflowY: 'auto',
              color: 'var(--fg)'
            }}>
              {msg.msg || <span style={{fontStyle: 'italic', color: 'var(--comment)'}}>Nenhuma mensagem ou contexto adicional enviado.</span>}
            </div>
          </div>
        </div>

        <div className="adm-actions">
          <button className="adm-btn-ghost" style={{borderColor: 'var(--red)', color: 'var(--red)'}} onClick={(e) => { onDelete(msg.id, e); onClose(); }}>Excluir Mensagem</button>
          <button className="adm-btn-primary" onClick={(e) => { onConvert(msg, e); onClose(); }}>Converter em Lead (CRM)</button>
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD SHELL ── */
function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = aUseState('crm');
  const [openClientId, setOpenClientId] = aUseState(null);
  const [mensagens, setMensagens] = aUseState(() => loadLS(NV_MENSAGENS, []));
  const clientes = loadLS(NV_CLIENTES, SEED_CLIENTES);

  const naoLidasCount = mensagens.filter(m => !m.lida).length;

  const convertContactToLead = (msg) => {
    const curLeads = loadLS(NV_LEADS, SEED_LEADS);
    const novoLead = {
      id: Math.max(0, ...curLeads.map(l => l.id)) + 1,
      nome: msg.empresa || msg.nome,
      contato: msg.nome,
      email: msg.email,
      tel: '', // Formulário de contato não tem campo de telefone
      interesse: msg.area,
      valor: 0,
      etapa: 'novo',
      origem: 'Formulário do Site',
      notas: `Mensagem enviada:\n"${msg.msg}"\n\nIP do remetente: ${msg.ip}`,
      criado: new Date().toISOString().slice(0, 10)
    };
    const nextLeads = [...curLeads, novoLead];
    saveLS(NV_LEADS, nextLeads);
    
    // Marca a mensagem como lida
    setMensagens(prev => prev.map(m => m.id === msg.id ? { ...m, lida: true } : m));
    
    alert(`Mensagem de "${msg.nome}" convertida em Lead com sucesso!`);
    setTab('leads'); // Redireciona para aba Leads
  };

  return (
    <div className="adm-app">
      <div className="adm-topbar">
        <div className="adm-topbar-brand">
          <span className="adm-mark">N<span className="adm-arrow">↗</span></span>
          <span className="adm-brand-name">NeoVertex</span>
          <span className="adm-pill ativo" style={{ marginLeft: 12 }}>Painel</span>
        </div>
        <div className="adm-topbar-tabs">
          {[
            ['crm', 'Clientes'],
            ['leads', 'Leads (CRM)'],
            ['tarefas', 'Meus afazeres'],
            ['fin', 'Financeiro'],
            ['agenda', 'Agenda'],
            ['mensagens', `Inbox${naoLidasCount > 0 ? ` (${naoLidasCount})` : ''}`]
          ].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="adm-topbar-user">
          <span className="adm-sub">{user}</span>
          <button className="adm-btn-ghost" onClick={onLogout}>Sair</button>
        </div>
      </div>
      <div className="adm-content">
        {tab === 'crm' && <CRMTab onOpenClient={setOpenClientId}/>}
        {tab === 'leads' && <LeadsTab onConvert={(novo) => {
          const cur = loadLS(NV_CLIENTES, SEED_CLIENTES);
          const next = [...cur, { ...novo, id: Math.max(0, ...cur.map(c => c.id)) + 1 }];
          saveLS(NV_CLIENTES, next);
          alert('Lead convertido em cliente! Vai para a aba Clientes para definir mensalidade e vencimento.');
        }}/>}
        {tab === 'tarefas' && <TasksTab clientes={clientes}/>}
        {tab === 'fin' && <FinTab/>}
        {tab === 'agenda' && <AgendaTab/>}
        {tab === 'mensagens' && <MensagensTab mensagens={mensagens} setMensagens={setMensagens} onConvertLead={convertContactToLead}/>}
      </div>
      {openClientId && <ClientProfile clientId={openClientId} onClose={() => setOpenClientId(null)}/>}
    </div>
  );
}

/* ── ROOT ── */
function AdminRoot() {
  const [authed, setAuthed] = aUseState(() => loadLS(NV_AUTH_KEY, null));
  const [showLogin, setShowLogin] = aUseState(false);

  aUseEffect(() => {
    const onOpen = () => setShowLogin(true);
    window.addEventListener('nv-open-login', onOpen);
    return () => window.removeEventListener('nv-open-login', onOpen);
  }, []);

  aUseEffect(() => {
    if (authed) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [authed]);

  const logout = () => { localStorage.removeItem(NV_AUTH_KEY); setAuthed(null); };
  const login = (u) => { setAuthed({ user: u, ts: Date.now() }); setShowLogin(false); };

  if (authed) {
    return <AdminDashboard user={authed.user} onLogout={logout}/>;
  }
  return showLogin ? <LoginModal onClose={() => setShowLogin(false)} onLogin={login}/> : null;
}

window.AdminRoot = AdminRoot;
