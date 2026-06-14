# Mercado — cotação ao vivo de criptos e ativos (painel + bot)

> Spec de design. Projeto NeoVertex. Data: 2026-06-14.

## 1. Objetivo

Adicionar cotação ao vivo de criptomoedas e alguns ativos no sistema NeoVertex, em duas frentes:

1. **Painel admin** — nova aba **"Mercado"** mostrando preço e variação 24h dos ativos.
2. **Bot Captador (n8n)** — ferramenta que devolve as mesmas cotações para o agente responder no WhatsApp.

## 2. Ativos monitorados

| Símbolo | Nome | Tipo | Exibido em | Fonte |
|---|---|---|---|---|
| BTC | Bitcoin | cripto | US$ | CoinGecko (`bitcoin`) |
| ETH | Ethereum | cripto | US$ | CoinGecko (`ethereum`) |
| USDT | Tether | cripto | US$ | CoinGecko (`tether`) |
| SOL | Solana | cripto | US$ | CoinGecko (`solana`) |
| SUI | Sui | cripto | US$ | CoinGecko (`sui`) |
| TAO | Bittensor | cripto | US$ | CoinGecko (`bittensor`) |
| NVDA | NVIDIA | ação | R$ (converte de US$) | Finnhub + câmbio USD-BRL |
| SPACEX | SpaceX | privada | — | Sem cotação pública (selo fixo) |

Decisões do usuário:
- Criptos em **dólar**; o que não é cripto (NVIDIA) em **real**.
- SpaceX **fica na lista** mostrando "sem cotação pública" (sem preço inventado).
- NVIDIA **incluída** mesmo exigindo chave de API e atualizando só em pregão.
- Entregar **painel e bot juntos**.

## 3. Fontes de dados (gratuitas)

- **Cripto (US$ + variação 24h):** CoinGecko `GET /api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,sui,bittensor&vs_currencies=usd&include_24hr_change=true`. Sem chave, com CORS — funciona do navegador.
- **NVIDIA (US$ + variação):** Finnhub `GET /api/v1/quote?symbol=NVDA&token=<KEY>` → `c` (preço atual), `dp` (variação %). Chave gratuita, com CORS.
- **Câmbio US$→R$:** AwesomeAPI `GET https://economia.awesomeapi.com.br/last/USD-BRL` → `USDBRL.bid`. Sem chave, com CORS. Usado para converter NVIDIA US$→R$.
- **SpaceX:** nenhuma busca. Selo estático "sem cotação pública".

## 4. Arquitetura — Caminho A (independente)

Painel e bot buscam as fontes por conta própria. Sem acoplamento: o painel funciona já, mesmo com o bot inativo. A chave Finnhub fica como credencial protegida no bot; no painel aparece em constante de leitura (risco baixo).

## 5. Parte 1 — Aba "Mercado" no painel

**Arquivos:** `admin.jsx` (novo componente `MercadoTab` + registro da aba), `admin.css` (classes do grid de cotação).

- Nova aba `['mercado', 'Mercado']` na `adm-topbar-tabs`, logo após `agenda`. Render: `{tab === 'mercado' && <MercadoTab/>}`.
- Constantes no topo do `admin.jsx`: `NV_MERCADO = 'nv-mercado-v1'`, `FINNHUB_KEY` (placeholder a preencher), lista `MERCADO_ATIVOS`.
- Componente `MercadoTab`:
  - KPIs no topo (padrão `adm-kpis`/`adm-kpi`): câmbio US$→R$ atual, nº de ativos, horário da última atualização.
  - Grid de **cards** (1 por ativo): símbolo, nome, preço formatado, variação 24h com seta ▲ (verde) / ▼ (vermelho) — cores da paleta, **sem emoji**.
  - Cripto em US$ (`fmtUSD`), NVIDIA em R$ (`fmtBRL` já existente), SpaceX com selo "sem cotação pública".
  - Toolbar com botão **"Atualizar"** (`adm-btn-primary`).
  - **Atualização automática a cada 60s** via `setInterval` (limpo no unmount) + atualização inicial no mount.
  - Estado inicial vindo de `loadLS(NV_MERCADO, ...)` para abrir sem piscar vazio; cada busca bem-sucedida grava em `nv-mercado-v1`.
  - Falha de uma fonte → aquele card mostra "—"; falha geral → faixa discreta "não foi possível atualizar agora", mantendo o cache.
  - Sem dependências novas (só `fetch` + hooks).
- **CSS novo** em `admin.css`: `.adm-mercado-grid` (auto-fit minmax ~200px), `.adm-mercado-card`, `.adm-mercado-sym`, `.adm-mercado-preco`, `.adm-mercado-var.up/.down`, `.adm-mercado-card.privada` — todos sobre `rgba(248,248,242,0.04)`, borda 1px, radius 14px, no padrão dos cards existentes.

## 6. Parte 2 — Ferramenta de cotação no bot Captador (n8n)

**Arquivos:** `n8n/04_cotacao_mercado.json` (novo sub-workflow), `n8n/README.md` (instruções de importação/wiring).

- Sub-workflow `04. Cotação de mercado - Neo Vertex`:
  - Trigger `When Executed by Another Workflow` (executeWorkflowTrigger), sem inputs obrigatórios.
  - Nós HTTP Request para CoinGecko + AwesomeAPI (+ Finnhub para NVDA, com credencial/header).
  - Nó Code que monta um texto curto e legível (PT-BR) com as cotações.
  - Retorna `{ resposta_mercado: <texto> }`.
- Wiring no `01_captador_neovertex.json` (manual, como os outros tools): adicionar tool `Cotacao_mercado` apontando para o sub-workflow e citá-la no prompt do agente ("se perguntarem cotação de cripto/NVIDIA, use a ferramenta Cotacao_mercado").
- Chave Finnhub como **credencial do n8n** (não exposta).
- Como o bot está inativo, fica pronto no JSON para valer quando ativarem. Wiring manual seguindo o README — mesmo padrão do `Sugerir_horario`.

## 7. Pontos honestos registrados

- Chave Finnhub fica visível no JS do painel (risco baixo — leitura de cotação). Pode ser restringida por domínio no painel da Finnhub.
- NVIDIA atualiza só em **horário de pregão** dos EUA; fora disso mostra o último fechamento.
- Refresh de 60s respeita os limites gratuitos das APIs.
- SpaceX nunca terá preço enquanto for empresa privada.

## 8. Documentação

Atualizar `DOCUMENTACAO.md`: nova aba Mercado na lista de módulos (seção 1 e 6), nova chave `nv-mercado-v1` na seção 4.3, e nota sobre as fontes externas.
