# Mídia dos cards de serviço — MOBILE

> Briefing para gerar 2 imagens estáticas (frame A e frame B) e transformar essas duas imagens em um vídeo curto em loop, para ocupar a área de mídia de cada card da seção **Serviços** em telas de celular (≤ 720px).

---

## 1. Contexto visual — onde a mídia aparece

| Item | Valor |
|---|---|
| Seção | `#solucoes` (Services) na landing |
| Componente React | `<ServiceCard/>` em `app.jsx` |
| Container CSS | `.stack-visual` dentro de `.stack-card`, no breakpoint `@media (max-width: 720px)` |
| Comportamento | `aspect-ratio: 16/10`, autoplay, mudo, loop, `object-fit: cover` |
| Cards afetados | **Card 01** (`stack-green`) → `cases/card1-sistemas.mp4` <br> **Card 02** (`stack-cyan`) → `cases/card2-atendimento.mp4` |

### Posicionamento no card (mobile)

```
┌──────────────────────────┐
│                          │
│  TÍTULO                  │
│  (Sistemas sob medida)   │
│                          │
│  Descrição em 2 linhas   │
│                          │
│  • Feature 1             │
│  • Feature 2             │
│  • Feature 3             │
│  • Feature 4             │
│                          │
│  ┌────────────────────┐  │
│  │                    │  │
│  │   IMAGEM / VÍDEO   │  │
│  │   (esta mídia)     │  │
│  │                    │  │
│  └────────────────────┘  │
│                          │
└──────────────────────────┘
```

A mídia fica **abaixo do texto**, ocupando 100% da largura útil do card, com proporção fixa **16:10**. Em iPhone 14 (390px) a área visível fica em aproximadamente **326 × 204 px**. Em Galaxy S22 (360px) fica em **296 × 185 px**.

---

## 2. Dimensão exata da mídia

| Atributo | Valor recomendado | Por quê |
|---|---|---|
| **Proporção** | **16:10 paisagem** | É exatamente o `aspect-ratio` do container no mobile. Sem corte do `object-fit: cover`. |
| **Resolução de exportação** | **1280 × 800 px** | 4× o tamanho display em celular comum. Cobre Retina e Android com alta densidade sem peso excessivo. |
| **Resolução mínima** | 960 × 600 px | Aceitável para celular sem ficar pixelado. |
| **Formato do GIF/vídeo** | **MP4 (H.264)** | O site usa `<video>`. GIF puro pesa 3–10× mais. |
| **Duração** | **4 a 6 segundos** em loop fechado | Curto pra economizar dados móveis, longo pra animação fazer sentido. |
| **Frame rate** | 24 fps | Suficiente; 30 fps aumenta o arquivo sem ganho visual notável. |
| **Bitrate** | 800 kbps a 1,2 Mbps | Alvo de arquivo: **300 KB a 700 KB** (importante em 4G). |
| **Áudio** | **Sem áudio** | Autoplay em iOS / Android exige `muted`. Tira a faixa pra economizar. |

> Se for usar **a mesma mídia em desktop e mobile**, prefira a versão desktop (5:4, 1500×1200) — ela "cortará" um pouco lateralmente no celular via `object-fit: cover`, mas mantém a qualidade. Para o ideal absoluto, exporte **duas versões** e troque via `<source media="...">`.

---

## 3. Card 01 — "Sistemas sob medida" (verde)

Acento da paleta: **`--green: #50FA7B`** sobre fundo Dracula `#1A1B23`.

### 3.1 Imagem A (frame inicial)

**Prompt em PT-BR:**

```
Mockup horizontal de um painel de gestão empresarial em estilo dashboard
escuro premium, formato paisagem 16:10. Composição centrada para que o
conteúdo principal sobreviva a crops laterais leves (cover-safe).
Elementos:
- À esquerda, um CRM compacto com pipeline vertical de funil de vendas
  em 4 etapas, números em verde-neon (#50FA7B).
- À direita, um gráfico de linha de fluxo de caixa em verde e roxo
  (#BD93F9) sobre grade sutil.
- Card central translúcido, cantos arredondados 14px, borda hairline
  branca a 8%.
Fundo preto profundo (#0E0F16) com brilho verde difuso atrás da tela
(soft glow). Tipografia sans-serif moderna (estilo Inter), sem texto
legível em qualquer idioma — usar caracteres genéricos. Iluminação
suave, ângulo levemente isométrico (~10° tilt). Estilo Linear / Vercel
dashboard. Foco mantido no centro horizontal da composição, com 15%
de margem nas bordas laterais pra crop seguro. Ratio 16:10.
```

