# Mídia dos cards de serviço — DESKTOP

> Briefing para gerar 2 imagens estáticas (frame A e frame B) e transformar essas duas imagens em um vídeo curto em loop, para ocupar o lado direito de cada card da seção **Serviços** no desktop.

---

## 1. Contexto visual — onde a mídia aparece

| Item | Valor |
|---|---|
| Seção | `#solucoes` (Services) na landing |
| Componente React | `<ServiceCard/>` em `app.jsx` |
| Container CSS | `.stack-visual` dentro de `.stack-card` |
| Comportamento | `position: sticky`, autoplay, mudo, loop, `object-fit: cover` |
| Cards afetados | **Card 01** (`stack-green`) → `cases/card1-sistemas.mp4` <br> **Card 02** (`stack-cyan`) → `cases/card2-atendimento.mp4` |

### Posicionamento no card (desktop)

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  TÍTULO GRANDE                       ┌───────────────────┐    │
│  (Sistemas sob medida)               │                   │    │
│  Descrição em 1–2 linhas             │                   │    │
│                                      │   IMAGEM/VÍDEO    │    │
│  • Feature 1                         │   (esta mídia)    │    │
│  • Feature 2                         │                   │    │
│  • Feature 3                         │                   │    │
│  • Feature 4                         └───────────────────┘    │
│                                                               │
│  ← stack-card-body (texto) ─→        ← stack-visual ─→        │
│       grid-template-columns: 1.1fr 1fr                        │
└───────────────────────────────────────────────────────────────┘
```

A mídia ocupa **a coluna da direita do card**, em altura próxima da altura total interna do card.

---

## 2. Dimensão exata da mídia

| Atributo | Valor recomendado | Por quê |
|---|---|---|
| **Proporção** | **5:4** (paisagem leve) | Em desktop, o `.stack-visual` é quase quadrado (~520×450). 5:4 encaixa sem corte agressivo do `object-fit: cover`. |
| **Resolução de exportação** | **1500 × 1200 px** | 2,5× o tamanho display para Retina/4K. Não exagera no peso. |
| **Resolução mínima** | 1080 × 864 px | Suficiente para 1080p sem amostragem visível. |
| **Formato do GIF/vídeo** | **MP4 (H.264)** | GIF puro é pesado; o site usa `<video>` que aceita MP4. |
| **Duração** | **4 a 6 segundos** em loop fechado | Curto o bastante para reapresentar sem cansar; longo o bastante para a animação respirar. |
| **Frame rate** | 24 ou 30 fps | Padrão cinema/web. |
| **Bitrate** | 1,5 a 2,5 Mbps | Alvo de arquivo: **~800 KB a 1,5 MB**. |
| **Áudio** | **Sem áudio** | iOS bloqueia autoplay com som; vídeo silencioso libera autoplay e economiza KB. |

---

## 3. Card 01 — "Sistemas sob medida" (verde)

Acento da paleta: **`--green: #50FA7B`** sobre fundo Dracula `#1A1B23`.

### 3.1 Imagem A (frame inicial)

**Prompt em PT-BR:**

```
Mockup tridimensional de um sistema de gestão empresarial sob medida,
em estilo dashboard escuro premium. Tela principal flutuando isometricamente
sobre fundo preto profundo (#0E0F16), exibindo:
- À esquerda, um CRM com pipeline de funil de vendas vertical
  (etapas Novo / Conversa / Proposta / Ganho), cada etapa com KPIs e
  cor verde-neon (#50FA7B) destacando os números.
- À direita, um painel financeiro com gráfico de linha de fluxo de caixa
  em verde-neon e roxo (#BD93F9), eixos sutis em cinza.
- Cards translúcidos com cantos arredondados (radius 14px), bordas
  finas em rgba branco 8%.
Tipografia sans-serif moderna (estilo Inter), eyebrows monoespaçadas
em caps. Iluminação suave, profundidade com brilho verde difuso atrás
da tela. Sem pessoas, sem logos, sem texto legível em português ou
qualquer idioma — usar caracteres genéricos / lorem ipsum. Composição
limpa, espaço negativo generoso. Estilo Linear / Vercel dashboard.
Câmera levemente elevada, ângulo isométrico (~15° dutch). Ratio 5:4.
```

**Prompt em English (fallback para Midjourney/Stable Diffusion):**

