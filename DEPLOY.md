# Deploy — Migração da versão estática para a versão Vite/React + Express

> **Contexto importante:** o repositório GitHub `Neo-Vertex/NeoVertex` na branch `main`
> contém HOJE a **versão estática** (HTML + `app.jsx`/`admin.jsx` + localStorage), que é
> a que o Coolify serve em produção. Esta árvore Vite/React + Express vive numa branch
> separada e é a **nova produção** pretendida. NÃO faça force-push da versão Vite na `main`
> enquanto o Coolify ainda estiver configurado para servir a estática — isso derruba o site.
> Reconfigure o Coolify primeiro (passos abaixo), valide, e só então faça a virada.

## Visão geral

A nova versão tem **dois serviços**:

1. **Frontend** — Vite + React (pasta raiz, `src/`). Build gera `dist/` (estático servido).
2. **Backend** — Express + PostgreSQL (`server/`). Expõe `/api/*`, inclusive `/api/market/*`.

O **PostgreSQL** é o mesmo banco já usado pelo n8n. As tabelas `market_*` já foram criadas.
O backend roda `runMigrations()` no boot (idempotente: `CREATE TABLE IF NOT EXISTS`).

```
[Frontend Vite]  --VITE_API_URL-->  [Backend Express /api/*]  -->  [PostgreSQL]
                                                                        ^
[n8n: bot + monitor de alertas]  ---------------------------------------+
```

O **bot do Telegram e o monitor de alertas (n8n) já estão no ar** e independem deste
deploy — eles falam direto com Binance/Coinbase e com o Postgres.

> **Arquivos de deploy já incluídos no repo:** `Dockerfile` (frontend: build Vite +
> nginx com **fallback de SPA** para o react-router) e `server/Dockerfile` (backend).
> Recomendado usar **Build Pack = Dockerfile** no Coolify.

## Serviço 1 — Frontend (Vite)

- **Tipo Coolify:** Application, **Build Pack = Dockerfile**, raiz do repo, branch nova.
  (Alternativa: Nixpacks com build `npm install && npm run build`, publish `dist` — mas o
  `Dockerfile` já resolve o roteamento SPA, evitando 404 em `/admin` ao recarregar.)
- **Build args / variáveis (precisam existir no BUILD, pois o Vite as embute):**
  - `VITE_API_URL=https://api.SEUDOMINIO` (URL pública do backend — Serviço 2)
  - `VITE_RECAPTCHA_SITE_KEY=...` (formulário de contato)
- **Porta interna:** 80
- **Domínio:** `SEUDOMINIO` (ex.: app.neovertexia.com)

## Serviço 2 — Backend (Express)

- **Tipo Coolify:** Application, **Base Directory: `server`**, Build Pack = Dockerfile
  (usa `server/Dockerfile`). Alternativa Nixpacks: start `npm start` (= `node index.js`).
- **Porta:** `3001`
- **Variáveis de ambiente:** ver `server/.env.example`
  - `DATABASE_URL=` (mesmo Postgres do n8n)
  - `DB_SSL=true|false`
  - `JWT_SECRET=` (segredo forte)
  - `PORT=3001`
  - `CRYPTOPANIC_TOKEN=` (opcional)
- **Domínio:** `api.SEUDOMINIO` (precisa bater com o `VITE_API_URL` do frontend)

## Banco de dados

- Reusar o PostgreSQL existente (credencial "NeoVertex Postgres" no n8n).
- As tabelas `market_watchlist`, `market_alerts`, `market_alert_events`,
  `telegram_subscribers` já existem (criadas via n8n) e têm a watchlist semeada.
- No primeiro boot o backend confirma/cria as demais tabelas automaticamente.

## Sequência de virada (sem derrubar o site)

1. Subir esta branch para o GitHub (feito).
2. No Coolify, criar/ajustar os **dois serviços** acima apontando para esta branch.
3. Configurar as variáveis de ambiente e os domínios.
4. Fazer deploy dos dois serviços e **validar** (login no painel, aba Mercado carregando).
5. Só então promover esta branch a `main` (ou apontar o app de produção para ela) e
   aposentar a versão estática.

## Verificação rápida pós-deploy

- `GET https://api.SEUDOMINIO/health` → `{"status":"ok"}`
- `GET https://api.SEUDOMINIO/api/market/price?symbols=BTC,ETH` → preços
- Painel: aba **Mercado** mostra watchlist, ranking, institucional, notícias e alertas.
