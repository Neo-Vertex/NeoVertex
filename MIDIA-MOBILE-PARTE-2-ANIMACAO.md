# Mídia dos cards — MOBILE — Parte 2: imagem B (Nano Banana) + vídeo (Veo 3.1)

> **Pré-requisito**: ter as 5 imagens iniciais de `MIDIA-MOBILE-PARTE-1-IMAGENS.md` prontas (`m-card1-A.png` ... `m-card5-A.png`).
>
> **Ferramentas desta etapa**:
> - **Nano Banana** (Gemini 2.5 Flash Image, [aistudio.google.com](https://aistudio.google.com)): para gerar a **imagem B** (frame final) de cada card.
> - **Veo 3.1** (Google, [labs.google/flow](https://labs.google/flow) ou AI Studio): para transformar `(A → B)` em vídeo animado.
>
> **Saída**: 5 `.mp4` em `cases/mobile/` (ou no `cases/` direto se você só vai usar a versão mobile).

---

## 1. Especificação técnica do vídeo final (idêntica para os 5)

| Atributo | Valor |
|---|---|
| **Proporção (Veo 3.1)** | **16:9** (nativo) |
| **Resolução do Veo** | **720p (1280×720)** |
| **Duração** | **8 segundos** (padrão do Veo 3.1) |
| **Frame rate** | 24 fps |
| **Codec final (após ffmpeg)** | H.264 perfil Main (melhor compat Android antigo) |
| **Container** | MP4 (`.mp4`) |
| **Áudio** | **Sem áudio** (peça no prompt + remova via ffmpeg) |
| **Bitrate alvo (após ffmpeg)** | 800 kbps – 1,2 Mbps |
| **Tamanho final** | **400 KB – 900 KB** (importante em 4G) |
| **Flags** | `+faststart` |

---

## 2. Princípios fixos para os 5 vídeos (mobile)

| Parâmetro | Valor |
|---|---|
| **Câmera** | 100% estática |
| **Movimento ambiente** | Parallax sutil de 1 pixel + brilho colorido pulsando suavemente |
| **Easing** | Suave (ease-in-out) |
| **Loop** | Fechado |
| **Foco** | Apenas estado interno muda |
| **Densidade de movimento** | **Mais contida** que a versão desktop (movimento excessivo cansa em tela pequena) |
| **Áudio** | Pedir "silencioso, sem áudio, sem música, sem efeitos sonoros" |

---

## 3. Como usar Nano Banana + Veo 3.1 (mobile)

### Imagem B (Nano Banana)

1. Em [aistudio.google.com](https://aistudio.google.com) → Image generation com Gemini 2.5 Flash Image.
2. **Anexe `m-cardN-A.png` como reference image**.
3. Cole o prompt da seção 4–8 deste MD (subseção "Prompt para Imagem B").
4. Gere; salve como `m-cardN-B.png`.

### Vídeo (Veo 3.1)

1. Em [labs.google/flow](https://labs.google/flow) (ou AI Studio com Veo 3.1).
2. **Start frame: `m-cardN-A.png`** | **End frame: `m-cardN-B.png`**.
3. Cole o prompt da seção 4–8 ("Prompt para vídeo").
4. Configure: **aspect 16:9**, **resolução 720p**, **duração 8 s**.
5. Gere. Download como `m-cardN-raw.mp4`.

### Padronização final (ffmpeg)

Comando único por card; sai com arquivo final no caminho certo.

---

## 4. Card 01 — Sistemas sob medida (verde `#50FA7B`)

### 4.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (m-card1-A.png) como referência absoluta de estilo,
câmera, iluminação e composição. Gere a continuação direta da cena no
mesmo enquadramento. Mudanças sutis no estado interno:
- O funil de vendas avançou: etapa "Ganho" (verde-neon, base) maior,
  com contador numérico maior.
- O gráfico de fluxo de caixa ganhou uma curva ascendente no trecho
  à direita.
- Brilho verde de fundo cerca de 10% mais intenso.
Manter exatamente: ratio 16:9, 1280x720, mesma câmera, mesma
iluminação, 20% safe margin em todas as bordas. Nenhum texto legível.
```

### 4.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
dashboard empresarial em versão horizontal compacta. Start frame e
end frame fornecidos.

Câmera: 100% estática. Sem zoom, sem panning, sem dolly.

Movimentos no estado interno (com easing ease-in-out):
- Contadores numéricos do funil de vendas incrementam gradualmente
  em ritmo de roleta lenta.
- O funil se preenche da base para o topo com fluxo verde-neon
  (#50FA7B).
- Linha do gráfico de fluxo de caixa se desenha da esquerda para a
  direita.
- Brilho verde de fundo pulsa suavemente, 1 ciclo em 8 segundos.
- Parallax sutil de 1 pixel nas camadas.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 720p.
```

### 4.3 ffmpeg final

```powershell
ffmpeg -i m-card1-raw.mp4 -c:v libx264 -preset slow -crf 28 -profile:v main `
  -movflags +faststart -an -vf "scale=1280:720" cases/mobile/card1-sistemas.mp4
```

---

## 5. Card 02 — Central de atendimento (ciano `#8BE9FD`)

### 5.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (m-card2-A.png) como referência absoluta. Continue
a cena, mesmo enquadramento. Mudanças:
- Nova bolha de chat ciano clara apareceu no fundo da conversa aberta
  (mensagem recebida).
- Indicador "digitando..." em três pontos no canto inferior esquerdo
  da conversa.
- Os dois ícones orbitais (silhuetas neon-ciano de WhatsApp e
  Instagram) deslocaram-se cerca de 5 graus no sentido horário.
- Brilho ciano (#8BE9FD) de fundo cerca de 10% mais intenso.
Manter 16:9, 1280x720, 20% safe margin. Nenhum texto legível.
```

### 5.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
inbox unificado, formato horizontal compacto. Start frame e end frame
fornecidos.

Câmera: 100% estática.

Movimentos:
- Nova bolha de chat surge de baixo para cima com fade-in (5 pixels
  de translação Y) nos primeiros 2 segundos.
- Indicador "digitando..." em três pontos pulsantes aparece entre os
  segundos 3 e 6.
- Dois ícones orbitais rotacionam cerca de 30 graus no sentido horário
  ao longo dos 8 segundos.
- Brilho ciano (#8BE9FD) pulsa suavemente, 1 ciclo em 8s.
- Parallax sutil de 1 pixel.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 720p.
```

### 5.3 ffmpeg final

```powershell
ffmpeg -i m-card2-raw.mp4 -c:v libx264 -preset slow -crf 28 -profile:v main `
  -movflags +faststart -an -vf "scale=1280:720" cases/mobile/card2-atendimento.mp4
```

---

## 6. Card 03 — Automação inteligente (roxo `#BD93F9`)

### 6.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (m-card3-A.png) como referência absoluta. Continue
a cena, mesmo enquadramento. Mudanças:
- No diagrama horizontal de fluxo, o quarto node (mais à direita) está
  aceso agora (antes apagado). A linha pontilhada que o conecta ao
  terceiro node tem brilho roxo-neon mais vivo.
- Na faixa superior de KPIs, um dos mini-gauges está perto de 100%.
- Brilho roxo (#BD93F9) de fundo cerca de 10% mais intenso.
Manter 16:9, 1280x720, 20% safe margin. Nenhum texto legível.
```

### 6.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
automação horizontal. Start frame e end frame fornecidos.

Câmera: 100% estática.

Movimentos:
- Pulso de luz roxo-neon (#BD93F9) percorre as linhas pontilhadas
  entre os nodes, da esquerda para a direita, durante os primeiros
  4 segundos.
- Quarto node acende com fade-in entre os segundos 4 e 6.
- Mini-gauges na faixa superior preenchem em incrementos suaves.
- Brilho roxo de fundo pulsa, 1 ciclo em 8s.
- Parallax sutil de 1 pixel.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 720p.
```

### 6.3 ffmpeg final

```powershell
ffmpeg -i m-card3-raw.mp4 -c:v libx264 -preset slow -crf 28 -profile:v main `
  -movflags +faststart -an -vf "scale=1280:720" cases/mobile/card3-automacao.mp4
```

---

## 7. Card 04 — Sistemas verticais (rosa `#FF79C6`)

### 7.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (m-card4-A.png) como referência absoluta. Continue
a cena, mesmo enquadramento. Mudanças:
- Os quatro cards de nichos (lado a lado em linha) fizeram uma
  pequena oscilação: o segundo card cresceu ligeiramente (~5%) como
  se "selecionado", com pill rosa-neon (#FF79C6) mais vívida.
- Linhas hairline conectando os cards ficaram mais visíveis.
- Pequenos dots rosa-neon acenderam em dois dos cards.
- Brilho rosa de fundo cerca de 10% mais intenso.
Manter 16:9, 1280x720, 20% safe margin. Nenhum texto legível.
```

### 7.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
sistemas verticais em linha horizontal. Start frame e end frame
fornecidos.

Câmera: 100% estática.

Movimentos:
- O "card selecionado" troca em sequência (cards 1 → 2 → 3 → 4 →
  volta ao 1) ao longo dos 8 segundos, com leve crescimento (~5%)
  do card ativo e brilho da pill correspondente.
- Linhas hairline entre cards "se desenham" da esquerda para a
  direita nos primeiros 3 segundos.
- Dots rosa-neon (#FF79C6) acendem em dois cards com fade-in.
- Brilho rosa de fundo pulsa, 1 ciclo em 8s.
- Parallax sutil de 1 pixel.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 720p.
```

### 7.3 ffmpeg final

```powershell
ffmpeg -i m-card4-raw.mp4 -c:v libx264 -preset slow -crf 28 -profile:v main `
  -movflags +faststart -an -vf "scale=1280:720" cases/mobile/card4-verticais.mp4
```

---

## 8. Card 05 — Consultoria em tecnologia (amarelo `#F1FA8C`)

### 8.1 Prompt para Imagem B (Nano Banana)

```
Use a imagem anexada (m-card5-A.png) como referência absoluta. Continue
a cena, mesmo enquadramento. Mudanças:
- No documento de diagnóstico, mais um item do checklist foi marcado
  (bolinha amarela-neon agora preenchida).
- O mini-gráfico de radar tem área um pouco maior preenchida.
- Na linha do tempo de roadmap, a segunda fase está "concluída"
  (marcador amarela-neon mais brilhante); a linha hairline entre fase 1
  e 2 está sólida (não pontilhada).
- Brilho amarelo (#F1FA8C) de fundo cerca de 10% mais intenso.
Manter 16:9, 1280x720, 20% safe margin. Nenhum texto legível.
```

### 8.2 Prompt para vídeo (Veo 3.1)

```
Interpolação cinematográfica suave entre dois frames de mockup de
consultoria estratégica em formato horizontal. Start frame e end frame
fornecidos.

Câmera: 100% estática.

Movimentos:
- Items do checklist do diagnóstico são marcados em sequência (check
  amarelo-neon #F1FA8C faz um pop em cada bolinha).
- Mini-gráfico de radar expande sua área preenchida suavemente.
- Na linha do tempo, a linha hairline entre fase 1 e fase 2 "se
  desenha" da esquerda para a direita, trocando de pontilhada para
  sólida.
- Marcador circular da fase 2 ganha brilho gradativo.
- Emblema "engrenagem + bússola" gira lentamente (~20 graus em 8s).
- Brilho amarelo de fundo pulsa, 1 ciclo em 8s.
- Parallax sutil de 1 pixel.

Loop perfeito.

Áudio: silencioso, sem áudio, sem música, sem efeitos sonoros.

Duração: 8 segundos. Aspect 16:9. Resolução 720p.
```

### 8.3 ffmpeg final

```powershell
ffmpeg -i m-card5-raw.mp4 -c:v libx264 -preset slow -crf 28 -profile:v main `
  -movflags +faststart -an -vf "scale=1280:720" cases/mobile/card5-consultoria.mp4
```

---

## 9. Output esperado

5 arquivos `.mp4` em `cases/mobile/`:

| Arquivo | Card | Cor | Tamanho alvo |
|---|---|---|---|
| `cases/mobile/card1-sistemas.mp4` | Sistemas sob medida | `#50FA7B` | 400 KB – 900 KB |
| `cases/mobile/card2-atendimento.mp4` | Central de atendimento | `#8BE9FD` | 400 KB – 900 KB |
| `cases/mobile/card3-automacao.mp4` | Automação inteligente | `#BD93F9` | 400 KB – 900 KB |
| `cases/mobile/card4-verticais.mp4` | Sistemas verticais | `#FF79C6` | 400 KB – 900 KB |
| `cases/mobile/card5-consultoria.mp4` | Consultoria | `#F1FA8C` | 400 KB – 900 KB |

> Antes de rodar o ffmpeg, **crie a pasta**: `mkdir cases\mobile` no PowerShell.

---

## 10. Ajuste necessário no código (depois)

Se você for adotar as duas versões (desktop + mobile), o `<AutoVideo/>` em `app.jsx` precisa virar `<video>` com `<source media="(max-width: 720px)" src="cases/mobile/...mp4">`. **Avise quando os 5 vídeos mobile estiverem prontos** que a alteração é feita seguindo a skill `neovertex-dev`.

---

## 11. Checklist de validação

- [ ] Cada Imagem B é continuação direta da Imagem A.
- [ ] Câmera 100% estática.
- [ ] Loop fechado em todos.
- [ ] Duração 8 s em todos (Veo 3.1 padrão).
- [ ] Brilho de fundo pulsa (1 ciclo por loop).
- [ ] Sem faixa de áudio.
- [ ] Faststart aplicado.
- [ ] Arquivos finais **≤ 900 KB** cada.
- [ ] Salvos com os nomes exatos da seção 9 em `cases/mobile/`.
- [ ] Coerência visual entre os 5 preservada.
- [ ] Movimento mais contido que a versão desktop.
- [ ] Teste no DevTools mobile (iPhone 14 + Galaxy S22) + celular real com 4G simulado.
