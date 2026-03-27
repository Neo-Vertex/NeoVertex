# NeoVertex — Plataforma de Gestão e Presença Digital

> **"Reach your Peak"** — Alcance o seu Topo.

---

## O que é o NeoVertex?

O NeoVertex é uma **plataforma SaaS B2B completa** que combina site institucional, painel administrativo, portal de associados e sistema de CRM em uma única aplicação. Foi construída para a empresa NeoVertex, consultoria de tecnologia e IA fundada por **Nelson Araújo**, cujo foco é levar empresas ao próximo nível de performance através de automação inteligente e sistemas personalizados.

---

## Funcionalidades

### Site Público
- Apresentação institucional da empresa com identidade visual premium
- Páginas de serviços detalhadas (4 soluções principais)
- Suporte multilíngue: Português BR, Português PT, Inglês, Espanhol, Francês Suíço
- Formulário de contato com proteção anti-spam (reCAPTCHA v2, honeypot, rate limit)
- Chat widget integrado com agente de IA via n8n
- Efeitos visuais animados (Matrix, Liquid Text, Framer Motion)
- Seção de compromisso do CEO

### Painel Administrativo (`/admin`)
- **Financeiro**: controle de receitas/despesas, multi-moeda, pagamentos recorrentes, gráficos analíticos
- **Projetos**: gestão de etapas (Contratado → Em Desenvolvimento → Testes → Concluído), saldo de horas, manutenção
- **Associados**: perfis de usuários/parceiros, avatares, empresas, marcas de colaboração
- **CRM**: Kanban de leads, pipeline de vendas, detalhes de oportunidades
- **Conteúdo**: gestão de idiomas, produtos/serviços, configurações gerais
- **Mensagens**: comunicação interna e notificações

### Portal do Associado (`/associate`)
- Dashboard dedicado para parceiros/colaboradores
- Visualização de mensagens e projetos
- Acompanhamento de performance

### Demo
- Ambiente de demonstração para prospects (`/demo`)
- Login e dashboard simulados

---

## Serviços Oferecidos pela NeoVertex

| # | Serviço | Descrição |
|---|---------|-----------|
| 1 | **Consultoria Estratégica** | Diagnósticos, branding, precificação, plano de ação, pesquisa de mercado |
| 2 | **IA & Automação** | Agentes inteligentes, RPA, análise preditiva, IA generativa |
| 3 | **Desenvolvimento de Sistemas** | ERP personalizado, CRM, integração de APIs, dashboards em tempo real |
| 4 | **Desenvolvimento Web** | UI/UX premium, SEO, e-commerce, responsividade total |

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | React 19 + TypeScript 5 |
| Build | Vite 7 |
| Estilização | TailwindCSS 4 |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Roteamento | React Router DOM 7 |
| i18n | i18next (6 idiomas) |
| Backend/Auth | Supabase (PostgreSQL + Auth JWT) |
| Automação/IA | n8n (agente de chat) |
| Deploy | cPanel (Apache) |

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── admin/          # Componentes do painel administrativo
│   │   └── charts/     # Gráficos financeiros
│   ├── associate/      # Portal do associado
│   ├── crm/            # Sistema de CRM (Kanban, leads)
│   ├── common/         # Componentes reutilizáveis
│   └── shared/         # Componentes compartilhados
├── pages/
│   ├── services/       # Páginas de serviços (AI, Consulting, Systems, Websites)
│   ├── demo/           # Ambiente de demonstração
│   ├── AdminDashboard.tsx
│   ├── AssociateDashboard.tsx
│   ├── Home.tsx
│   └── Login.tsx
├── services/
│   ├── supabase.ts     # Cliente Supabase
│   └── payment.ts      # Serviço de pagamentos
├── types/              # Interfaces TypeScript
├── locales/            # Arquivos de tradução (pt-BR, pt-PT, en, es, fr-CH)
├── data/               # Dados estáticos (serviços)
├── App.tsx             # Roteador principal
└── i18n.ts             # Configuração de internacionalização
```

---

## Configuração do Ambiente

1. Copie o arquivo de exemplo e preencha as variáveis:
   ```bash
   cp .env.example .env
   ```

2. Variáveis necessárias (`.env`):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_RECAPTCHA_SITE_KEY=...
   ```

3. Instale as dependências e rode localmente:
   ```bash
   npm install
   npm run dev
   ```

4. Build para produção:
   ```bash
   npm run build
   ```
   O output fica em `/dist` — copie para o servidor cPanel.

---

## Banco de Dados

O schema completo do banco de dados está em [`supabase_schema.sql`](supabase_schema.sql). Execute no painel do Supabase para criar todas as tabelas, políticas RLS e funções necessárias.

---

## Automação com n8n

O agente de chat do site é alimentado por um workflow n8n localizado em [`n8n/agent_chat.json`](n8n/agent_chat.json). Importe esse arquivo no seu ambiente n8n para ativar o assistente virtual integrado ao chat widget.

---

## Contato

**NeoVertex** — Transformando negócios com tecnologia e inteligência artificial.
Fundador: **Nelson Araújo**