**Prompt em English:**

```
Horizontal mockup of a business management dashboard, premium dark
style, landscape 16:10. Center-weighted composition (cover-safe).
Left: compact CRM with 4-stage vertical sales funnel, neon-green
(#50FA7B) numbers. Right: cash-flow line chart in green and purple
(#BD93F9) over subtle grid. Central translucent card, 14px rounded
corners, hairline 8% white border. Deep black background (#0E0F16)
with diffused green glow behind the screen. Modern sans-serif type
(Inter style), no legible text in any language — placeholder glyphs
only. Soft lighting, slight isometric tilt ~10°. Linear/Vercel aesthetic.
Keep focus in the horizontal center with 15% safe margin on each side.
16:10 ratio.
--ar 16:10 --style raw --s 250
```

### 3.2 Imagem B (frame final)

**Prompt em PT-BR:**

```
Continuação direta da Imagem A — mesma cena, mesma câmera, mesma
iluminação, mesmo enquadramento 16:10. Mudanças:
- O funil de vendas avançou (mais leads na etapa "Ganho", contadores
  maiores).
- O gráfico de fluxo de caixa cresceu uma curva ascendente no lado
  direito.
- Pequena notificação verde-neon (#50FA7B) surgiu no canto superior
  direito, em forma de pílula arredondada, sem texto legível.
- Brilho verde de fundo ~10% mais intenso.
Manter ratio 16:10, mesma resolução, mesma área central segura.
```

### 3.3 Animação (Imagem A → Imagem B → loop)

```
Animação suave e cinematográfica entre dois frames de mockup de
dashboard, formato 16:10 horizontal. Movimento: parallax sutil
(1–2px de drift nas camadas), brilho verde-neon (#50FA7B) pulsando
lentamente, contadores numéricos incrementando suavemente, funil
preenchendo gradualmente da base para o topo, gráfico de linha
desenhando-se da esquerda pra direita. Sem cortes, sem zoom
agressivo, sem mudança de câmera. Duração: 5 segundos. Loop
perfeito (último frame retorna suavemente ao primeiro). Sem áudio.
Resolução: 1280x800 (16:10). Exportar como MP4 H.264, bitrate 1 Mbps,
faststart ativo.
```

---

## 4. Card 02 — "Central de atendimento unificada" (ciano)

Acento da paleta: **`--cyan: #8BE9FD`**.

### 4.1 Imagem A

**Prompt em PT-BR:**

```
Mockup horizontal de uma central de atendimento unificada em estilo
dashboard escuro premium, formato paisagem 16:10. Composição centrada
e cover-safe (15% margem lateral). Elementos:
- Card central: inbox unificado em tom Dracula, com lista de
  conversas à esquerda (avatares circulares, prévia de mensagem,
  badges não-lido em ciano #8BE9FD) e conversa aberta à direita
  (bolhas alternadas em cinza escuro e ciano).
- Três pequenos ícones flutuantes ao redor do card (WhatsApp,
  Instagram, Messenger) em silhueta neon-ciano, conectados por
  linhas finas pontilhadas à tela principal.
- Indicador "online" verde pulsante (#50FA7B) em um dos avatares.
Fundo preto profundo (#0E0F16), brilho ciano difuso atrás do card.
Sem texto legível em qualquer idioma. Tipografia sans-serif moderna.
Iluminação fria. Ângulo levemente isométrico (~10° tilt). Estilo
Linear / Slack premium. Ratio 16:10.
```

**Prompt em English:**

```
Horizontal mockup of a unified customer-service hub, premium dark
style, landscape 16:10. Center-weighted, cover-safe (15% lateral
safe margin). Central card: Dracula-themed unified inbox with a
conversation list on the left (round avatars, message preview, cyan
unread badges #8BE9FD) and an open chat on the right (alternating
gray and cyan bubbles, no legible text). Three small floating icons
(WhatsApp, Instagram, Messenger) around the card in neon-cyan
silhouette, connected by dotted hairlines to the main screen.
A pulsing green (#50FA7B) "online" dot on one avatar. Deep black
background (#0E0F16), diffused cyan glow. Modern sans-serif type,
placeholder glyphs only. Cool lighting, ~10° isometric tilt. Linear/
Slack premium aesthetic. 16:10 ratio.
--ar 16:10 --style raw --s 250
```

### 4.2 Imagem B