```
Premium dark dashboard mockup of a custom business management system,
floating isometrically over deep black background (#0E0F16). Left:
vertical sales funnel CRM with four stages (New / Talking / Proposal /
Won), each with KPIs highlighted in neon green (#50FA7B). Right:
financial cash-flow line chart in neon green and purple (#BD93F9),
subtle gray axes. Translucent cards, 14px rounded corners, hairline
1px borders at 8% white. Modern sans-serif typography (Inter style),
monospaced uppercase eyebrows. Soft lighting, depth, diffused green
glow behind the screen. No people, no logos, no legible Portuguese
or any-language text — use generic placeholder glyphs. Clean
composition, generous negative space. Linear / Vercel dashboard
aesthetic. Slightly elevated camera, 15° isometric angle. 5:4 ratio.
--ar 5:4 --style raw --s 250
```

### 3.2 Imagem B (frame final)

Mesma cena que a Imagem A, mas com **estado evoluído** — sugere passagem de tempo / progresso:

**Prompt em PT-BR:**

```
Continuação direta da Imagem A — mesma cena, mesma câmera, mesma
iluminação, mesmo enquadramento. Mudanças:
- O funil de vendas avançou: mais leads moveram-se para "Ganho"
  (etapa verde ampliada, contadores maiores).
- O gráfico de fluxo de caixa cresceu uma curva ascendente nova
  no lado direito.
- Um pequeno toast/notificação verde-neon surgiu no canto superior
  direito do painel, com forma de bolha arredondada (sem texto legível).
- Brilho verde de fundo ligeiramente mais intenso (~10% mais luz).
Manter ratio 5:4, mesma resolução, mesma profundidade de campo.
```

**Prompt em English:**

```
Direct continuation of Image A — same scene, same camera, same lighting,
same framing. Changes: sales funnel progressed (more leads in the green
"Won" stage, larger counters); cash-flow chart added an upward curve on
the right edge; small neon-green toast notification appeared in the
upper-right of the right panel (rounded pill, no legible text); ambient
green glow ~10% brighter. Same 5:4 ratio, same resolution, same depth
of field.
--ar 5:4 --style raw --s 250
```

### 3.3 Animação (Imagem A → Imagem B → loop)

Use uma ferramenta de "image-to-video" (Runway Gen-3, Kling, Sora,
Luma, etc.) e cole o prompt abaixo, junto das duas imagens como
keyframes (A = início, B = fim).

```
Animação suave e cinematográfica entre dois frames de um mockup de
dashboard. Movimento: parallax sutil de profundidade (1–2px de drift
nas camadas), brilho verde-neon (#50FA7B) pulsando lentamente,
contadores numéricos incrementando, o funil de vendas preenchendo
gradualmente da etapa inferior para a superior, o gráfico de linha
desenhando-se da esquerda para a direita. Sem cortes, sem zoom
agressivo, sem mudança de câmera. Duração: 5 segundos. Loop perfeito
(o último frame deve voltar suavemente ao primeiro). Sem áudio.
Resolução: 1500x1200 (5:4). Exportar como MP4 H.264, bitrate 1,8 Mbps.
```

---

## 4. Card 02 — "Central de atendimento unificada" (ciano)

Acento da paleta: **`--cyan: #8BE9FD`**.

### 4.1 Imagem A

**Prompt em PT-BR:**

```
Mockup 3D isométrico de uma central de atendimento unificada,
flutuando sobre fundo preto profundo (#0E0F16). Composição:
- Tela principal central: inbox unificado em tom Dracula, com
  lista vertical de conversas à esquerda (avatares circulares,
  prévia de mensagem, badges de não-lido em ciano #8BE9FD) e
  conversa aberta à direita (bolhas de chat alternadas em cinza
  escuro e ciano claro). Sem texto legível.
- Três pequenos ícones flutuantes orbitando a tela: WhatsApp,
  Instagram e Messenger, estilizados em silhueta neon-ciano
  conectados por linhas finas pontilhadas à tela principal.
- Indicador de "online" verde pulsante (#50FA7B) num avatar.
Iluminação fria, brilho ciano difuso atrás da tela. Cards
translúcidos, bordas hairline. Tipografia sans-serif moderna,
sem palavras legíveis (caracteres placeholder). Estilo Linear /
Slack premium. Câmera levemente elevada, ângulo isométrico ~15°.
Ratio 5:4.
```

