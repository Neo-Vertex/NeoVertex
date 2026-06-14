# NeoVertex — Documentação Técnica do Projeto

> Site institucional + painel administrativo (CRM, Leads, Financeiro, Agenda, Tarefas) da NeoVertex.
> Deploy em VPS via **Coolify**.

---

## 1. Visão geral

O projeto é uma **single-page application** estática que entrega:

1. **Landing institucional** em PT-BR (hero, serviços, processo, cases, manifesto, formulário de contato).
2. **Painel administrativo** privado (login local) com 8 módulos:
   - **Clientes** — base ativa, com mensalidade, dia de vencimento e perfil completo.
   - **Leads (CRM)** — pipeline de prospects (Novo → Conversa → Proposta → Ganho/Perdido).
   - **Tarefas (Meus afazeres)** — afazeres pessoais e por cliente, com prioridade e prazo.
   - **Financeiro** — entradas e saídas, status pago/pendente, totais, MRR.
   - **Agenda** — compromissos com visões Lista e Mês.
   - **Mercado** — cotação ao vivo de criptos (US$) e ativos (NVIDIA em R$), via APIs públicas gratuitas.
   - **Inbox** — caixa de entrada das mensagens do formulário do site, com conversão em lead.
   - **Configurações** — atalho para abrir o painel do Umami Analytics em nova aba.

Toda a informação do painel é persistida no **`localStorage`** do navegador — não há backend nesta versão.

---

## 2. Stack utilizada

### 2.1 Linguagens e formatos
| Camada | Tecnologia |
|---|---|
| Estrutura | HTML5 |
| Estilos | CSS3 (custom properties, `oklch`, `color-mix`, grid, flex) |
| Lógica | JavaScript (ES2022) + JSX |
| UI | React 18.3.1 (UMD) |
| Transpilação | Babel Standalone 7.29.0 (in-browser) |

### 2.2 Bibliotecas externas (CDN)
- **React 18.3.1** — `unpkg.com/react@18.3.1/umd/react.development.js`
- **ReactDOM 18.3.1** — `unpkg.com/react-dom@18.3.1/umd/react-dom.development.js`
- **Babel Standalone 7.29.0** — `unpkg.com/@babel/standalone@7.29.0/babel.min.js`

> Em produção, recomenda-se trocar `react.development.js` por `react.production.min.js` e pré-compilar o JSX (ver seção 9).

### 2.3 Tipografia
- **Inter** (Google Fonts) — texto e UI
- **JetBrains Mono** (Google Fonts) — código, terminal, eyebrows
- Ambas carregadas via `<link>` no `<head>`.

### 2.4 Ferramentas de design (sistema interno)
- Paleta **Dracula Dark** + gradiente **Verde → Púrpura** da identidade NeoVertex.
- Logo proprietária (PNG), aplicada em nav e footer.

---

## 3. Estrutura de arquivos

```
.
├── NeoVertex Landing.html   # entry point — carrega React, Babel, scripts e estilos
├── styles.css               # estilos da landing pública (1275+ linhas)
├── admin.css                # estilos exclusivos do painel (668+ linhas)
├── app.jsx                  # landing institucional + Intro + Tweaks (~1.250 linhas)
├── admin.jsx                # painel completo: LoginModal + 5 abas + Drawer (~970 linhas)
├── tweaks-panel.jsx         # shell do painel de tweaks (host protocol)
├── intro.mp4                # vídeo de intro do hero (autoplay, mudo)
├── logo-icon.png            # ícone NeoVertex (nav, login, painel)
├── logo-full.png            # logo completa
├── cases/                   # logos das marcas atendidas + mídias dos cards de serviço
│   ├── logo-skintech.png
│   ├── logo-aquarise.png
│   ├── logo-espaco-familia.png
│   ├── logo-luazul.png
│   ├── card1-sistemas.mp4         # vídeo do card "Sistemas sob medida"
│   └── card2-atendimento.mp4      # vídeo do card "Central de atendimento"
├── brand/                   # estudo de logo (Logo Studio.html, design-canvas.jsx) — não vai para produção
├── uploads/                 # rascunhos, referências, PDFs de brand guidelines — não vai para produção
├── scraps/                  # rascunhos antigos — não vai para produção
└── DOCUMENTACAO.md          # este arquivo
```

