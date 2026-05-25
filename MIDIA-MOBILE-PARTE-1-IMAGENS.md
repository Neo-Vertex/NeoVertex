# Mídia dos cards — MOBILE — Parte 1: 5 imagens iniciais (Nano Banana)

> **Ferramenta**: Nano Banana (Gemini 2.5 Flash Image, em [gemini.google.com](https://gemini.google.com) ou [aistudio.google.com](https://aistudio.google.com)).
>
> **Objetivo desta etapa**: gerar 5 imagens estáticas (uma por card) com identidade visual coerente, otimizadas para a área de mídia que aparece **abaixo do texto** em telas de celular (≤ 720 px).
>
> **Saída**: `m-card1-A.png` ... `m-card5-A.png` (prefixo `m-` evita colisão com a versão desktop).
>
> **Nota importante**: o Veo 3.1 entrega vídeo nativamente em 16:9 horizontal. Vamos gerar essas imagens **também em 16:9** para que os keyframes da Parte 2 batam com o vídeo final sem distorção. O CSS mobile (`aspect-ratio: 16/10`) faz um leve crop em cima e embaixo via `object-fit: cover` — por isso desenhamos com **20% de safe margin** vertical e horizontal.

---

## 1. Onde a mídia se encaixa (mobile)

```
┌──────────────────────────┐
│                          │
│  TÍTULO                  │
│  Descrição em 2 linhas   │
│  • Feature 1             │
│  • Feature 2             │
│  • Feature 3             │
│  • Feature 4             │
│                          │
│  ┌────────────────────┐  │
│  │   IMAGEM / VÍDEO   │  │
│  │   (esta mídia)     │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

CSS atual: `.stack-visual { aspect-ratio: 16/10; object-fit: cover; }` no breakpoint `@media (max-width: 720px)`.

---

## 2. Especificação técnica

| Atributo | Valor |
|---|---|
| **Proporção** | **16:9** (mesma do Veo 3.1 da Parte 2) |
| **Resolução** | **1280 × 720** (HD — suficiente para mobile, mantém arquivo leve) |
| **Formato** | PNG (preserva o glow neon sem ringing de JPG) |
| **Color profile** | sRGB |
| **Safe margin** | **20% vertical e horizontal** (CSS faz cover crop) |

> Se você for **gerar uma única versão e usar em desktop + mobile**, use o `MIDIA-DESKTOP-PARTE-1-IMAGENS.md` (1920×1080, mais qualidade) e pule este MD. Veja a seção 10 deste arquivo para decidir.

---

## 3. Como usar o Nano Banana

1. Abra [aistudio.google.com](https://aistudio.google.com) → Image generation → **Gemini 2.5 Flash Image** ("Nano Banana").
2. Em "Aspect ratio", selecione **16:9 (Landscape)**.
3. Gere a primeira imagem (Card 01).
4. **Quando aprovar, use-a como reference image** ao gerar as outras 4 — assim a estética se mantém coerente.
5. Para cada card seguinte, mude apenas o **tema** e a **cor de acento**.

---

## 4. Diretrizes coerentes (briefing-mãe)

| Parâmetro | Valor fixo |
|---|---|
| **Fundo** | Preto profundo `#0E0F16` com gradiente radial sutil da cor de acento atrás da peça |
| **Câmera** | Levemente isométrica, ângulo de **~10°** (tilt menor que desktop pra caber melhor em 16:9 horizontal) |
| **Estilo** | Mockup 3D semi-realista, estética Linear / Vercel / Stripe Press |
| **Superfícies** | Cards translúcidos, cantos arredondados 14 px, bordas hairline (1 px) a 8% branco |
| **Tipografia** | Sans-serif moderna (Inter), eyebrows monoespaçadas em caps; **nenhum texto legível** |
| **Logos** | **Nenhum logo real** (silhuetas estilizadas no máximo) |
| **Iluminação** | Suave, sem hard shadows; brilho colorido difuso atrás da peça |
| **Pessoas** | Nenhuma |
| **Composição** | Conteúdo principal centralizado com **20% de safe margin** em cada lado (cima, baixo, esquerda, direita) |
| **Densidade** | **Mais respirada** que a versão desktop (em mobile, menos é mais) |
| **Mood** | Premium, sóbrio, "engineering" |

---

## 5. Prompt-mãe (cole no início, depois adicione o bloco variável)

```
Mockup tridimensional semi-realista de software empresarial em estilo
dashboard escuro premium, formato paisagem 16:9, flutuando sobre fundo
preto profundo (#0E0F16). Estética Linear / Vercel / Stripe Press:
cards translúcidos com cantos arredondados de 14 pixels, bordas hairline
de 1 pixel a 8% branco, profundidade construída por brilho colorido
difuso atrás da peça central (soft glow), sem sombras duras. Tipografia
sans-serif moderna estilo Inter, eyebrows monoespaçadas em caps;
ABSOLUTAMENTE NENHUM texto legível em nenhum idioma — usar apenas
caracteres genéricos / lorem ipsum / glyphs placeholder. Nenhum logo
real. Câmera ligeiramente elevada, ângulo isométrico de 10 graus.
Composição centralizada com 20% de safe margin em todas as bordas
(o conteúdo principal precisa sobreviver a crop). Densidade visual
respirada (menos elementos do que em versão desktop). Sem pessoas.
Iluminação suave, mood premium e sóbrio. Resolução 1280x720 pixels.

Tema deste card: ____________ [substituir pelo bloco da seção 6]

Cor de acento (glow + destaques numéricos + bordas iluminadas):
____________ [substituir pelo HEX da cor do card]
```

---

## 6. Bloco variável por card

### Card 01 — Sistemas sob medida (verde `#50FA7B`)

```
Tema: Sistema de gestão (CRM + financeiro) em versão horizontal
compacta. Peça central exibe:
- À esquerda do centro, um CRM com pipeline de funil de vendas
  (3 a 4 etapas, mais enxuto que desktop), números em verde-neon.
- À direita do centro, um gráfico de linha de fluxo de caixa em
  verde-neon (#50FA7B) e roxo (#BD93F9) sobre grade sutil.
- Os dois painéis estão visualmente conectados por uma linha hairline
  pontilhada no meio.

Cor de acento: #50FA7B
```

### Card 02 — Central de atendimento (ciano `#8BE9FD`)

```
Tema: Inbox de atendimento unificado em formato horizontal compacto.
Peça central:
- Card principal com inbox em tom Dracula: lista de conversas à
  esquerda (avatares pequenos, prévia, badges não-lido em ciano-neon)
  e conversa aberta à direita (bolhas cinza e ciano).
- Apenas DOIS pequenos ícones flutuantes ao lado do card (silhuetas
  neon-ciano de WhatsApp e Instagram) conectados por linhas hairline
  pontilhadas.
- Indicador "online" verde pulsante em um avatar.

Cor de acento: #8BE9FD
```

### Card 03 — Automação inteligente (roxo `#BD93F9`)

```
Tema: Automação de fluxos. Peça central:
- Diagrama horizontal de fluxo de automação com 4 nodes conectados
  em série, esquerda para direita. Cada node é uma forma geométrica
  com brilho roxo-neon, conectado por linhas pontilhadas.
- Acima do diagrama, uma faixa estreita com 3 mini-gauges circulares
  ou contadores grandes em roxo-neon.

Cor de acento: #BD93F9
```

### Card 04 — Sistemas verticais (rosa `#FF79C6`)

```
Tema: Sistemas verticais (múltiplos nichos). Peça central exibe
quatro cards pequenos lado a lado em linha horizontal:
- Card 1: agenda médica (calendário mini).
- Card 2: tabela de processos jurídicos com prazos.
- Card 3: card de academia com horários.
- Card 4: ficha de procedimento estético.
Cada card tem uma pill rosa-neon (#FF79C6) identificando o nicho.
Linhas hairline conectando os cards sugerem modularidade.

Cor de acento: #FF79C6
```

### Card 05 — Consultoria em tecnologia (amarelo `#F1FA8C`)

```
Tema: Consultoria estratégica. Peça central:
- À esquerda, documento horizontal de diagnóstico com bullet points
  abstratos e mini gráfico de radar.
- À direita, linha do tempo (roadmap) horizontal com 4 fases
  conectadas por linha hairline, cada fase com marcador circular
  amarelo-neon.
- No alto-central, pequeno emblema estilizado (engrenagem + bússola)
  em outline neon amarelo.

Cor de acento: #F1FA8C
```

---

## 7. Output desta etapa

| Arquivo | Card | Cor |
|---|---|---|
| `m-card1-A.png` | Sistemas sob medida | `#50FA7B` |
| `m-card2-A.png` | Central de atendimento | `#8BE9FD` |
| `m-card3-A.png` | Automação inteligente | `#BD93F9` |
| `m-card4-A.png` | Sistemas verticais | `#FF79C6` |
| `m-card5-A.png` | Consultoria | `#F1FA8C` |

---

## 8. Checklist de validação

- [ ] As 5 imagens parecem ter sido feitas pela "mesma mão".
- [ ] Mesma câmera, mesmo ângulo (~10° tilt), mesma altura.
- [ ] Mesmo fundo (`#0E0F16`).
- [ ] **Nenhum texto legível** em nenhuma.
- [ ] Cada imagem com a cor de acento certa.
- [ ] Conteúdo principal centralizado com **20% safe margin** em todas as bordas.
- [ ] Densidade visual respirada (mais espaço negativo que desktop).
- [ ] Resolução ≥ 1280×720, proporção 16:9, sRGB.
- [ ] Arquivos salvos com os nomes da seção 7.

**Próximo passo:** quando as 5 imagens mobile estiverem prontas, abrir `MIDIA-MOBILE-PARTE-2-ANIMACAO.md`.

---

## 9. Decisão estratégica (vale ler antes de começar)

Você tem duas rotas possíveis:

**Rota A — Uma única mídia universal (recomendada):**
Pule este MD inteiro. Use só `MIDIA-DESKTOP-PARTE-1-IMAGENS.md` (16:9, 1920×1080). O CSS no mobile vai cortar um pouco em cima e embaixo via `object-fit: cover`, mas o conteúdo central sobrevive porque foi feito com safe margin. **Resultado: 5 imagens + 5 vídeos para manter, funciona em tudo**.

**Rota B — Duas versões otimizadas (qualidade máxima):**
Use este MD para gerar versões mobile (1280×720, mais leves). Resultado: 10 imagens + 10 vídeos. Vai precisar ajustar o JSX em `app.jsx` para escolher a versão certa via `<source media="...">`. **Mais qualidade no celular, mais trabalho de manutenção**.

Para a maioria dos casos a Rota A entrega 95% do resultado com metade do esforço. Só vá para a Rota B se a perda visual no celular for perceptível.