**Prompt em English:**

```
3D isometric mockup of a unified customer-service hub floating over
deep black (#0E0F16). Main central screen: Dracula-themed unified
inbox — left column lists conversations (round avatars, message
preview, unread badges in cyan #8BE9FD), right column shows an open
chat (alternating gray and cyan bubbles, no legible text). Three
small floating icons orbit the screen: WhatsApp, Instagram, Messenger
in neon-cyan silhouettes connected by dotted lines to the main screen.
A pulsing green (#50FA7B) "online" dot on one avatar. Cool lighting,
diffused cyan glow. Translucent cards, hairline borders. Modern sans-
serif typography, placeholder glyphs only. Linear / Slack premium
aesthetic. Slightly elevated camera, 15° isometric. 5:4 ratio.
--ar 5:4 --style raw --s 250
```

### 4.2 Imagem B

```
Continuação da Imagem A — mesma cena, mesma câmera. Mudanças:
- Nova bolha de chat aparece no fundo da conversa aberta, em
  ciano claro com brilho sutil (mensagem recebida).
- Um indicador "digitando..." em três pontos animados pulsantes
  no canto inferior esquerdo da conversa.
- Os três ícones orbitais (WhatsApp/Instagram/Messenger) deslocaram-se
  ~5° no sentido horário em torno da tela.
- Brilho ciano de fundo ~10% mais intenso.
Mesmo ratio 5:4, mesma resolução, mesma profundidade.
```

### 4.3 Animação

```
Animação suave entre dois frames de um mockup de inbox unificado.
Movimento: novas bolhas de chat surgindo de baixo para cima com
fade-in (5px de translação Y), três pontos pulsando no indicador
"digitando", ícones orbitais rotacionando lentamente em torno da
tela principal (loop 360° em ~10s, vamos cortar em 5s do giro),
brilho ciano (#8BE9FD) pulsando suavemente. Sem cortes, sem zoom,
sem mudança de câmera. Duração: 5 segundos. Loop perfeito.
Sem áudio. Resolução: 1500x1200 (5:4). Exportar MP4 H.264, 1,8 Mbps.
```

---

## 5. Exportação final

Depois de gerar o vídeo na ferramenta de animação:

1. **Comprimir e padronizar** com `ffmpeg` (já instalado na sua máquina):

   ```powershell
   ffmpeg -i entrada.mp4 -c:v libx264 -preset slow -crf 26 -profile:v high `
     -movflags +faststart -an -vf "scale=1500:1200" cases/card1-sistemas.mp4
   ```

   Flags importantes:
   - `-an` remove qualquer faixa de áudio (autoplay no iOS).
   - `-movflags +faststart` move o metadata para o início (carrega antes de baixar tudo).
   - `-crf 26` é o sweet spot de qualidade × tamanho (mais baixo = mais qualidade).

2. **Validar tamanho**: o arquivo final deve ficar entre **800 KB e 1,5 MB**. Se passar de 2 MB, suba o `-crf` para 28.

3. **Renomear e colocar em `cases/`**:
   - Card 1 → `cases/card1-sistemas.mp4`
   - Card 2 → `cases/card2-atendimento.mp4`

4. **Sem mudança de CSS necessária**. O componente `<AutoVideo/>` em `app.jsx` já está configurado.

---

## 6. Checklist de validação

- [ ] Imagem A e Imagem B geradas na proporção **5:4** em pelo menos **1500×1200**.
- [ ] Imagem B é claramente continuação da A (mesma cena, mesmo enquadramento).
- [ ] Cores das imagens respeitam a paleta: card 1 verde `#50FA7B`, card 2 ciano `#8BE9FD`, ambos sobre fundo Dracula escuro.
- [ ] Sem texto legível em qualquer idioma (evita parecer "tradução errada").
- [ ] Sem logos reais (WhatsApp/Instagram/Messenger só como silhuetas estilizadas).
- [ ] Vídeo gerado em 5 segundos, loop fechado, sem áudio.
- [ ] Arquivo final ≤ 1,5 MB, MP4 H.264, faststart ativo.
- [ ] Arquivo salvo no caminho exato (`cases/card1-sistemas.mp4` ou `cases/card2-atendimento.mp4`).
- [ ] Recarregar o site e confirmar que o vídeo aparece dentro do card sem corte estranho.