> Para deploy, apenas o seguinte vai para a VPS: `NeoVertex Landing.html`, `styles.css`, `admin.css`, `app.jsx`, `admin.jsx`, `tweaks-panel.jsx`, `intro.mp4`, `logo-icon.png`, `logo-full.png`, `cases/`. As pastas `brand/`, `uploads/` e `scraps/` são apenas para referência interna.

---

## 4. Arquitetura da aplicação

### 4.1 Carregamento
1. `NeoVertex Landing.html` carrega no navegador.
2. `<head>`: fontes (Inter + JetBrains Mono via Google Fonts), `styles.css`, `admin.css`.
3. `<body>`: dois containers de root — `#root` (landing) e `#admin-root` (painel) — mais os scripts.
4. Scripts UMD em ordem: React 18.3.1 → ReactDOM 18.3.1 → Babel Standalone 7.29.0.
5. Scripts Babel em ordem: `tweaks-panel.jsx` → `app.jsx` → `admin.jsx`.
6. `app.jsx` faz `ReactDOM.createRoot(#root).render(<App/>)` na última linha.
7. Bloco inline final no HTML faz `ReactDOM.createRoot(#admin-root).render(<AdminRoot/>)`.

### 4.2 Roteamento interno
Não há router externo nem mudança de view. A arquitetura usa **dois roots independentes** que coexistem:

- **`#root`** — renderiza `<App/>` (landing pública: Hero, Services, Process, Cases, CTA, Footer, Intro, Tweaks). Está sempre montado.
- **`#admin-root`** — renderiza `<AdminRoot/>`, que decide entre `null` (nada renderizado), `<LoginModal/>` (overlay com formulário) ou `<AdminDashboard/>` (painel em `position:fixed` cobrindo toda a viewport).

A comunicação landing → admin acontece via `CustomEvent('nv-open-login')`, disparado pelos botões "Entrar" da `Nav` e do `Footer`. O `AdminRoot` escuta o evento e abre o `LoginModal`.

Quando autenticado, `AdminRoot` define `document.body.style.overflow = 'hidden'` para travar o scroll da landing por trás do painel.

### 4.3 Persistência (localStorage)
Todas as chaves usam o padrão kebab-case versionado `nv-<entidade>-v1`. Os hooks usam o utilitário interno `loadLS(key, fallback)` / `saveLS(key, value)` (definidos no topo do `admin.jsx`) e `aUseEffect` para sincronizar.

| Constante (em `admin.jsx`) | Chave real | Conteúdo |
|---|---|---|
| `NV_AUTH_KEY` | `nv-auth-v1` | sessão do admin: `{ user: string, ts: number }` |
| `NV_CLIENTES` | `nv-clientes-v1` | array de clientes ativos |
| `NV_FIN` | `nv-financeiro-v1` | lançamentos financeiros (entrada/saída, pago/pendente) |
| `NV_AGENDA` | `nv-agenda-v1` | compromissos |
| `NV_LEADS` | `nv-leads-v1` | leads do pipeline (5 etapas) |
| `NV_TASKS` | `nv-tasks-v1` | tarefas pessoais e por cliente |
| `NV_NOTES` | `nv-notes-v1` | mapa `{ [clienteId]: textoNota }` |
| `NV_PROJECTS` | `nv-projects-v1` | timeline de entregas por cliente |
| `NV_MENSAGENS` | `nv-mensagens-v1` | mensagens recebidas pelo formulário do site (Inbox) |
| `NV_MERCADO` | `nv-mercado-v1` | cache da última cotação de mercado (preços + câmbio + timestamp) |

