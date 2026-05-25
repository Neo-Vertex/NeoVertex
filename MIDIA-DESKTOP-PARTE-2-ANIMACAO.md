# Mídia dos cards — DESKTOP — Parte 2: imagem B (Nano Banana) + vídeo (Veo 3.1)

> **Pré-requisito**: ter as 5 imagens iniciais de `MIDIA-DESKTOP-PARTE-1-IMAGENS.md` prontas (`card1-A.png` ... `card5-A.png`).
>
> **Ferramentas desta etapa**:
> - **Nano Banana** (Gemini 2.5 Flash Image): para gerar a **imagem B** (frame final) de cada card, usando a imagem A como referência.
> - **Veo 3.1** (Google, em [labs.google/flow](https://labs.google/flow) ou via [aistudio.google.com](https://aistudio.google.com)): para transformar o par `(A → B)` em vídeo animado.
>
> **Saída desta parte**: 5 arquivos `.mp4` em `cases/`, prontos para o `<AutoVideo/>`.

---

## 1. Especificação técnica do vídeo final (idêntica para os 5)

| Atributo | Valor |
|---|---|
| **Proporção (Veo 3.1)** | **16:9** (nativo do Veo) |
| **Resolução** | **1920 × 1080** (1080p — Veo entrega) |
| **Duração** | **8 segundos** (padrão do Veo 3.1) |
| **Frame rate** | 24 fps |
| **Codec final (após ffmpeg)** | H.264 perfil High |
| **Container** | MP4 (`.mp4`) |
| **Áudio** | **Sem áudio** (peça explicitamente no prompt do Veo + remova via ffmpeg) |
| **Bitrate alvo (após ffmpeg)** | 1,5 a 2,5 Mbps |
| **Tamanho final** | 1,5 a 3 MB |
| **Flags** | `+faststart` |

---

## 2. Princípios fixos para os 5 vídeos

Esses parâmetros entram em **todo** prompt do Veo 3.1 — só muda o detalhe específico do card.

| Parâmetro | Valor |
|---|---|
| **Câmera** | 100% estática (sem zoom, sem panning, sem dolly) |
| **Movimento ambiente** | Parallax sutil de 1–2 px nas camadas + brilho colorido pulsando suavemente |
| **Easing** | Suave (ease-in-out), sem snaps bruscos |
| **Loop** | Fechado (último frame retorna sem corte visível ao primeiro) |
| **Foco** | Apenas o estado interno muda (números, gráficos, bolhas) — nunca o framing |
| **Velocidade** | Compassada |
| **Áudio** | Pedir explicitamente "**silencioso, sem áudio, sem música, sem efeitos sonoros**" |

---

## 3. Como usar Nano Banana + Veo 3.1

### Imagem B (Nano Banana)

1. Em [aistudio.google.com](https://aistudio.google.com), abra Image generation com Gemini 2.5 Flash Image.
2. **Anexe a imagem A** (`cardN-A.png`) como reference image.
3. Cole o prompt da seção 4–8 deste MD (subseção "Prompt para Imagem B" do card em questão).
4. Gere; salve como `cardN-B.png`.

### Vídeo (Veo 3.1)

1. Em [labs.google/flow](https://labs.google/flow) (ou AI Studio com modelo Veo 3.1), inicie um novo projeto.
2. **Anexe `cardN-A.png` como Start Frame** e **`cardN-B.png` como End Frame** (Veo 3.1 suporta keyframes inicial e final).
3. Cole o prompt da seção 4–8 deste MD (subseção "Prompt para vídeo").
4. Configure: **aspect 16:9**, **resolução 1080p**, **duração 8 s**.
5. Gere. Faça download como `cardN-raw.mp4`.

### Padronização final (ffmpeg)

Cada vídeo passa por um único comando ffmpeg para garantir tamanho, faststart e remoção de áudio.

---

## 4. Card 01 — Sistemas sob medida (verde `#50FA7B`)

### 4.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (card1-A.png) como referência absoluta de estilo,
câmera, iluminação e composição. Gere uma nova imagem que seja a
continuação direta da cena, no mesmo enquadramento exato. Apenas o
estado interno muda:
- O funil de vendas avançou: a etapa "Ganho" na base (verde-neon)
  ficou visivelmente maior, com contador numérico maior.
- O gráfico de fluxo de caixa ganhou uma curva ascendente nova no
  trecho mais à direita.
- Pequena pílula de notificação verde-neon (#50FA7B) surgiu no canto
  superior direito do painel financeiro (sem texto legível).
- Brilho verde de fundo cerca de 10% mais intenso.
Manter exatamente: ratio 16:9, 1920x1080, mesma câmera, mesma
iluminação, mesma profundidade. Nenhum texto legível em nenhum idioma.
```

### 4.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
dashboard empresarial. Start frame e end frame fornecidos.

Câmera: 100% estática. Sem zoom, sem panning, sem dolly, sem mudança
de enquadramento.

Movimentos no estado interno (todos com easing ease-in-out):
- Contadores numéricos das etapas do funil de vendas incrementam
  gradualmente, em ritmo de "roleta lenta".
- O funil de vendas se preenche da base para o topo com fluxo de cor
  verde-neon (#50FA7B).
- A linha do gráfico de fluxo de caixa se desenha da esquerda para a
  direita, terminando com a curva ascendente nova.
- A pílula de notificação verde-neon faz fade-in no canto superior
  direito durante os últimos 1.5 segundos.
- Brilho verde de fundo pulsa suavemente, 1 ciclo completo em 8s.
- Camadas têm parallax de profundidade de 1 a 2 pixels.

Loop perfeito: o último frame retorna sem corte visível ao primeiro.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect ratio: 16:9. Resolução: 1080p.
```

### 4.3 ffmpeg final

```powershell
ffmpeg -i card1-raw.mp4 -c:v libx264 -preset slow -crf 24 -profile:v high `
  -movflags +faststart -an -vf "scale=1920:1080" cases/card1-sistemas.mp4
```

---

## 5. Card 02 — Central de atendimento (ciano `#8BE9FD`)

### 5.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (card2-A.png) como referência absoluta. Gere a
continuação direta da cena, mesmo enquadramento, mesma câmera, mesma
iluminação. Mudanças sutis no estado interno:
- Nova bolha de chat surge no fundo da conversa aberta, em ciano
  claro com brilho sutil (mensagem recebida).
- Indicador "digitando..." em três pontos pulsantes no canto inferior
  esquerdo da conversa.
- Os três ícones orbitais (silhuetas neon-ciano de WhatsApp,
  Instagram, Messenger) deslocaram-se cerca de 5 graus no sentido
  horário ao redor do card principal.
- Badge de não-lido em uma conversa da lista lateral incrementou.
- Brilho ciano (#8BE9FD) de fundo cerca de 10% mais intenso.
Manter 16:9, 1920x1080. Nenhum texto legível.
```

### 5.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
inbox de atendimento unificado. Start frame e end frame fornecidos.

Câmera: 100% estática.

Movimentos no estado interno:
- Nova bolha de chat surge de baixo para cima com fade-in (5 pixels
  de translação Y) na conversa aberta, durante os primeiros 2 segundos.
- Indicador "digitando..." em três pontos pulsantes aparece no canto
  inferior esquerdo entre os segundos 3 e 6.
- Os três ícones orbitais (silhuetas neon-ciano de WhatsApp,
  Instagram, Messenger) rotacionam cerca de 36 graus no sentido
  horário ao redor do card principal ao longo dos 8 segundos.
- Badge de não-lido na lista lateral incrementa em "roleta lenta" em
  ~4 segundos.
- Brilho ciano (#8BE9FD) de fundo pulsa suavemente, 1 ciclo em 8s.
- Parallax sutil de 1 a 2 pixels nas camadas.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 1080p.
```

### 5.3 ffmpeg final

```powershell
ffmpeg -i card2-raw.mp4 -c:v libx264 -preset slow -crf 24 -profile:v high `
  -movflags +faststart -an -vf "scale=1920:1080" cases/card2-atendimento.mp4
```

---

## 6. Card 03 — Automação inteligente (roxo `#BD93F9`)

### 6.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (card3-A.png) como referência absoluta. Continue
a cena, mesmo enquadramento. Mudanças:
- Mais um node do diagrama de fluxo de automação ficou aceso (à
  direita), antes apagado. As linhas pontilhadas conectando os nodes
  têm brilho roxo-neon mais vivo.
- No dashboard de KPIs à direita, os gauges circulares avançaram —
  um deles está perto de 100%. Os mini-sparklines têm uma curva nova.
- Na faixa horizontal de bolhas de chatbot no topo, uma bolha nova
  apareceu na sequência.
- Brilho roxo (#BD93F9) de fundo cerca de 10% mais intenso.
Manter 16:9, 1920x1080. Nenhum texto legível.
```

### 6.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
automação de fluxos. Start frame e end frame fornecidos.

Câmera: 100% estática.

Movimentos:
- Um pulso de luz roxo-neon (#BD93F9) percorre as linhas pontilhadas
  do diagrama de fluxo de um node a outro, da esquerda para a direita,
  durante os primeiros 4 segundos.
- Gauges circulares no dashboard de KPIs preenchem em incrementos
  suaves até o estado final.
- Contadores numéricos incrementam em roleta lenta.
- Nova bolha de chatbot faz fade-in na faixa do topo entre os segundos
  4 e 6.
- Brilho roxo de fundo pulsa suavemente, 1 ciclo em 8s.
- Parallax de 1 a 2 pixels nas camadas.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 1080p.
```

### 6.3 ffmpeg final

```powershell
ffmpeg -i card3-raw.mp4 -c:v libx264 -preset slow -crf 24 -profile:v high `
  -movflags +faststart -an -vf "scale=1920:1080" cases/card3-automacao.mp4
```

---

## 7. Card 04 — Sistemas verticais (rosa `#FF79C6`)

### 7.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (card4-A.png) como referência absoluta. Continue
a cena, mesmo enquadramento. Mudanças:
- As quatro camadas empilhadas obliquamente fizeram uma pequena
  rotação horizontal (~3 graus). A camada da frente trocou: outra
  camada está agora em destaque, com pill rosa-neon (#FF79C6) mais
  vívida.
- Linhas hairline conectando as camadas ficaram mais visíveis.
- Pequeno dot rosa-neon acendeu em duas das camadas, sugerindo
  "atualizações".
- Brilho rosa de fundo cerca de 10% mais intenso.
Manter 16:9, 1920x1080. Nenhum texto legível.
```

### 7.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
sistemas verticais empilhados em 3D. Start frame e end frame
fornecidos.

Câmera: 100% estática.

Movimentos:
- As quatro camadas de painel fazem uma rotação horizontal lenta de
  ~3 graus, com a camada da frente trocando suavemente para outra
  (efeito "cover flow" sutil 3D).
- Pills coloridas em rosa-neon (#FF79C6) das camadas piscam em
  sequência ao longo dos 8 segundos.
- Linhas hairline conectando camadas se desenham da esquerda para a
  direita durante os primeiros 3 segundos.
- Dots rosa-neon acendem em duas camadas com fade-in nos segundos
  finais.
- Brilho rosa de fundo pulsa suavemente, 1 ciclo em 8s.
- Parallax sutil de 1 a 2 pixels.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 1080p.
```

### 7.3 ffmpeg final

```powershell
ffmpeg -i card4-raw.mp4 -c:v libx264 -preset slow -crf 24 -profile:v high `
  -movflags +faststart -an -vf "scale=1920:1080" cases/card4-verticais.mp4
```

---

## 8. Card 05 — Consultoria em tecnologia (amarelo `#F1FA8C`)

### 8.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (card5-A.png) como referência absoluta. Continue
a cena, mesmo enquadramento. Mudanças:
- No documento de diagnóstico à esquerda, mais um item do checklist
  foi marcado (bolinha amarela-neon agora preenchida) e o gráfico de
  radar tem área um pouco maior preenchida.
- Na linha do tempo de roadmap, a segunda fase agora está concluída:
  marcador circular amarela-neon mais brilhante; a linha hairline
  entre fase 1 e fase 2 está sólida em vez de pontilhada.
- Emblema "engrenagem + bússola" tem brilho mais pronunciado.
- Brilho amarelo (#F1FA8C) de fundo cerca de 10% mais intenso.
Manter 16:9, 1920x1080. Nenhum texto legível.
```

### 8.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
consultoria estratégica. Start frame e end frame fornecidos.

Câmera: 100% estática.

Movimentos:
- Items do checklist do diagnóstico são marcados em sequência (check
  amarelo-neon #F1FA8C faz um pequeno "pop" em cada bolinha).
- Gráfico de radar de maturidade expande sua área preenchida suavemente
  até o estado final.
- Na linha do tempo de roadmap, a linha hairline entre fase 1 e fase 2
  se "desenha" da esquerda para a direita, trocando de pontilhada para
  sólida.
- Marcador circular da fase 2 ganha brilho gradativo.
- Engrenagem do emblema gira lentamente (~25 graus em 8 segundos).
- Brilho amarelo de fundo pulsa suavemente, 1 ciclo em 8s.
- Parallax sutil de 1 a 2 pixels.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 1080p.
```

### 8.3 ffmpeg final

```powershell
ffmpeg -i card5-raw.mp4 -c:v libx264 -preset slow -crf 24 -profile:v high `
  -movflags +faststart -an -vf "scale=1920:1080" cases/card5-consultoria.mp4
```

---

## 9. Output esperado

5 arquivos `.mp4` em `cases/`:

| Arquivo | Card | Cor | Tamanho alvo |
|---|---|---|---|
| `cases/card1-sistemas.mp4` | Sistemas sob medida | `#50FA7B` | 1,5 – 3 MB |
| `cases/card2-atendimento.mp4` | Central de atendimento | `#8BE9FD` | 1,5 – 3 MB |
| `cases/card3-automacao.mp4` | Automação inteligente | `#BD93F9` | 1,5 – 3 MB |
| `cases/card4-verticais.mp4` | Sistemas verticais | `#FF79C6` | 1,5 – 3 MB |
| `cases/card5-consultoria.mp4` | Consultoria | `#F1FA8C` | 1,5 – 3 MB |

---

## 10. Ajuste necessário no código (depois)

Hoje em `app.jsx`, na constante `BG_PATTERNS`, apenas os cards verde e ciano usam `<AutoVideo/>`. Os outros 3 (roxo, rosa, amarelo) usam SVG inline. Depois dos 5 vídeos prontos, será preciso trocar os 3 SVGs por `<AutoVideo/>` apontando para os `.mp4` novos. **Avise quando estiverem prontos** que a alteração é feita seguindo a skill `neovertex-dev`.

---

## 11. Checklist de validação

- [ ] Cada Imagem B é claramente continuação da Imagem A (mesma cena, só estado interno mudou).
- [ ] Câmera 100% estática nos 5 vídeos.
- [ ] Loop fechado em todos.
- [ ] Duração de 8 s em todos (Veo 3.1 padrão).
- [ ] Brilho de fundo pulsa suavemente em todos (1 ciclo por loop).
- [ ] Sem faixa de áudio (`-an` no ffmpeg + prompt "silencioso").
- [ ] Faststart aplicado (`-movflags +faststart`).
- [ ] Arquivos finais ≤ 3 MB cada.
- [ ] Salvos com os nomes exatos da seção 9.
- [ ] Coerência visual com a Parte 1 preservada.
- [ ] Teste no desktop: abrir o site local, ver os 5 cards animando sem corte e sem áudio.
