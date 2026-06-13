# Design — Módulo "Mercado" + Bot de Mercado no Telegram

**Data:** 2026-06-13
**Autor:** Nelson (NeoVertex) + Claude
**Status:** Aprovado (design) — pendente spec review

---

## 1. Objetivo

Adicionar ao NeoVertex um módulo de acompanhamento de mercado (cripto + ações) e um
bot no Telegram (via n8n) que permita:

1. Perguntar sobre **notícias, fundamentos do projeto e preço** de um ativo.
2. Pedir para ser **avisado de entradas institucionais**.
3. Pedir para **sinalizar quando um ativo chegar a um preço** (alerta de preço-alvo).

O painel admin e o bot compartilham a **mesma fonte de dados e o mesmo banco**.

## 2. Watchlist inicial

Fixa, mas extensível e consultável sob demanda:
`BTC, ETH, SUI, XRP, SOL` (cripto) · `NVIDIA (NVDA), Petrobras (PETR4)` (ações).
SpaceX foi explicitamente excluída (empresa privada, sem dado de mercado).

## 3. Abordagem escolhida

**Backend centraliza dados; n8n é o cérebro conversacional + monitor.**

O Express ganha uma camada `/api/market/*` que concentra toda busca de dados externos
e o CRUD de watchlist/alertas. Painel React e bot do Telegram consomem os mesmos
endpoints (DRY, única fonte de verdade). O painel não quebra se o n8n cair.

```
Painel React  ─┐
               ├─▶  Backend Express /api/market/*  ◀─  n8n (Telegram: bot + monitor)
n8n tools     ─┘         · Binance / News / Institucional
                         · CRUD watchlist / alertas
                         · PostgreSQL
                                                         └─▶ Telegram (push de alertas)
```

## 4. Modelo de dados (novas tabelas)

Criadas em `runMigrations()` (`server/index.js`) e adicionadas a `ALLOWED_TABLES`.

- **market_watchlist** — `id, symbol, display_name, kind ('crypto'|'stock'), source, sort_order, active, created_at`
- **market_alerts** — `id, kind ('price'|'institutional'), symbol, operator ('gte'|'lte'), target_value, params (jsonb), telegram_chat_id, active, last_triggered_at, created_at`
- **market_alert_events** — `id, alert_id, symbol, message, payload (jsonb), created_at`
- **telegram_subscribers** — `id, chat_id (unique), label, is_admin, created_at`

## 5. Backend — camada `/api/market/*`

Protegida por `X-Service-Token` (para o n8n) **ou** JWT admin (para o painel).
Hoje o CRUD genérico não tem auth nas rotas de tabela — a camada market corrige isso
para as rotas sensíveis (escrita de alertas, leitura de chat_ids).

Módulos isolados e testáveis em `server/market/`:

- `binance.js` — preço/24h, candle 1d (entrada líquida = taker buy − taker sell), ranking de inflow. Porte da lógica já validada nos scripts Python (`binance_rank_entradas.py`, `watchlist_entradas.py`).
- `stocks.js` — Yahoo Finance (preço, variação, volume, money-flow proxy 5min).
- `news.js` — CryptoPanic (cripto) + Finnhub/Yahoo (ações).
- `institutional.js` — prêmio Coinbase (tempo real), fluxo de ETF diário (Farside/CoinGlass), CME (CoinGlass, opcional).

Endpoints:
- `GET /api/market/price?symbols=BTC,ETH`
- `GET /api/market/news?symbol=BTC`
- `GET /api/market/institutional?symbol=BTC`
- `GET /api/market/inflow-rank?limit=20`
- CRUD `GET/POST/PATCH/DELETE /api/market/watchlist` e `/api/market/alerts`

Cada chamada externa com **timeout + cache curto** (ex.: 30–60s) para não derrubar o
painel se a fonte lentar.

## 6. Fontes de dados — nível de verdade