> O script do Umami Analytics está hardcoded em `NeoVertex Landing.html` e `index.html` (apontando para `https://analytics.neovertexia.com`, websiteId `5fa6bb7e-cc68-4383-917b-23fba4a43e16`, domínio rastreado `neovertex.top`). A instância do Umami é hospedada num subdomínio próprio do `neovertexia.com` (com Let's Encrypt automático do Coolify) — o site rastreado continua sendo `neovertex.top`. A aba **Configurações** do painel apenas oferece um atalho para abrir o dashboard do Umami em nova aba — não há mais persistência em localStorage para essa integração.

> O `sessionStorage` é usado apenas para `nv-intro-seen` (controla se a apresentação inicial já tocou nesta sessão).

### 4.4 Autenticação
- Credencial hardcoded em `admin.jsx`:
  ```js
  const NV_CRED = { user: 'nelsinhololx', pass: '31577244' };
  ```
- Esta credencial é **apenas demonstração**. Em produção real: substituir por backend com hash + JWT (ver seção 9).
- A sessão no `nv-auth-v1` armazena `{ user, ts }`. Não há expiração — logout limpa a chave.

---

## 5. Sistema de design

### 5.1 Tokens (CSS custom properties)

Definidos em `:root` no `styles.css`. Paleta **Dracula Dark** integral, com extras de marca:

```css
/* Fundos */
--bg-deep: #1E1F29;
--bg: #282A36;
--bg-soft: #2E3040;
--selection: #44475A;
--comment: #6272A4;

/* Texto */
--fg: #F8F8F2;
--fg-muted: rgba(248, 248, 242, 0.62);
--fg-faint: rgba(248, 248, 242, 0.35);

/* Paleta de marca */
--green: #50FA7B;
--purple: #BD93F9;
--cyan: #8BE9FD;
--orange: #FFB86C;
--red: #FF5555;
--yellow: #F1FA8C;
--pink: #FF79C6;

/* Gradiente da marca (hue-shiftable via Tweaks) */
--grad-start: var(--green);
--grad-end: var(--purple);
--grad: linear-gradient(135deg, var(--grad-start), var(--grad-end));

/* Tipografia */
--font: 'Inter', Helvetica, sans-serif;
--sans: var(--font);           /* alias usado em admin.css e inline styles */
--mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;

/* Layout */
--maxw: 1240px;
--pad: clamp(20px, 4vw, 56px);
--radius: 14px;
--radius-lg: 20px;

/* Easing */
--ease: cubic-bezier(.2, .7, .2, 1);
```

> O painel administrativo usa `#04040a` como fundo do dashboard fixed (`.adm-app`) — não confundir com `--bg` da landing. É um preto mais profundo intencional, definido inline no `admin.css`.

### 5.2 Componentes recorrentes (landing — `styles.css`)
- **Eyebrow** (`.eyebrow`, `.cap-eyebrow`) — rótulo monoespaçado em caps, com traço lateral.
- **Section head** (`.section-head`) — título grande com `<span class="grad-text">` para realce em gradiente.
- **Card** (`.card`) — fundo `var(--bg)`, borda 1px translúcida, radius `var(--radius)`, hover destaca borda roxa.
- **Button** (`.btn`, `.btn-primary`, `.btn-ghost`) — `.btn-primary` aplica `--grad`; `.btn-ghost` é apenas borda.
- **Peak lines** (`.peak-lines`) — SVG decorativo de curvas topográficas atrás do Hero.
- **Terminal** (`.term-grid`, `.term-card-main`) — cartão estilo terminal com efeito de digitação no Hero.
- **Stack cards** (`.stack-card`, `.stack-{green,cyan,purple,pink,yellow}`) — cards de serviço com cor de acento dinâmica via `--accent` inline.
- **Logo strip** (`.logo-strip`, `.logo-marquee`) — esteira contínua das marcas atendidas.

### 5.3 Componentes recorrentes (painel — `admin.css`)
- **Pill** (`.adm-pill`, com modificadores `.ativo`, `.pausado`, `.cancelado`) — chip de status.
- **KPI card** (`.adm-kpi`, `.adm-kpi.entrada`, `.adm-kpi.saida`, `.adm-kpi.pend`) — caixa de número grande no topo de cada aba.
- **Modal** (`.adm-overlay` + `.adm-modal`) — formulário centralizado com fundo borrado.
- **Drawer** (`.adm-drawer-overlay` + `.adm-drawer`) — slide lateral 720px usado pelo perfil de cliente.
- **Table** (`.adm-table-wrap` + `.adm-table`) — listagem em linhas clicáveis (`.adm-row-clickable`).
- **Mini-tabs** (`.adm-tabs-mini`) — filtros segmentados em barra.
- **Vence alert** (`.adm-vence-alert` + `.ok`, `.overdue`, `.today`, `.soon`, `.future`) — banner de status de mensalidade no drawer.
- **Timeline** (`.adm-timeline`, `.adm-timeline-item`, `.adm-timeline-dot`) — histórico de entregas com pontos coloridos por tipo.

### 5.3 Tweaks panel
Componente opcional (toolbar do editor) que permite:
- Trocar primária/acento entre presets de paleta.
- Ajustar tipografia (escala / família).
- Persiste alterações via `__edit_mode_set_keys` (host protocol).

---

## 6. Módulos do painel

A ordem das abas no `.adm-topbar` é: **Clientes · Leads (CRM) · Meus afazeres · Financeiro · Agenda · Mercado · Inbox · Configurações**.

### 6.1 Leads (CRM) — chave `nv-leads-v1`
- **Etapas**: `novo`, `conversa`, `proposta`, `ganho`, `perdido`.
- **Campos**: nome, contato, e-mail, telefone, origem, interesse, valor estimado, etapa, notas, criado em.
- **Ações**: criar/editar/excluir, mover entre etapas com 1 clique, **converter em cliente** (copia campos para `nv-clientes-v1` e marca etapa `ganho`).
- **KPIs**: leads ativos, valor total no pipeline, ganhos, perdidos.
- **Filtros**: Ativos, Novos, Em conversa, Proposta, Ganhos, Perdidos, Todos.

### 6.2 Clientes — chave `nv-clientes-v1`
- **Campos**: nome (empresa), contato, e-mail, telefone, plano, mensalidade (R$), `diaVencimento` (1–31 ou `null`), status (`ativo`/`pausado`/`cancelado`).
- **KPIs**: clientes ativos, MRR (soma das mensalidades dos ativos), total de clientes.
- **Perfil drawer** (clique em qualquer linha da tabela):
  - Header com nome, contato, pill de status, pill de plano e pill de mensalidade+vencimento.
  - **Alerta de mensalidade** (`ok` / `overdue` / `today` / `soon` / `future`) calculado comparando `diaVencimento` com hoje e verificando lançamentos pagos do mês corrente que contenham "mensal" na categoria.
  - **KPIs próprios** do cliente: total recebido, a receber, entregas, tarefas abertas.
  - **Notas internas** — textarea persistida em `nv-notes-v1[clienteId]`.
  - **Histórico do projeto** — timeline em `nv-projects-v1`, tipos: `entrega`, `feature`, `manutencao`, `bug`, `reuniao`.
  - **Tarefas do cliente** — filtradas de `nv-tasks-v1` por `clienteId`.
  - **Financeiro do cliente** — filtrado de `nv-financeiro-v1` por `cliente === c.nome`, com CRUD completo.

### 6.3 Financeiro — chave `nv-financeiro-v1`
- **Tipos**: `entrada` / `saida`.
- **Status**: `pago` / `pendente` (`pago: boolean`).
- **Filtros**: Todos / Entradas / Saídas / Pendentes.
- **KPIs**: entradas do mês corrente, saídas do mês corrente, saldo (entradas − saídas do mês), a receber (todas as entradas pendentes, sem filtro de mês).
- **Listagem**: ordenada por data desc.

### 6.4 Agenda — chave `nv-agenda-v1`
- **Visões**: Lista (futuros + histórico) e Mês (calendário com badge de quantidade por dia).
- **Tipos**: `reuniao`, `deploy`, `manutencao`, `outro` — cada um com cor própria.
- **Campos**: data, hora, título, cliente (opcional), tipo.
- **KPIs**: próximos compromissos, compromissos de hoje, total no histórico.

### 6.5 Tarefas — chave `nv-tasks-v1`
- **Aba universal "Meus afazeres"** — mostra apenas tarefas com `clienteId == null` (pessoais).
- **Por cliente** — dentro do drawer do perfil, com `clienteId` populado.
- **Campos**: título, descrição, data (prazo), prioridade (`alta`/`media`/`baixa`), `clienteId` (opcional), `concluida: boolean`.
- **Filtros**: Hoje, Atrasadas, Todas pendentes, Concluídas.
- **KPIs**: para hoje, atrasadas, pendentes (total), concluídas.
- **Ordenação**: pendentes antes; entre pendentes, por prioridade (alta → baixa); empatadas, por data.

### 6.6 Mercado — chave `nv-mercado-v1` (cache)
Cotação ao vivo, **somente leitura** (não há CRUD). Os dados vêm de APIs públicas chamadas direto do navegador; a última resposta boa fica em `nv-mercado-v1` para abrir sem piscar.

- **Ativos**: BTC, ETH, USDT, SOL, SUI, TAO (criptos, em **US$**); NVIDIA/NVDA (ação, em **R$**); SpaceX (selo fixo "sem cotação pública", pois é empresa privada).
- **Fontes**:
  - Criptos (preço + variação 24h): **CoinGecko** `simple/price` — sem chave, com CORS.
  - NVIDIA (preço + variação): **Finnhub** `quote` — exige chave gratuita (constante `FINNHUB_KEY` no `admin.jsx`); só atualiza em horário de pregão dos EUA.
  - Câmbio US$→R$ (converte a NVIDIA): **AwesomeAPI** `last/USD-BRL` — sem chave, com CORS.
- **Atualização**: automática a cada 60s (`setInterval`) + botão "Atualizar agora". Falha de uma fonte mostra "—" naquele card; falha geral mantém o cache e exibe aviso discreto.
- **KPIs**: câmbio US$→R$ atual, nº de ativos, horário da última atualização.
- **Sem chave Finnhub**: as criptos funcionam normalmente; só a NVIDIA fica indisponível.
- O bot Captador (n8n) tem uma ferramenta equivalente (`04_cotacao_mercado.json`) que usa as mesmas fontes pelo servidor — ver `n8n/README.md`, seção 4b.

---

## 7. Acessibilidade e responsividade

- Layout fluido via `clamp()` para tipografia, `grid-template-columns: repeat(auto-fit, minmax(...))` para grids.
- Breakpoints implícitos via grid auto-fit (sem media queries pesadas).
- Contraste WCAG AA respeitado nas combinações de paleta (texto `#f8f8f2` sobre `#04040a`).
- Foco visível em links e botões (outline herdado do user-agent + estados :hover).
- Todos os formulários com `<label>` explícito e `name`.

---

## 8. Infraestrutura — VPS + Coolify

### 8.1 Visão geral
A aplicação é **100% estática** (HTML + CSS + JS no cliente). Não precisa de Node, banco, ou processo em background. O deploy é simplesmente servir os arquivos via HTTP/HTTPS.

### 8.2 Pré-requisitos da VPS
- Linux (Ubuntu 22.04 LTS recomendado).
- 1 vCPU, 2 GB RAM, 20 GB SSD (mínimo).
- IP público + domínio apontado (registro A).
- Portas 80 e 443 abertas.
- Docker + Docker Compose instalados (Coolify exige).

### 8.3 Instalação do Coolify
```bash
# acesso à VPS via SSH
ssh root@SEU_IP

# instalar Coolify (script oficial)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
Acesso ao painel: `https://SEU_IP:8000` (ou domínio que você apontar para o servidor Coolify, ex.: `coolify.neovertex.com.br`).

### 8.4 Deploy do projeto

**Opção A — Repositório Git (recomendado)**
1. Suba o projeto para um repositório (GitHub, GitLab, Gitea self-hosted).
2. No Coolify: **+ New** → **Public/Private Repository**.
3. Cole a URL do repo e selecione a branch (`main`).
4. **Build Pack**: `Static`.
5. **Publish Directory**: `.` (raiz do repo, onde está o `NeoVertex Landing.html`).
6. **Start Command**: deixe em branco (servido por Nginx interno).
7. **Domain**: `neovertex.com.br` (Coolify provisiona Let's Encrypt automaticamente).
8. **Deploy** → o Coolify gera um container Nginx servindo os estáticos.

**Opção B — Dockerfile próprio (mais controle)**
Crie na raiz do projeto:
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf`:
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index "NeoVertex Landing.html";

  # SPA-style fallback (não obrigatório aqui, mas útil)
  location / {
    try_files $uri $uri/ /NeoVertex\ Landing.html;
  }

  # cache agressivo para assets imutáveis
  location ~* \.(?:css|js|jpg|jpeg|png|gif|ico|svg|woff2?)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }

  # gzip
  gzip on;
  gzip_types text/css application/javascript image/svg+xml;
}
```
No Coolify: **Build Pack: Dockerfile**, push da branch → deploy automático.

### 8.5 Domínio + HTTPS
- No DNS do domínio: `A neovertex.com.br → IP_DA_VPS` e `A www → IP_DA_VPS`.
- No Coolify, em **Domains**: adicione `neovertex.com.br` e `www.neovertex.com.br`.
- Coolify gera certificado Let's Encrypt automaticamente via Traefik.

### 8.6 Backup
Como a aplicação é estática, o backup que importa é:
1. **Repositório Git** — código sempre versionado.
2. **Dados do `localStorage`** — exportar via botão (a implementar) ou print do navegador, pois ficam no dispositivo do usuário.
3. **Volumes do Coolify** — não há volumes específicos do projeto (sem DB).

### 8.7 CI/CD automático
- Em **Settings → Source → Auto Deploy**: ativado.
- Cada push na branch `main` dispara rebuild + redeploy (≈30s).
- Webhook do GitHub é configurado automaticamente pelo Coolify.

### 8.8 Monitoramento
- Coolify mostra logs do container em tempo real.
- **Healthcheck**: configurar `GET /` retornando 200.
- Para uptime externo: UptimeRobot ou Better Stack apontando para `https://neovertex.com.br`.

---

## 9. Próximos passos (produção)

1. **Pré-compilar JSX** com Vite ou esbuild — remove o Babel in-browser e reduz o bundle em ~95%.
   ```bash
   npm create vite@latest neovertex -- --template react
   # migrar app.jsx + admin.jsx para src/
   npm run build  # gera dist/ pronto pra Coolify
   ```
2. **Backend real** — Node/Express ou Supabase para substituir o `localStorage`:
   - Auth com JWT + bcrypt.
   - PostgreSQL com tabelas `clients`, `leads`, `transactions`, `tasks`, `events`, `projects`, `notes`.
   - API REST ou tRPC.
3. **Multi-usuário** — papéis (admin / atendente / financeiro).
4. **Notificações** — WhatsApp Business API ou e-mail (Resend/Postmark) para vencimentos e novos leads.
5. **Exportação** — botão para baixar CSV/JSON de cada módulo.
6. **PWA** — adicionar `manifest.json` + service worker para uso offline.
7. **Analytics** — Plausible (self-hosted no mesmo Coolify) ou Umami.

---

## 10. Comandos rápidos

```bash
# atualização local → produção
git add .
git commit -m "feat: melhoria X"
git push origin main
# Coolify detecta o push e refaz o deploy automaticamente

# acessar logs do container
ssh root@VPS
docker logs -f $(docker ps -qf name=neovertex)

# rebuild manual no Coolify
# painel → projeto → Deployments → Redeploy
```

---

## 11. Prompt para criar Skill no Claude Code

Cole o prompt abaixo no Claude Code (na raiz do projeto, com o repositório aberto) para que ele gere automaticamente uma **skill** dedicada ao NeoVertex. A skill ensina o Claude a navegar pelo projeto, respeitar a stack, manter consistência de design e fazer deploy via Coolify sem fugir do padrão.

```text
Crie uma skill chamada "neovertex-dev" para este projeto, com o seguinte comportamento e contexto:

═══════════════════════════════════════════════════════════
IDENTIDADE DO PROJETO
═══════════════════════════════════════════════════════════
- Nome: NeoVertex — Software sob medida.
- Tagline: "Reach your Peak — Alcance o seu Topo."
- Voz: sempre em PT-BR, em nome da empresa/equipe (NUNCA em primeira pessoa
  singular). Linguagem acessível, sem jargão técnico — o público é dono de
  pequeno/médio negócio, não desenvolvedor.

═══════════════════════════════════════════════════════════
STACK FIXA (não trocar sem permissão)
═══════════════════════════════════════════════════════════
- HTML5 + CSS3 + JavaScript ES2022 + JSX
- React 18.3.1 (UMD via unpkg) + ReactDOM 18.3.1
- Babel Standalone 7.29.0 (in-browser)
- Fontes: Inter (UI) + JetBrains Mono (código/eyebrows)
- Persistência: localStorage (sem backend nesta versão)
- Deploy: VPS Linux (Ubuntu 22.04) + Coolify + Nginx Alpine

═══════════════════════════════════════════════════════════
ESTRUTURA DE ARQUIVOS
═══════════════════════════════════════════════════════════
- "NeoVertex Landing.html" — entry point (carrega React, Babel, scripts, CSS)
- styles.css — landing pública
- admin.css — painel administrativo
- app.jsx — landing (Hero, Services, Cases, Process, Manifesto, CTA, Footer)
- admin.jsx — painel (Leads, Clientes, Financeiro, Agenda, Tarefas + Drawer)
- tweaks-panel.jsx — painel de tweaks (host protocol)
- cases/ — logos das marcas atendidas
- DOCUMENTACAO.md — fonte da verdade do projeto

═══════════════════════════════════════════════════════════
SISTEMA DE DESIGN (paleta Dracula + gradiente verde→roxo)
═══════════════════════════════════════════════════════════
Tokens CSS obrigatórios (definidos em styles.css :root):
  --bg #04040a   --fg #f8f8f2   --surface rgba(255,255,255,0.04)
  --green #50fa7b   --purple #bd93f9   --cyan #8be9fd
  --yellow #f1fa8c   --red #ff5555   --comment #6272a4
  --ease cubic-bezier(.2,.7,.2,1)   --radius 14px

Regras visuais:
- Fundo principal sempre escuro (#04040a). Cards translúcidos sobre ele.
- Botão primário: gradiente verde→roxo. Botão fantasma: apenas borda 1px.
- Eyebrow em JetBrains Mono, caps, letter-spacing 0.08em.
- Títulos com <span class="grad-text"> em palavras-chave.
- Hover de cards sobe 2–4px com transição em var(--ease).
- Selects: appearance:none, chevron SVG roxo, fundo #1a1a2e.
- NUNCA usar emoji como ícone (a marca não usa).
- NUNCA inventar cores fora da paleta. Para tons intermediários use oklch ou
  color-mix sobre os tokens existentes.

═══════════════════════════════════════════════════════════
PERSISTÊNCIA (chaves localStorage — kebab-case versionado)
═══════════════════════════════════════════════════════════
nv-auth-v1        sessão do admin { user, ts }
nv-clientes-v1    array de clientes ativos
nv-leads-v1       leads do pipeline
nv-financeiro-v1  lançamentos financeiros
nv-agenda-v1      compromissos
nv-tasks-v1       tarefas (pessoais e por cliente)
nv-notes-v1       mapa { [clienteId]: textoNota }
nv-projects-v1    timeline de entregas por cliente

sessionStorage:
nv-intro-seen     se a apresentação inicial já tocou nesta sessão

Padrão de acesso (definido em admin.jsx):
  const loadLS = (k, fb) => { try { ... return v ? JSON.parse(v) : fb; } catch { return fb; } };
  const saveLS = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

Ao adicionar nova entidade, criar nova chave seguindo o padrão nv-<nome>-v1 e
documentar em DOCUMENTACAO.md seção 4.3.

═══════════════════════════════════════════════════════════
COMPORTAMENTO DO CLAUDE
═══════════════════════════════════════════════════════════
1. Antes de editar qualquer arquivo, leia DOCUMENTACAO.md inteiro e o
   arquivo-alvo. Nunca edite às cegas.
2. Mantenha PT-BR em todo conteúdo visível ao usuário final.
3. Não introduza dependências novas (React Router, Tailwind, libs de UI,
   ícones, etc.) sem perguntar primeiro.
4. Reaproveite componentes/classes existentes antes de criar novos.
5. Para novos formulários, use o padrão dos modais já implementados
   (.adm-modal) — inputs com fundo rgba(248,248,242,0.04) e foco roxo.
6. Para o painel admin, sempre acrescente CRUD completo (criar/editar/excluir)
   e KPIs no topo da aba.
7. Ao alterar a estrutura, atualize DOCUMENTACAO.md na mesma PR.
8. Commits em PT-BR, formato Conventional Commits:
   feat: , fix: , refactor: , docs: , style: , chore:
9. Nunca rode npm/yarn — o projeto não tem package.json. Quando o usuário
   pedir produção real, proponha migração para Vite (seção 9 da DOCUMENTACAO).

═══════════════════════════════════════════════════════════
DEPLOY (Coolify)
═══════════════════════════════════════════════════════════
- Build Pack: Static (ou Dockerfile Nginx Alpine).
- Publish Directory: raiz do repo.
- Domain: configurado no painel Coolify, HTTPS via Let's Encrypt automático.
- Auto-deploy: push em main → rebuild em ~30s.
- Comandos úteis estão na seção 10 do DOCUMENTACAO.md.

═══════════════════════════════════════════════════════════
CHECKLIST AUTOMÁTICO ANTES DE FINALIZAR
═══════════════════════════════════════════════════════════
[ ] Linguagem em PT-BR, sem jargão técnico, na voz da empresa.
[ ] Cores apenas da paleta (tokens CSS).
[ ] Sem dependências novas não autorizadas.
[ ] localStorage seguindo padrão NV_*.
[ ] DOCUMENTACAO.md atualizado se mudou estrutura/módulo.
[ ] Página renderiza sem erros no console.
[ ] Funciona em mobile (auto-fit grids, sem overflow horizontal).

Quando essa skill for invocada com /neovertex-dev, sumarize o estado atual do
projeto lendo DOCUMENTACAO.md e liste quais módulos estão prontos.
```

> **Como instalar a skill no Claude Code**
> 1. Abra o terminal na raiz do projeto.
> 2. Rode `claude /skills create neovertex-dev` (ou use o comando equivalente da sua versão).
> 3. Cole o prompt acima quando solicitado.
> 4. A skill fica disponível via `/neovertex-dev` em qualquer sessão neste repositório.

---

## 12. Créditos

- **Projeto**: NeoVertex — Software sob medida.
- **Identidade visual**: Dracula Dark + gradiente Verde→Púrpura.
- **Tipografia**: Inter (Rasmus Andersson) + JetBrains Mono.
- **Infra**: Coolify (open source, MIT).
