# Landing Page Redesign — Design Spec

## Goal

Redesign the NeoVertex public landing page to be simpler, more persuasive, and conversion-focused — with a clear CTA for scheduling a meeting with the CEO.

## Target Audience

Donos de empresa com 5–50 funcionários que enfrentam ineficiência operacional, retrabalho e decisões sem dados.

---

## Structure: Funil Direto (6 seções)

### ① Hero
- **Headline:** "Cansado de trabalhar muito e crescer pouco?"
- **Subheadline:** "Sua empresa pode faturar mais com menos esforço. A NeoVertex combina estratégia e tecnologia para transformar esforço em resultado real."
- **Tag acima:** "Para donos de empresa que querem crescer"
- **Layout:** Texto à esquerda (~55% largura) + foto `neooo.jpeg` à direita com gradient overlay
- **CTA:** Botão dourado "Agendar Reunião Gratuita" → ancora para a seção #contact
- **Prova abaixo do CTA:** "Sessão gratuita · Sem compromisso · Vagas limitadas"

### ② Você se identifica? (Seção Dor)
- **Título:** "Se você é dono de empresa, provavelmente já sentiu isso:"
- **3 cards** com ícone X vermelho (sem emoji, ícone CSS) e texto em itálico:
  1. "Minha equipe está sempre ocupada, mas os resultados não aparecem."
  2. "Processo manual, retrabalho e erros que custam caro todo mês."
  3. "Não tenho dados para tomar decisões — tudo é no feeling."

### ③ Como a NeoVertex resolve (Solução)
- **Título:** "Diagnóstico preciso. Resultados mensuráveis."
- **Subtítulo:** "Não entregamos relatórios que ficam na gaveta. Implementamos as mudanças com você, passo a passo."
- **4 steps numerados** (01–04):
  1. Diagnóstico 360°
  2. Estratégia Personalizada
  3. Tecnologia Sob Medida
  4. Acompanhamento Real

### ④ Nossas Soluções (Serviços)
- **Título:** "Do diagnóstico à execução completa"
- **Subtítulo:** "Escolha o que sua empresa precisa agora — ou deixe a gente recomendar."
- **Grid 2×2**, cada card com cor de accent diferente:
  - Consultoria Estratégica (dourado)
  - IA & Automação (verde)
  - Sistemas Personalizados (azul)
  - Websites & E-commerce (roxo)
- Cada card: ícone geométrico + título + 1 frase + "Ver detalhes" → navega para `/services/{slug}` (comportamento existente)

### ⑤ Prova Social
- **Layout:** Foto `nelson-araujo.png` à esquerda + métricas + quote à direita
- **Métricas:** 40–60% eficiência | 30–50% custos | 300% ROI em 12 meses
- **Quote:** "Quando você contrata a NeoVertex, não está comprando horas de consultoria — está investindo em uma parceria obcecada por resultados. Seu sucesso é nossa única métrica."
- **Assinatura:** Nelson Araujo · CEO & Fundador — NeoVertex

### ⑥ CTA Final
- **id="contact"** (ancora do botão do Hero)
- **Título:** "Pronto para crescer de verdade?"
- **Subtítulo:** "Agende uma sessão estratégica gratuita. Em 30 minutos identificamos 3 oportunidades de crescimento imediato para o seu negócio."
- **Form simplificado (3 campos):**
  - Nome (text)
  - WhatsApp com DDD (tel)
  - "Qual é o principal desafio da sua empresa hoje?" (textarea)
- **Botão:** "Agendar Minha Sessão Gratuita"
- **Disclaimer:** "Vagas limitadas · Sem compromisso · Respondemos em até 24h"
- Submissão: `supabase.from('contact_requests').insert()` — mesmo padrão do Contact.tsx atual (mantém reCAPTCHA e rate limit)

---

## Design System

- **Background alternado:** `#07070f` e `#0d0d1a` entre seções
- **Cor primária:** `#D4AF37` (dourado)
- **Sem emojis** — ícones geométricos CSS ou Lucide
- **Fotos:** `/neooo.jpeg` (hero, split-screen) e `/nelson-araujo.png` (prova social)
- **Animações:** Framer Motion `whileInView` com `once: true` — igual ao padrão atual
- **i18n:** Manter suporte, atualizar apenas `pt-BR.json` com os novos textos. Demais idiomas copiam pt-BR como fallback (não regride — já existe)

---

## Componentes Afetados

| Arquivo | Ação |
|---------|------|
| `src/components/Hero.tsx` | Reescrever — novo layout split com foto |
| `src/components/WhyUs.tsx` | Substituir por duas novas seções: `PainSection` e `SolutionSection` |
| `src/components/Contact.tsx` | Simplificar form para 3 campos, manter lógica Supabase |
| `src/components/Services.tsx` | Manter estrutura, melhorar visual dos cards |
| `src/components/CEOCommitment.tsx` | Fundir com Results em novo `SocialProof.tsx` |
| `src/components/Results.tsx` | Fundir com CEOCommitment em `SocialProof.tsx` |
| `src/components/Process.tsx` | Remover — conteúdo absorvido pela seção Solução |
| `src/components/Audience.tsx` | Remover — conteúdo absorvido pela seção Dor |
| `src/pages/Home.tsx` | Atualizar imports para novos componentes |
| `src/locales/pt-BR.json` | Atualizar chaves: hero, pain, solution, contact |

---

## O Que Não Muda

- Roteamento e páginas de serviço individuais (`/services/*`)
- Lógica de submissão Supabase e reCAPTCHA
- Header e Footer
- ChatWidget
- Sistema de i18n (estrutura)
- Admin panel
