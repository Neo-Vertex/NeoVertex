/* Neo Vertex — Landing institucional (PT-BR) */
const { useState, useEffect, useRef, useMemo } = React;

/* ────────────── REAL LOGO ──────────────
   User's actual logo: gold N + ascending arrow.
   We use the cropped icon PNG and let the wordmark be set in Inter for
   tightness with the rest of the type system.
*/
function LogoMark({ size = 38 }) {
  return (
    <span
      className="logo-mark-real"
      style={{
        height: size,
        display: 'inline-flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <img
        src="logo-icon.png"
        alt="Neo Vertex"
        style={{
          height: size,
          width: 'auto',
          position: 'relative',
          zIndex: 1,
          display: 'block',
        }}
      />
    </span>
  );
}

function Logo({ withWord = true }) {
  return (
    <a href="#top" className="logo" aria-label="Neo Vertex">
      <LogoMark />
      {withWord && <span className="logo-word">eo Vertex</span>}
    </a>
  );
}

/* ────────────── REVEAL HOOK ────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ────────────── PEAK LINES BG ────────────── */
function PeakLines() {
  // Topographic-style stacked curves — the "peak" metaphor, subtly.
  const lines = Array.from({ length: 14 });
  return (
    <svg className="peak-lines" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="peakgrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--grad-start)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--grad-end)" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      {lines.map((_, i) => {
        const t = i / (lines.length - 1);
        const peakY = 480 - t * 280;
        const opacity = 0.06 + t * 0.18;
        const stroke = i === lines.length - 1 ? "url(#peakgrad)" : "rgba(248,248,242,0.5)";
        const sw = i === lines.length - 1 ? 1.8 : 1;
        return (
          <path
            key={i}
            d={`M -50 ${640 - t * 60} C 280 ${640 - t * 80}, 540 ${peakY + 120}, 820 ${peakY} S 1200 ${peakY - 40}, 1500 ${peakY - 80}`}
            stroke={stroke}
            strokeWidth={sw}
            fill="none"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

/* ────────────── NAV ────────────── */
function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Logo />
        <nav className="nav-links">
          <a href="#solucoes">Serviços</a>
          <a href="#processo">Como trabalhamos</a>
          <a href="#diferenciais">Diferenciais</a>
          <a href="#cases">Trabalhos</a>
          <a href="#contato">Contato</a>
          <button className="nav-login" onClick={() => window.dispatchEvent(new Event('nv-open-login'))} aria-label="Acessar painel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Entrar
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ────────────── HERO ────────────── */
function Hero() {
  return (
    <section id="top" style={{ position: 'relative', paddingTop: 'clamp(56px, 8vh, 96px)', paddingBottom: 'clamp(40px, 6vh, 72px)' }}>
      <PeakLines />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="hero-eyebrow reveal">
          NEO VERTEX <span className="sep">│</span> SOFTWARE & CONSULTORIA EM TECNOLOGIA <span className="sep">│</span> ATENDIMENTO GLOBAL
        </div>
        <h1 className="reveal hero-title">
          Sistemas <span className="grad-text">sob medida</span><br/>
          para empresas que não<br/>aceitam o genérico.
        </h1>
        <p className="reveal hero-sub">
          Software, automação e consultoria em tecnologia. Mais de
          <strong style={{ color: 'var(--fg)', fontWeight: 600 }}> 150 projetos entregues </strong>
          para empresas e profissionais em todo o mundo — atendimento na sua língua.
        </p>
        <div className="reveal hero-actions">
          <a href="#contato" className="btn btn-primary">
            Falar com a equipe
            <svg className="arr" viewBox="0 0 16 16" fill="none">
              <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#processo" className="hero-link">
            <span className="tagline">Ver como trabalhamos</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <HeroTerminal />
      </div>
    </section>
  );
}

/* ────────────── HERO TERMINAL ────────────── */
const PROJECTS = [
  {
    title: 'clínica odontológica',
    items: ['Agenda', 'Financeiro', 'Odontograma', 'Atendimento com secretária IA', 'Marcação de consulta automática', 'Recebimento de mensalidades de orto'],
    done: 'No ar — clínica rodando 100% pelo sistema',
  },
  {
    title: 'supermercado',
    items: ['Frente de caixa (PDV)', 'Controle de estoque em tempo real', 'Pedido automático ao fornecedor', 'Etiquetas de preço e validade', 'Programa de fidelidade do cliente'],
    done: 'No ar — caixa, estoque e compras conversando',
  },
  {
    title: 'pet shop',
    items: ['Cadastro de tutor e pet', 'Agenda de banho e tosa', 'Lembrete de vacina por WhatsApp', 'Loja de ração com entrega', 'Plano mensal de banho recorrente'],
    done: 'No ar — pet shop com agenda cheia todo dia',
  },
  {
    title: 'clínica médica',
    items: ['Prontuário eletrônico', 'Agenda multi-profissional', 'Convênios e particulares', 'Receita digital com assinatura', 'Teleconsulta integrada'],
    done: 'No ar — médicos focando no paciente, não na papelada',
  },
  {
    title: 'escritório de advocacia',
    items: ['Controle de processos', 'Prazos e audiências no calendário', 'Honorários e contratos', 'Portal do cliente para acompanhar', 'Recebimento por Pix e boleto'],
    done: 'No ar — nenhum prazo passa batido',
  },
  {
    title: 'empreiteira',
    items: ['Orçamento de obra detalhado', 'Cronograma da obra com fotos', 'Controle de materiais e equipe', 'Medição e nota fiscal', 'Cliente acompanha pelo celular'],
    done: 'No ar — obra na palma da mão do cliente',
  },
  {
    title: 'casa de ração',
    items: ['Catálogo com preço por kg', 'Pedido pelo WhatsApp', 'Entrega no bairro com rota', 'Clube de assinatura mensal', 'Estoque que avisa quando acaba'],
    done: 'No ar — pedido entra sem ninguém parar a loja',
  },
  {
    title: 'agência de marketing',
    items: ['Briefing online do cliente', 'Painel de campanhas e métricas', 'Aprovação de arte com 1 clique', 'Relatório automático todo mês', 'Cobrança recorrente sem fricção'],
    done: 'No ar — agência entregando, não cobrando aprovação',
  },
];

function HeroTerminal() {
  const [projectIdx, setProjectIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);   // which line we're currently typing/showing
  const [charIdx, setCharIdx] = useState(0);   // chars typed of the current line
  const [phase, setPhase] = useState('typing'); // 'typing' | 'pause-line' | 'pause-end'

  const project = PROJECTS[projectIdx];
  const lines = useMemo(() => ([
    { p: '$', c: `novo projeto: ${project.title}`, t: 'cmd' },
    ...project.items.map(item => ({ p: '↳', c: item, t: 'check' })),
    { p: '✓', c: project.done, t: 'ok' },
  ]), [projectIdx]);

  useEffect(() => {
    let id;
    if (phase === 'typing') {
      const current = lines[lineIdx];
      if (!current) return;
      if (charIdx < current.c.length) {
        // type next char — vary speed slightly to feel human
        const delay = current.t === 'cmd' ? 28 : current.t === 'ok' ? 22 : 18;
        id = setTimeout(() => setCharIdx(c => c + 1), delay + Math.random() * 40);
      } else {
        // line finished — small pause before next line
        id = setTimeout(() => setPhase('pause-line'), current.t === 'cmd' ? 320 : 180);
      }
    } else if (phase === 'pause-line') {
      // advance to next line, or end project
      if (lineIdx + 1 < lines.length) {
        setLineIdx(i => i + 1);
        setCharIdx(0);
        setPhase('typing');
      } else {
        // finished all lines — pause then jump to next project
        id = setTimeout(() => setPhase('pause-end'), 1400);
      }
    } else if (phase === 'pause-end') {
      // reset to next project
      setProjectIdx(p => (p + 1) % PROJECTS.length);
      setLineIdx(0);
      setCharIdx(0);
      setPhase('typing');
    }
    return () => clearTimeout(id);
  }, [phase, charIdx, lineIdx, lines]);

  // Render: all lines up to lineIdx fully visible, current line typed up to charIdx
  const visible = lines.slice(0, lineIdx + 1).map((l, i) => ({
    ...l,
    text: i < lineIdx ? l.c : l.c.slice(0, charIdx),
    typing: i === lineIdx && phase === 'typing',
  }));

  return (
    <div className="reveal term-grid">
      <div className="card term-card-main">
        <div className="term-header" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(248,248,242,0.06)',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--comment)',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--red)' }}></span>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--yellow)' }}></span>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--green)' }}></span>
          <span className="term-path" style={{ marginLeft: 12 }}>~/neo-vertex/projects/{project.title.replace(/\s+/g, '-')}.log</span>
        </div>
        <div className="term-body" style={{
          padding: '24px 22px',
          fontFamily: 'var(--mono)',
          fontSize: 13.5,
          lineHeight: 1.85,
          minHeight: 280,
        }}>
          {visible.map((l, i) => (
            <div key={`${projectIdx}-${i}`} style={{ display: 'flex', gap: 14 }}>
              <span style={{
                color: l.t === 'ok' ? 'var(--green)' : l.t === 'cmd' ? 'var(--purple)' : l.t === 'check' ? 'var(--green)' : 'var(--comment)',
                width: 14,
                opacity: l.text.length === 0 ? 0 : 1,
              }}>{l.t === 'check' ? '✓' : l.p}</span>
              <span style={{
                color: l.t === 'ok' ? 'var(--green)' : l.t === 'cmd' ? 'var(--fg)' : l.t === 'check' ? 'var(--fg)' : 'var(--fg-muted)',
              }}>
                {l.text}
                {l.typing && <span style={{
                  display: 'inline-block', width: 7, height: 14, marginLeft: 2,
                  background: 'var(--cyan)', verticalAlign: 'middle',
                  animation: 'pulse 1s infinite',
                }}/>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────── MARQUEE ────────────── */
function Marquee() {
  const logos = [
    { name: 'Skintech Switzerland', src: 'cases/logo-skintech.png' },
    { name: 'Espaço Família',       src: 'cases/logo-espaco-familia.png' },
    { name: 'Aquarise',             src: 'cases/logo-aquarise.png' },
    { name: 'Luazul Community',     src: 'cases/logo-luazul.png' },
  ];
  const dup = [...logos, ...logos, ...logos];
  return (
    <div className="logo-marquee" aria-label="Marcas atendidas">
      <div className="logo-marquee-fade left"></div>
      <div className="logo-marquee-fade right"></div>
      <div className="logo-marquee-track">
        {dup.map((l, i) => (
          <div key={i} className="logo-marquee-item" title={l.name}>
            <img src={l.src} alt={l.name} loading="lazy"/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── SERVICES (Sticky Stack) ────────────── */
const SERVICES = [
  {
    num: '01', tag: 'green', icon: 'cube',
    title: 'Sistemas sob medida',
    body: 'CRM, estoque, financeiro e integrações com APIs do governo.',
    features: [
      'CRM com pipeline e funil de vendas',
      'Estoque, pedidos e nota fiscal integrados',
      'Integração com SEFAZ, Receita, bancos e APIs',
      'Painel financeiro com contas, fluxo de caixa e DRE',
    ],
  },
  {
    num: '02', tag: 'cyan', icon: 'chat',
    title: 'Central de atendimento unificada',
    body: 'WhatsApp, Instagram e Facebook num inbox só.',
    features: [
      'Inbox unificado: WhatsApp, Instagram, Facebook, e-mail',
      'Distribuição automática entre atendentes',
      'Histórico completo por contato',
      'Métricas de tempo de resposta e SLA',
    ],
  },
  {
    num: '03', tag: 'purple', icon: 'bolt',
    title: 'Automação inteligente',
    body: 'Fluxos para alto volume. WhatsApp e KPIs em tempo real.',
    features: [
      'Chatbots no WhatsApp com lógica de negócio',
      'Captação automática de leads + CRM',
      'Dashboards de KPIs em tempo real',
      'Automação de cobrança, lembretes e follow-up',
    ],
  },
  {
    num: '04', tag: 'pink', icon: 'layers',
    title: 'Sistemas verticais',
    body: 'Soluções prontas pra advocacia, saúde, beleza e fitness.',
    features: [
      'Advocacia: processos, prazos, honorários',
      'Saúde: prontuário, agenda, faturamento',
      'Beleza e fitness: agenda, planos, ficha do cliente',
      'Shopping: ocupação, financeiro, condomínio',
    ],
  },
  {
    num: '05', tag: 'yellow', icon: 'compass',
    title: 'Consultoria em tecnologia',
    body: 'Diagnóstico do que sua empresa precisa e como implementar.',
    features: [
      'Diagnóstico técnico do seu cenário atual',
      'Roadmap com prioridade, prazo e orçamento',
      'Escolha de stack, fornecedores e contratos',
      'Acompanhamento da implementação',
    ],
  },
];

const ICONS = {
  cube: <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 3v18M4 7.5l8 4.5 8-4.5"/></g>,
  chat: <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="13" cy="12" r="1" fill="currentColor"/><circle cx="17" cy="12" r="1" fill="currentColor"/></g>,
  bolt: <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></g>,
  layers: <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5" opacity=".6"/></g>,
  compass: <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-1.6 5.4-5.4 1.6 1.6-5.4 5.4-1.6z" fill="currentColor"/></g>,
  calendar: <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="9" cy="15" r="1" fill="currentColor"/></g>,
  cpu: <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></g>,
  globe: <g stroke="currentColor" strokeWidth="1.5" fill="none"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18"/></g>,
};

const PALETTE = {
  green:  { fg: 'var(--green)',  bg: 'rgba(80,250,123,0.10)',  br: 'rgba(80,250,123,0.22)',  hex: '#50fa7b' },
  cyan:   { fg: 'var(--cyan)',   bg: 'rgba(139,233,253,0.10)', br: 'rgba(139,233,253,0.22)', hex: '#8be9fd' },
  purple: { fg: 'var(--purple)', bg: 'rgba(189,147,249,0.10)', br: 'rgba(189,147,249,0.22)', hex: '#bd93f9' },
  pink:   { fg: 'var(--pink)',   bg: 'rgba(255,121,198,0.10)', br: 'rgba(255,121,198,0.22)', hex: '#ff79c6' },
  yellow: { fg: 'var(--yellow)', bg: 'rgba(241,250,140,0.10)', br: 'rgba(241,250,140,0.22)', hex: '#f1fa8c' },
};

function ServiceCard({ svc, idx, total }) {
  const p = PALETTE[svc.tag];
  return (
    <article className={`stack-card stack-${svc.tag}`} style={{ '--i': idx, '--accent': p.hex }}>
      <div className="stack-card-body">
        <h3 className="stack-title">{svc.title}</h3>
        <p className="stack-body">{svc.body}</p>
        <ul className="stack-features">
          {svc.features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
      <div className="stack-visual" aria-hidden="true">
        {BG_PATTERNS[svc.tag]}
      </div>
    </article>
  );
}

function Services() {
  return (
    <section id="solucoes" className="stack-section">
      <div className="wrap">
        <div className="capabilities-head reveal">
          <span className="cap-eyebrow">O QUE A NEO VERTEX FAZ POR VOCÊ</span>
        </div>
      </div>
      <div className="stack-list">
        {SERVICES.map((s, i) => <ServiceCard key={i} svc={s} idx={i} total={SERVICES.length} />)}
      </div>
    </section>
  );
}

function AutoVideo({ src, accentRgb, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.volume = 0;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    tryPlay();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) tryPlay(); });
    }, { threshold: 0.05 });
    io.observe(v);
    const onUserGesture = () => { tryPlay(); document.removeEventListener('touchstart', onUserGesture); document.removeEventListener('click', onUserGesture); };
    document.addEventListener('touchstart', onUserGesture, { once: true, passive: true });
    document.addEventListener('click', onUserGesture, { once: true });
    return () => {
      io.disconnect();
      document.removeEventListener('touchstart', onUserGesture);
      document.removeEventListener('click', onUserGesture);
    };
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      controls={false}
      aria-label={label}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
        background: '#0E0F16',
        filter: `drop-shadow(0 12px 36px rgba(${accentRgb}, 0.22))`,
      }}
    />
  );
}

const BG_PATTERNS = {
  green: <AutoVideo src="cases/card1-sistemas.mp4" accentRgb="80,250,123" label="Demonstração do sistema de gestão"/>,
  cyan: <AutoVideo src="cases/card2-atendimento.mp4?v=2" accentRgb="139,233,253" label="Demonstração da central de atendimento unificada"/>,
  purple: <AutoVideo src="cases/card3-automacao.mp4?v=1" accentRgb="189,147,249" label="Demonstração da automação inteligente de fluxos"/>,
  pink: <AutoVideo src="cases/card4-verticais.mp4?v=1" accentRgb="255,121,198" label="Demonstração dos sistemas verticais especializados"/>,
  yellow: <AutoVideo src="cases/card5-consultoria.mp4?v=1" accentRgb="241,250,140" label="Demonstração da consultoria em tecnologia"/>,
};

/* ────────────── STATS ────────────── */
function Stats() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="stats reveal stats-3">
          {[
            { v: '+150', l: 'projetos entregues' },
            { v: 'Atendimento global', l: 'falamos a sua língua, onde quer que você esteja' },
            { v: '0% genérico', l: 'cada sistema desenhado do zero pro cliente' },
          ].map((s, i) => (
            <div key={i} className="stat">
              <div className="v grad-text">{s.v}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────── PROCESS ────────────── */
const STEPS = [
  { n: '01', t: 'Conversa',          d: 'A equipe conversa com você pra entender o seu negócio, o que você precisa e como você trabalha hoje. Você sai da reunião com prazo e orçamento na hora.' },
  { n: '02', t: 'Desenho',           d: 'Antes de começar a construção, mostramos como o sistema vai ficar. Você vê, opina e ajusta antes de qualquer linha de código.' },
  { n: '03', t: 'Construção',        d: 'Trabalhamos em pedaços pequenos, com entrega toda semana. Você acompanha o sistema crescendo num link, sem surpresa no final.' },
  { n: '04', t: 'No ar',             d: 'Colocamos o seu sistema funcionando com endereço próprio, cópia de segurança automática e proteção. Você aprende a usar com calma.' },
  { n: '05', t: 'Cuidado contínuo',  d: 'Depois que sobe, a Neo Vertex fica junto. Ajustes, melhorias, novidades — tudo direto pelo WhatsApp, sem fila.' },
];

function Process() {
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const tl = timelineRef.current;
      if (!tl) { raf = 0; return; }
      const tlRect = tl.getBoundingClientRect();
      const railTopPx = parseFloat(tl.style.getPropertyValue('--rail-top')) || 36;
      const railHeightPx = parseFloat(tl.style.getPropertyValue('--rail-height')) || (tlRect.height - 72);
      const railStart = tlRect.top + railTopPx;
      const railEnd = railStart + railHeightPx;
      const triggerY = window.innerHeight * 0.55;
      const p = Math.max(0, Math.min(1, (triggerY - railStart) / Math.max(1, railEnd - railStart)));
      setProgress(p);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      document.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Measure first/last dot centers so the rail spans exactly between them
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    const measure = () => {
      const dots = tl.querySelectorAll('.proc-dot');
      if (dots.length < 2) return;
      const tlRect = tl.getBoundingClientRect();
      const f = dots[0].getBoundingClientRect();
      const l = dots[dots.length - 1].getBoundingClientRect();
      const top = (f.top + f.height / 2) - tlRect.top;
      const height = (l.top + l.height / 2) - (f.top + f.height / 2);
      const left = (f.left + f.width / 2) - tlRect.left;
      tl.style.setProperty('--rail-top', `${top}px`);
      tl.style.setProperty('--rail-left', `${left - 1.5}px`);
      tl.style.setProperty('--rail-height', `${height}px`);
    };
    measure();
    const id = setTimeout(measure, 100);
    const ro = new ResizeObserver(measure);
    ro.observe(tl);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(id); ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const activeIdx = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));

  return (
    <section id="processo" ref={sectionRef} className="proc-section">
      <div className="wrap">
        <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 64px', maxWidth: 760 }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Como funciona</span>
          <h2 style={{ fontSize: 'clamp(32px, 4.2vw, 56px)' }}>
            Cinco passos. <span className="grad-text">Sem mistério</span>.
          </h2>
        </div>
        <div className="proc-timeline reveal" ref={timelineRef} style={{ '--progress': progress.toFixed(3) }}>
          <div className="proc-rail-bg"></div>
          <div className="proc-rail-fill"></div>
          {STEPS.map((s, i) => {
            const stepProgress = Math.max(0, Math.min(1, progress * STEPS.length - i));
            const lit = stepProgress > 0.05;
            return (
              <div key={i} className={`proc-node ${lit ? 'lit' : ''} ${i <= activeIdx ? 'active' : ''}`} style={{ '--step-progress': stepProgress.toFixed(3) }}>
                <div className="proc-dot">
                  <span className="proc-dot-inner"></span>
                  <span className="proc-dot-pulse"></span>
                </div>
                <div className="proc-content">
                  <span className="proc-num">{s.n}</span>
                  <h3 className="proc-title">{s.t}</h3>
                  <p className="proc-desc">{s.d}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────── CASES ────────────── */
const CASES = [
  {
    name: 'Skintech Switzerland',
    tag: 'Suíça · Estética profissional',
    t: 'Importadora de máquinas estéticas premium para spas',
    href: 'https://www.skintechswitzerland.ch/',
    logo: 'cases/logo-skintech.png',
  },
  {
    name: 'Aquarise',
    tag: 'Suíça · Cosméticos',
    t: 'Loja online de produtos para cabelo',
    href: 'https://www.aquariseshop.com/',
    logo: 'cases/logo-aquarise.png',
  },
  {
    name: 'Espaço Família',
    tag: 'Saúde · Clínica odontológica',
    t: 'Sistema de gestão completo para a clínica',
    href: 'https://www.clinicaespacofamilia.com.br/',
    logo: 'cases/logo-espaco-familia.png',
  },
  {
    name: 'Luazul Community',
    tag: 'Comunidade · Bem-estar',
    t: 'Plataforma exclusiva da comunidade Luazul',
    href: 'https://www.luazulcommunity.ch/',
    logo: 'cases/logo-luazul.png',
    darkLogo: true,
  },
];

function Cases() {
  const dup = [...CASES, ...CASES, ...CASES];
  return (
    <section id="cases">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Trabalhos</span>
          <h2>Sites e sistemas <span className="grad-text">funcionando</span> agora.</h2>
        </div>
      </div>
      <div className="logo-strip reveal">
        <div className="logo-strip-fade left"></div>
        <div className="logo-strip-fade right"></div>
        <div className="logo-strip-track">
          {dup.map((c, i) => (
            <a key={i} className="logo-slot" href={c.href} target="_blank" rel="noopener noreferrer" title={c.name}>
              <img src={c.logo} alt={c.name} loading="lazy"/>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────── CEO QUOTE ────────────── */
/* ────────────── AUDIENCE — Pra quem é ────────────── */
function Audience() {
  return (
    <section id="audience">
      <div className="wrap">
        <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px', maxWidth: 720 }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Pra quem é</span>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
            Pequenas, médias <span className="grad-text">ou só você</span>.
          </h2>
        </div>
        <div className="audience-grid reveal">
          <article className="audience-card aud-empresa">
            <div className="audience-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2M13 7h2M13 11h2M13 15h2"/>
              </svg>
              <span>Para empresas</span>
            </div>
            <h3>Operação inteira num lugar só</h3>
            <p>
              Que precisam organizar atendimento, vendas, estoque e financeiro —
              sem depender de planilha solta ou sistema genérico que não conversa com a realidade do negócio.
            </p>
            <ul>
              <li>Substituir 3 ou 4 ferramentas avulsas</li>
              <li>Centralizar dados financeiros e operacionais</li>
              <li>Atender pelo WhatsApp sem perder mensagem</li>
            </ul>
          </article>
          <article className="audience-card aud-prof">
            <div className="audience-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21a8 8 0 0 1 16 0"/>
              </svg>
              <span>Para profissionais</span>
            </div>
            <h3>Um sistema só pra você</h3>
            <p>
              Que quer um sistema feito sob medida: rotina, reuniões,
              financeiro pessoal — tudo controlado pelo WhatsApp, do seu jeito.
            </p>
            <ul>
              <li>Agenda e lembretes pelo WhatsApp</li>
              <li>Financeiro pessoal automatizado</li>
              <li>Painel próprio com os seus números</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ────────────── DIFFERENTIATORS ────────────── */
function Differentiators() {
  const items = [
    { i: 'gem',    t: 'Nada de prateleira',     d: 'Cada sistema é desenhado pro cliente, do zero. Não vendemos pacote pronto que você precisa moldar à força.' },
    { i: 'cal',    t: 'Entregas semanais',      d: 'Você vê o progresso real, não só o resultado. Sprint curto, ajuste rápido, decisão na hora.' },
    { i: 'pin',    t: 'Atendimento humano',     d: 'Equipe própria atendendo em vários idiomas, em qualquer fuso horário. Você fala com quem decide.' },
    { i: 'wpp',    t: 'Suporte direto no WhatsApp', d: 'Depois do lançamento, suporte direto pelo WhatsApp. Sem fila, sem ticket, sem call center.' },
  ];
  const icon = (k) => {
    switch(k) {
      case 'gem':  return <path d="M6 3l-4 6 10 12L22 9l-4-6H6zM2 9h20M12 3L8 9l4 12L16 9l-4-6z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>;
      case 'cal':  return <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1" fill="currentColor"/></g>;
      case 'pin':  return <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"><path d="M12 21s-7-7-7-12a7 7 0 1 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></g>;
      case 'wpp':  return <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/><path d="M8.5 9.5c.5 2.5 3 5 5.5 5.5l1.5-1.5-2-1-1 .5c-1-.5-1.5-1-2-2l.5-1-1-2L8.5 9.5z"/></g>;
    }
  };
  return (
    <section id="diferenciais">
      <div className="wrap">
        <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px', maxWidth: 720 }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Diferenciais</span>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
            Por que <span className="grad-text">a Neo Vertex</span>.
          </h2>
        </div>
        <div className="diff-grid reveal">
          {items.map((x, n) => (
            <article key={n} className="diff-card">
              <div className="diff-icon">
                <svg width="22" height="22" viewBox="0 0 24 24">{icon(x.i)}</svg>
              </div>
              <h3>{x.t}</h3>
              <p>{x.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────── CTA / LEAD ────────────── */
function CTA() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState({ nome: '', email: '', empresa: '', area: 'Sistemas sob medida', msg: '' });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!data.nome.trim()) e.nome = 'Informe o seu nome.';
    if (!/^\S+@\S+\.\S+$/.test(data.email)) e.email = 'E-mail inválido.';
    if (!data.empresa.trim()) e.empresa = 'Informe a empresa.';
    return e;
  }
  
  async function submit(ev) {
    ev.preventDefault();
    if (sending) return;

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSending(true);
    try {
      // 1. Obter IP do cliente via API pública
      let ip = '127.0.0.1';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          ip = ipData.ip;
        }
      } catch (ipErr) {
        console.warn('Erro ao obter IP via API, utilizando fallback local', ipErr);
      }

      // 2. Verificar limite de 3 mensagens em 24h no LocalStorage
      const umDiaAtras = Date.now() - 24 * 60 * 60 * 1000;
      let ipLogs = {};
      try {
        const rawLogs = localStorage.getItem('nv-ip-logs-v1');
        if (rawLogs) ipLogs = JSON.parse(rawLogs);
      } catch (err) {}

      const enviosRecentes = (ipLogs[ip] || []).filter(ts => ts > umDiaAtras);

      if (enviosRecentes.length >= 3) {
        setErrors({ submit: 'Limite de segurança atingido: máximo de 3 mensagens por dia para este IP. Tente novamente amanhã.' });
        setSending(false);
        return;
      }

      // 3. Registrar novo envio para o IP
      enviosRecentes.push(Date.now());
      ipLogs[ip] = enviosRecentes;
      try {
        localStorage.setItem('nv-ip-logs-v1', JSON.stringify(ipLogs));
      } catch (err) {}

      // 4. Salvar na Caixa de Entrada compartilhada (nv-mensagens-v1)
      let mensagens = [];
      try {
        const rawMsgs = localStorage.getItem('nv-mensagens-v1');
        if (rawMsgs) mensagens = JSON.parse(rawMsgs);
      } catch (err) {}

      const novaMensagem = {
        id: Math.max(0, ...mensagens.map(m => m.id)) + 1,
        data: new Date().toISOString(),
        nome: data.nome.trim(),
        email: data.email.trim(),
        empresa: data.empresa.trim(),
        area: data.area,
        msg: data.msg.trim(),
        ip: ip,
        lida: false
      };

      mensagens.push(novaMensagem);
      try {
        localStorage.setItem('nv-mensagens-v1', JSON.stringify(mensagens));
      } catch (err) {}

      setSent(true);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.' });
    } finally {
      setSending(false);
    }
  }

  function field(k, v) {
    setData(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
    if (errors.submit) setErrors(er => ({ ...er, submit: undefined }));
  }

  return (
    <>
    <section style={{ padding: 0 }}>
      <div className="wrap">
        <div className="cta-banner reveal">
          <h2>Vamos conversar sobre o seu projeto?</h2>
          <p>Diagnóstico inicial sem compromisso. Atendimento global em vários idiomas — call ou reunião online em qualquer fuso horário.</p>
          <a href="#contato-form" className="btn btn-primary" onClick={(e)=>{e.preventDefault();document.getElementById('contato')?.scrollIntoView({behavior:'smooth'});}}>
            Agendar conversa
            <svg className="arr" viewBox="0 0 16 16" fill="none">
              <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
    <section id="contato">
      <div className="wrap">
        <div className="cta-wrap reveal">
          <div>
            <span className="eyebrow">Próximo passo</span>
            <h2 style={{ marginTop: 16 }}>
              Conta pra gente o que você <span className="grad-text">precisa resolver</span>.
            </h2>
            <p style={{ marginTop: 18, fontSize: 17, maxWidth: '52ch' }}>
              Diagnóstico inicial sem compromisso. A gente sai da conversa já com escopo,
              prazo e orçamento estimado — sem deck genérico, sem proposta padrão.
            </p>
            <p className="tagline" style={{ marginTop: 28, fontSize: 18 }}>Software & Consultoria em Tecnologia</p>
            <div style={{
              marginTop: 36,
              display: 'flex', gap: 24, flexWrap: 'wrap',
              fontFamily: 'var(--mono)', fontSize: 13,
              color: 'var(--comment)',
            }}>
              <span>contato@neovertex.com</span>
              <span>·</span>
              <span>Atendimento global · vários idiomas · todos os fusos</span>
            </div>
          </div>
          <div>
            {sent ? (
              <div className="lead-success">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <strong style={{ display: 'block', color: 'var(--green)' }}>Recebido. ✓</strong>
                  <span style={{ color: 'var(--fg-muted)' }}>Retorno em até 24h úteis com horários disponíveis para a primeira conversa.</span>
                </div>
              </div>
            ) : (
              <form className="lead" onSubmit={submit} noValidate>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" value={data.nome} onChange={e => field('nome', e.target.value)} placeholder="Como devemos te chamar?"/>
                    {errors.nome && <ErrTxt>{errors.nome}</ErrTxt>}
                  </div>
                  <div className="field">
                    <label htmlFor="empresa">Empresa</label>
                    <input id="empresa" value={data.empresa} onChange={e => field('empresa', e.target.value)} placeholder="Razão social ou marca"/>
                    {errors.empresa && <ErrTxt>{errors.empresa}</ErrTxt>}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="email">E-mail corporativo</label>
                  <input id="email" type="email" value={data.email} onChange={e => field('email', e.target.value)} placeholder="voce@empresa.com.br"/>
                  {errors.email && <ErrTxt>{errors.email}</ErrTxt>}
                </div>
                <div className="field">
                  <label htmlFor="area">Como podemos ajudar?</label>
                  <select id="area" value={data.area} onChange={e => field('area', e.target.value)}>
                    <option>Sistemas sob medida</option>
                    <option>Central de atendimento unificada</option>
                    <option>Automação inteligente</option>
                    <option>Sistemas verticais (advocacia, saúde, beleza...)</option>
                    <option>Consultoria em tecnologia</option>
                    <option>Manutenção de sistema existente</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="msg">Contexto (opcional)</label>
                  <textarea id="msg" value={data.msg} onChange={e => field('msg', e.target.value)} placeholder="Qual o gargalo que mais dói hoje?"/>
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={sending} style={{ justifySelf: 'start', marginTop: 4 }}>
                  {sending ? 'Enviando...' : 'Enviar e agendar'}
                  {!sending && (
                    <svg className="arr" viewBox="0 0 16 16" fill="none">
                      <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                
                {errors.submit && (
                  <div style={{
                    marginTop: 12,
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--red)',
                    background: 'rgba(255, 85, 85, 0.08)',
                    border: '1px solid rgba(255, 85, 85, 0.2)',
                    padding: '10px 14px',
                    borderRadius: 8,
                    lineHeight: 1.4
                  }}>
                    {errors.submit}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

function ErrTxt({ children }) {
  return (
    <span style={{
      fontFamily: 'var(--mono)',
      fontSize: 11,
      color: 'var(--red)',
      letterSpacing: 0.04,
    }}>{children}</span>
  );
}

/* ────────────── FOOTER ────────────── */
function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Logo />
            <p style={{ marginTop: 18, maxWidth: '38ch', fontSize: 14 }}>
              Software sob medida e consultoria em tecnologia. Sistemas que tiram a sua
              operação do genérico — do começo ao fim, com a equipe que constrói.
            </p>
            <p className="tagline" style={{ marginTop: 14, fontSize: 14 }}>Desenvolvimento de Software · Consultoria em Tecnologia</p>
          </div>
          <div className="foot-col">
            <h4>O que fazemos</h4>
            <a href="#solucoes">Sistemas sob medida</a>
            <a href="#solucoes">Central de atendimento</a>
            <a href="#solucoes">Automação inteligente</a>
            <a href="#solucoes">Sistemas verticais</a>
            <a href="#solucoes">Consultoria em tecnologia</a>
          </div>
          <div className="foot-col">
            <h4>Neo Vertex</h4>
            <a href="#audience">Sobre nós</a>
            <a href="#cases">Trabalhos</a>
            <a href="#processo">Como trabalhamos</a>
            <a href="#diferenciais">Diferenciais</a>
            <a href="#contato">Contato</a>
          </div>
          <div className="foot-col">
            <h4>Conecte-se</h4>
            <a href="#" target="_blank">LinkedIn</a>
            <a href="#" target="_blank">GitHub</a>
            <a href="#" target="_blank">Instagram</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Neo Vertex · Desenvolvimento de Software · Consultoria em Tecnologia</span>
          <span style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <span>Atendimento global · falamos a sua língua</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('nv-open-login'))}
              className="foot-login"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Acessar painel
            </button>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ────────────── TWEAKS ────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hueShift": 0
}/*EDITMODE-END*/;

function Tweaks() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  // Apply hue shift via a CSS filter on a rotation of the original brand hex pair.
  // We rotate around the OKLCH hue using a linear-gradient swatch generator.
  const hue = tweaks.hueShift || 0;
  useEffect(() => {
    const root = document.documentElement;
    // Original brand: green ~145°, purple ~290° (oklch hue). We shift both by `hue`.
    const start = `oklch(0.88 0.2 ${(145 + hue) % 360})`;
    const end   = `oklch(0.74 0.18 ${(290 + hue) % 360})`;
    root.style.setProperty('--grad-start', start);
    root.style.setProperty('--grad-end', end);
    root.style.setProperty('--grad', `linear-gradient(135deg, ${start}, ${end})`);
    return () => {
      // restore canonical brand hexes
      root.style.setProperty('--grad-start', '#50FA7B');
      root.style.setProperty('--grad-end', '#BD93F9');
      root.style.setProperty('--grad', 'linear-gradient(135deg, #50FA7B, #BD93F9)');
    };
  }, [hue]);

  const T = window.TweaksPanel;
  const Section = window.TweakSection;
  const Slider = window.TweakSlider;
  const Button = window.TweakButton;

  return (
    <T title="Tweaks · Neo Vertex">
      <Section title="Brand gradient">
        <Slider
          label="Hue shift"
          value={hue}
          min={-180}
          max={180}
          step={5}
          unit="°"
          onChange={v => setTweak('hueShift', v)}
        />
        <div style={{
          marginTop: 12,
          height: 38,
          borderRadius: 10,
          background: 'var(--grad)',
          border: '1px solid rgba(248,248,242,0.08)',
        }}/>
        <div style={{
          marginTop: 10,
          fontFamily: 'var(--mono)', fontSize: 11,
          color: 'var(--comment)',
          letterSpacing: '0.05em',
        }}>
          0° = Green → Purple (canon)
        </div>
        <Button onClick={() => setTweak('hueShift', 0)} style={{ marginTop: 10 }}>
          Reset to canon
        </Button>
      </Section>
    </T>
  );
}

/* ────────────── INTRO 3D + CINEMATIC ────────────── */
function Intro({ onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0: video playing
  // phase 1: video ended → title appears
  // phase 2: video frozen → tagline + lines reveal
  // phase 3: fade out
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 1.5;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
  }, []);

  const onEnded = () => {
    // freeze on the last frame
    const v = videoRef.current;
    if (v) { v.pause(); try { v.currentTime = Math.max(0, v.duration - 0.05); } catch {} }
    setPhase(1);
    setTimeout(() => setPhase(2), 600);
    setTimeout(() => setPhase(3), 2400);
    setTimeout(() => onDone(), 3200);
  };

  const skip = () => onDone();

  return (
    <div className={`intro-stage phase-${phase}`} role="dialog" aria-label="Apresentação Neo Vertex">
      <video
        ref={videoRef}
        className="intro-video-bg"
        src="intro.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={onEnded}
      />

      {/* tagline overlay (appears phase 1+) */}
      <div className="intro-brand">
        <div className="intro-sub">Desenvolvimento de Software <span style={{opacity:0.5,margin:'0 8px'}}>|</span> Consultoria em Tecnologia</div>
      </div>

      {/* "video" — poem of lines (appears phase 2+) */}
      <div className="intro-lines">
        <div className="intro-line" style={{ '--d': '0s' }}>Software sob medida.</div>
        <div className="intro-line" style={{ '--d': '0.3s' }}>Sem template. Sem mensalidade engessada.</div>
        <div className="intro-line" style={{ '--d': '0.6s' }}>Feito pro jeito que o seu negócio trabalha.</div>
      </div>

      {/* skip button */}
      <button className="intro-skip" onClick={(e) => { e.stopPropagation(); skip(); }}>
        Pular apresentação
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ────────────── APP ────────────── */
function App() {
  useReveal();
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Process />
        <Audience />
        <Differentiators />
        <Cases />
        <CTA />
      </main>
      <Footer />
      <Tweaks />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