```
Continuação direta da Imagem A — mesma cena, mesma câmera, mesmo
16:10. Mudanças:
- Nova bolha de chat surgiu no fundo da conversa aberta, em ciano
  claro com brilho sutil (mensagem recebida).
- Indicador "digitando..." em três pontos pulsantes no canto
  inferior-esquerdo da conversa.
- Os três ícones orbitais deslocaram-se ~5° no sentido horário ao
  redor do card.
- Brilho ciano de fundo ~10% mais intenso.
Manter ratio 16:10, mesma resolução.
```

### 4.3 Animação

```
Animação suave entre dois frames de mockup de inbox unificado,
formato 16:10. Movimento: bolhas de chat surgindo de baixo pra cima
com fade-in (5px de translação Y), três pontos pulsantes no
indicador "digitando", ícones orbitais (WhatsApp/Instagram/Messenger)
rotacionando lentamente ao redor do card central (~36° em 5s),
brilho ciano (#8BE9FD) pulsando suavemente. Sem cortes, sem zoom,
sem mudança de câmera. Duração: 5 segundos. Loop perfeito. Sem
áudio. Resolução: 1280x800 (16:10). Exportar MP4 H.264, 1 Mbps,
faststart ativo.
```

---

## 5. Exportação final

Depois de gerar o vídeo na ferramenta de animação:

1. **Comprimir e padronizar** com `ffmpeg`:

   ```powershell
   ffmpeg -i entrada.mp4 -c:v libx264 -preset slow -crf 28 -profile:v main `
     -movflags +faststart -an -vf "scale=1280:800" cases/card1-sistemas.mp4
   ```

   Flags importantes:
   - `-an` remove a faixa de áudio (autoplay no iOS).
   - `-movflags +faststart` move o metadata pro início (carrega antes de baixar tudo).
   - `-crf 28` é mais agressivo que desktop pra economizar dados móveis sem perda visível.
   - `-profile:v main` melhora compat com Android mais antigo.

2. **Validar tamanho**: o arquivo final deve ficar entre **300 KB e 700 KB**. Se passar de 1 MB, suba o `-crf` para 30.

3. **Renomear e colocar em `cases/`**:
   - Card 1 → `cases/card1-sistemas.mp4`
   - Card 2 → `cases/card2-atendimento.mp4`

4. **Sem mudança de CSS necessária**. O componente `<AutoVideo/>` em `app.jsx` já está configurado.

---

## 6. Estratégia de mídia única (recomendada)

Em vez de gerar duas versões (desktop + mobile) e trocar via `<source>`, a forma mais simples é:

1. Gerar **um único arquivo a 1500×1200 (5:4)** com o briefing do `MIDIA-DESKTOP.md`.
2. No mobile, o CSS `aspect-ratio: 16/10` + `object-fit: cover` corta um pouco em cima e embaixo, mas o conteúdo central da imagem (que está com safe margin) sobrevive.
3. Resultado: um único arquivo ≤ 1,5 MB que funciona em tudo, com perda visual mínima no celular.

Se for adotar duas versões separadas (mais qualidade, mais trabalho de manutenção), troque o componente `<AutoVideo/>` em `app.jsx` para algo como:

```jsx
<video ...>
  <source src="cases/card1-sistemas-mobile.mp4" media="(max-width: 720px)" type="video/mp4"/>
  <source src="cases/card1-sistemas.mp4" type="video/mp4"/>
</video>
```

Avise antes de mexer no JSX pra manter alinhado com a skill.

---

## 7. Checklist de validação

- [ ] Imagem A e Imagem B geradas na proporção **16:10** em pelo menos **1280×800**.
- [ ] Conteúdo principal está no centro com pelo menos **15% de safe margin** lateral (pra sobreviver a crops).
- [ ] Cores das imagens respeitam a paleta: card 1 verde `#50FA7B`, card 2 ciano `#8BE9FD`, fundo Dracula escuro.
- [ ] Sem texto legível em qualquer idioma (caracteres placeholder apenas).
- [ ] Sem logos reais (WhatsApp/Instagram/Messenger só como silhuetas estilizadas).
- [ ] Vídeo gerado em 5 segundos, loop fechado, sem áudio.
- [ ] Arquivo final ≤ 700 KB (ideal) ou ≤ 1 MB (limite), MP4 H.264 perfil Main, faststart ativo.
- [ ] Arquivo salvo no caminho exato (`cases/card1-sistemas.mp4` ou `cases/card2-atendimento.mp4`).
- [ ] Testar em DevTools mobile (iPhone 14 + Galaxy S22) e celular real, com 4G simulado, antes de declarar pronto.
