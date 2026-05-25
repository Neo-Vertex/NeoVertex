# Mídia dos cards — DESKTOP — Parte 1: 5 imagens iniciais (Nano Banana)

> **Ferramenta**: Nano Banana (Gemini 2.5 Flash Image, disponível em [gemini.google.com](https://gemini.google.com) e [aistudio.google.com](https://aistudio.google.com)).
>
> **Objetivo desta etapa**: gerar 5 imagens estáticas (uma por card de serviço) com **identidade visual coerente entre si**. Saída: `card1-A.png` ... `card5-A.png` para usar como `start frame` do Veo 3.1 na Parte 2.

---

## 1. Onde a mídia se encaixa (desktop)

```
┌───────────────────────────────────────────────────────────────┐
│  TÍTULO GRANDE                       ┌───────────────────┐    │
│  Descrição                           │                   │    │
│  • Feature 1                         │   IMAGEM/VÍDEO    │    │
│  • Feature 2                         │   (esta mídia)    │    │
│  • Feature 3                         │                   │    │
│  • Feature 4                         └───────────────────┘    │
│  ← stack-card-body ─→                ← stack-visual ─→        │
└───────────────────────────────────────────────────────────────┘
```

A mídia ocupa a **coluna direita** do card, dentro de `.stack-visual` em `.stack-card`.

---

## 2. Especificação técnica

Como o Veo 3.1 produz vídeo nativo em **16:9**, geramos as imagens já em 16:9 — assim os keyframes batem com o output do Veo sem distorção.

| Atributo | Valor |
|---|---|
| **Proporção** | **16:9** (paisagem) |
| **Resolução** | **1920 × 1080** (Full HD) |
| **Formato** | PNG (preferível pra preservar detalhes finos do brilho neon) |
| **Color profile** | sRGB |
| **Safe margin** | **20%** lateral (conteúdo central sobrevive ao `object-fit: cover` do CSS desktop) |

---

## 3. Como usar o Nano Banana

1. Abra [aistudio.google.com](https://aistudio.google.com) → **Image generation** → escolha **Gemini 2.5 Flash Image** ("Nano Banana").
2. Em "Aspect ratio", selecione **16:9 (Landscape)**.
3. Gere a **primeira imagem (Card 01)**.
4. Quando aprovar, **clique em "Use as reference"** (ou anexe ela como imagem de referência) ao gerar as outras 4 — assim a estética se mantém coerente.
5. Para cada card seguinte, mude apenas o **tema** e a **cor de acento**, mantendo todo o resto.

> Nano Banana entende português perfeitamente. Não precisa traduzir.

---

## 4. Diretrizes coerentes (briefing-mãe — vale para os 5)

| Parâmetro | Valor fixo |
|---|---|
| **Fundo** | Preto profundo `#0E0F16` com gradiente radial sutil da cor de acento atrás da peça |
| **Câmera** | Levemente isométrica, ângulo de ~10–15° dutch tilt, ponto de vista um pouco elevado |
| **Estilo** | Mockup 3D semi-realista de dashboard premium, estética Linear / Vercel / Stripe Press |
| **Superfícies** | Cards translúcidos, cantos arredondados 14 px, bordas hairline (1 px) a 8% branco |
| **Tipografia** | Sans-serif moderna (Inter), eyebrows monoespaçadas em caps (JetBrains Mono); **nenhum texto legível em nenhum idioma** — usar glyphs placeholder |
| **Logos** | **Nenhum logo real** (silhuetas estilizadas no máximo) |
| **Iluminação** | Suave, sem hard shadows; profundidade com brilho colorido difuso atrás da peça |
| **Pessoas** | Nenhuma |
| **Composição** | Conteúdo principal no centro com **20% de safe margin** lateral |
| **Mood** | Premium, sóbrio, "engineering" — sem feel de marketing genérico |

---

## 5. Prompt-mãe (cole no início, depois adicione o bloco variável)

```
Mockup tridimensional semi-realista de software empresarial em estilo
dashboard escuro premium, formato paisagem 16:9, flutuando sobre fundo
preto profundo (#0E0F16). Estética Linear / Vercel / Stripe Press:
cards translúcidos com cantos arredondados de 14 pixels, bordas hairline
de 1 pixel a 8% de branco, profundidade construída por brilho colorido
difuso atrás da peça central (soft glow), sem sombras duras. Tipografia
sans-serif moderna estilo Inter, eyebrows monoespaçadas em caps;
ABSOLUTAMENTE NENHUM texto legível em nenhum idioma — usar apenas
caracteres genéricos / lorem ipsum / glyphs placeholder. Nenhum logo
real (silhuetas estilizadas no máximo). Câmera ligeiramente elevada,
ângulo isométrico de 10 a 15 graus. Composição centralizada com 20%
de safe margin lateral. Sem pessoas. Iluminação suave, mood premium e
sóbrio. Resolução 1920x1080 pixels.

Tema deste card: ____________ [substituir pelo bloco da seção 6]

Cor de acento (glow + destaques numéricos + bordas iluminadas):
____________ [substituir pelo HEX da cor do card]
```

---

## 6. Bloco variável por card

### Card 01 — Sistemas sob medida (verde `#50FA7B`)

```
Tema: Sistema de gestão empresarial sob medida (CRM + financeiro).
Peça central exibe duas camadas de painel sobrepostas:
- Camada esquerda: CRM com pipeline vertical de funil de vendas em
  quatro etapas, KPIs em verde-neon destacando-se em cada etapa.
- Camada direita: painel financeiro com gráfico de linha de fluxo
  de caixa em verde-neon (#50FA7B) e roxo (#BD93F9) sobre grade sutil.
- Pequena pílula "API gov" no canto superior.

Cor de acento: #50FA7B
```

### Card 02 — Central de atendimento (ciano `#8BE9FD`)

```
Tema: Inbox de atendimento unificado (WhatsApp + Instagram + Facebook
num só lugar). Peça central:
- Card principal de inbox em tom Dracula com lista de conversas à
  esquerda (avatares circulares, prévias de mensagem, badges de
  não-lido em ciano-neon) e conversa aberta à direita (bolhas
  alternadas em cinza escuro e ciano claro).
- Três pequenos ícones flutuantes orbitando o card (silhuetas
  neon-ciano de WhatsApp, Instagram, Messenger) conectados por
  linhas hairline pontilhadas à tela principal.
- Indicador "online" verde pulsante em um dos avatares.

Cor de acento: #8BE9FD
```

### Card 03 — Automação inteligente (roxo `#BD93F9`)

```
Tema: Automação de fluxos com chatbots e captação de leads.
Peça central exibe:
- À esquerda, diagrama de fluxo de automação (nodes geométricos
  conectados por linhas pontilhadas, cada node com brilho
  roxo-neon).
- À direita, dashboard de KPIs em tempo real com gauges
  circulares, contadores grandes em roxo-neon e mini-sparklines.
- Acima, faixa horizontal com bolhas de mensagem de chatbot
  alternadas, com seta de fluxo entre elas.

Cor de acento: #BD93F9
```

### Card 04 — Sistemas verticais (rosa `#FF79C6`)

```
Tema: Sistemas verticais especializados (advocacia, saúde, beleza,
fitness). Peça central exibe quatro camadas de painel empilhadas
obliquamente em efeito "stack" 3D:
- Camada 1 (frente): agenda médica com calendário e cards de paciente.
- Camada 2: tabela de processos jurídicos com prazos.
- Camada 3: card de academia com horários de aula.
- Camada 4 (fundo): galeria de procedimentos estéticos.
Cada camada tem uma pill rosa-neon identificando o nicho. Linhas
hairline conectando as camadas sugerem modularidade.

Cor de acento: #FF79C6
```

### Card 05 — Consultoria em tecnologia (amarelo `#F1FA8C`)

```
Tema: Consultoria estratégica de tecnologia (diagnóstico + roadmap).
Peça central:
- À esquerda, documento estilo "diagnóstico" com bullet points
  abstratos, mini gráfico de radar de maturidade, checklist com
  bolinhas amarela-neon.
- À direita, linha do tempo de roadmap horizontal com quatro fases
  conectadas por linha hairline, cada fase com marcador circular
  amarela-neon e mini-card descritivo.
- No alto, pequeno emblema "estratégia" estilizado (engrenagem +
  bússola sobrepostas em outline neon).

Cor de acento: #F1FA8C
```

---

## 7. Output desta etapa

| Arquivo | Card | Cor |
|---|---|---|
| `card1-A.png` | Sistemas sob medida | `#50FA7B` |
| `card2-A.png` | Central de atendimento | `#8BE9FD` |
| `card3-A.png` | Automação inteligente | `#BD93F9` |
| `card4-A.png` | Sistemas verticais | `#FF79C6` |
| `card5-A.png` | Consultoria | `#F1FA8C` |

Salve as 5 imagens na raiz do projeto (mesmo nível do `app.jsx`).

---

## 8. Checklist de validação

- [ ] As 5 imagens parecem ter sido feitas pela "mesma mão" (estética 100% coerente).
- [ ] Mesma câmera, mesmo ângulo isométrico, mesma altura de ponto de vista.
- [ ] Mesmo fundo (`#0E0F16`).
- [ ] **Nenhum texto legível** em nenhuma.
- [ ] Cada imagem tem a cor de acento certa.
- [ ] Conteúdo principal centralizado com 20% safe margin lateral.
- [ ] Resolução 1920×1080, proporção 16:9, sRGB.
- [ ] Arquivos salvos com os nomes da seção 7.

**Próximo passo:** quando as 5 imagens estiverem prontas, abra `MIDIA-DESKTOP-PARTE-2-ANIMACAO.md` para gerar a imagem B (também no Nano Banana) e o vídeo de cada card (no Veo 3.1).