| Capacidade | Fonte | Realidade |
|---|---|---|
| Preço + entrada (cripto) | Binance pública | Tempo real, exato, grátis |
| Notícias cripto | CryptoPanic (free) | Bom; precisa token grátis |
| Notícias ações | Finnhub/Yahoo | Ok (free tier) |
| Fluxo ETF spot (BTC/ETH) | Farside / CoinGlass | **Diário**, pode exigir chave |
| Prêmio Coinbase | Coinbase + Binance | Tempo real, grátis — melhor sinal institucional gratuito |
| CME (futuros BTC) | CoinGlass | Exige chave (free tier), lento |
| Institucional em ações | 13F / volume | **Fraco** (13F é trimestral). Usamos *spike de volume anormal + notícia* como proxy |

**Decisão:** o sinal institucional começa com **prêmio Coinbase + ETF diário** (forte e
grátis). CME entra depois, se houver chave CoinGlass. Para ações, alerta institucional =
**volume anormal + notícia relevante** (não fluxo de fundo real).

## 7. n8n — dois workflows

- **Bot conversa:** Telegram Trigger → AI Agent (reusa **OpenAI gpt-4o** já configurado em
  `n8n/agent_chat.json`) com *tools* que chamam `/api/market/*`. Responde sobre
  notícia/fundamento/preço e cria alertas por comando em linguagem natural.
- **Monitor (cron):** a cada N minutos lê `market_alerts` ativos, checa preço/institucional,
  dispara no Telegram e grava em `market_alert_events` (com deduplicação via `last_triggered_at`).

**Robustez:** como o n8n esteve fora do ar, o monitor pode ser movido para um cron no
backend (`node-cron`) — mais confiável — mantendo só a conversa no n8n. Decisão deixada
para a fase de alertas conforme estabilidade do n8n.

## 8. Painel React — módulo "Mercado"

Novo item na `src/components/admin/Sidebar.tsx` + branch em `src/pages/AdminDashboard.tsx`,
seguindo o padrão dos módulos existentes (tema Dracula, gradiente verde→roxo, componentes
em `src/components/admin/market/`):

- Tabela da watchlist: preço, variação, entrada líquida.
- Aba institucional: prêmio Coinbase, fluxo de ETF, (CME).
- Gerenciador de alertas (preço + institucional): criar/editar/excluir.
- Feed de notícias por ativo + histórico de alertas disparados.

## 9. Tratamento de erro / robustez

- Timeout + cache curto em toda fonte externa; painel degrada graciosamente.
- Alertas idempotentes e deduplicados (não repetir o mesmo disparo).
- Monitor tolerante a falha de fonte (loga e segue).

## 10. Segurança

- Camada `/api/market/*` exige `X-Service-Token` (n8n) ou JWT admin (painel).
- A **API key da Binance do print não é usada** (tudo via dados públicos). Recomendado
  **regerar/excluir** essa chave, pois apareceu numa imagem.
- Token do bot do Telegram e chaves de API guardadas em `.env` (backend) e nas credenciais
  do n8n — nunca no front.

## 11. Ordem de construção (fatias testáveis)

1. **Banco + camada `/api/market/*`** (preço/news/institucional/inflow) + testes.
2. **Módulo "Mercado" no painel** (watchlist, institucional, news).
3. **Alertas** (CRUD no painel + tabelas) + **monitor** (cron).
4. **Bot no n8n** (conversa + criação de alerta por comando).

Fases 1–2 não dependem de serviços externos e começam já. Fases 3–4 exigem as
dependências abaixo.

## 12. Dependências externas (do usuário)

1. **Token do bot do Telegram** (@BotFather) + `chat_id` do admin.
2. **n8n de volta ao ar** (`n8n.neovertexia.com` está sem conexão).
3. **Tokens grátis:** CryptoPanic (notícias); opcionais CoinGlass (CME/ETF) e Finnhub (ações).

## 13. Não-objetivos (YAGNI)

- Execução de ordens / trading automático (somente leitura/alerta).
- Dados de SpaceX ou qualquer ativo privado.
- Histórico/backtesting avançado nesta versão.
- Multiusuário de alertas no v1 (foco no admin; estrutura já permite expandir).

## 14. Premissas

- "Os dois juntos" entregues em fatias testáveis (não um big-bang).
- Institucional de ações é proxy (volume+notícia), comunicado como tal na UI.
- LLM do bot reusa a conta OpenAI (gpt-4o) já existente no n8n.
