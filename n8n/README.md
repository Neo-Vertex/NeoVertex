# n8n - Agente captador Neo Vertex

Conjunto de workflows que rodam o agente IA da Neo Vertex no WhatsApp via Chatwoot + Baileys.

## Status atual

Os 5 workflows já foram **criados via REST API** em `https://n8n.neovertexia.com`, todos linkados entre si. Estão **inativos** aguardando configuração de credenciais.

| Workflow | ID no n8n |
|---|---|
| 00. Configurações - Neo Vertex | `pjGouN7nr3vEjcxQ` |
| 01. Captador Neo Vertex | `4dtWlS7q1aHZEuhL` |
| 02. Escalar humano - Neo Vertex | `B21t6ruEBzaVjdBe` |
| 03. Quebrar e enviar mensagens - Neo Vertex | `Xxp5PtdaAybjie0L` |
| Sugerir_horario (Neo Vertex) | `QJnwCMaTklA4EqhL` |

Pendências do lado do usuário antes de ativar:

1. Subir Postgres dedicado no Coolify.
2. Configurar 3 credenciais no n8n (Postgres, Chatwoot API, OpenAI API).
3. Selecionar a credencial certa em cada nó dos 5 workflows.
4. Rodar o `00. Configurações` uma vez (cria tabelas + etiquetas).
5. Cadastrar o webhook no Chatwoot.
6. Ativar o `01. Captador Neo Vertex`.
7. Deletar o workflow antigo `Agente Neo Vertex` (ID `FECLeeBbVu8B80io`) — está vazio e atrapalha.

## Arquivos

| Arquivo | Tipo | Função |
|---|---|---|
| `00_configuracoes_neovertex.json` | Trigger manual | Cria tabelas Postgres e etiquetas no Chatwoot. Roda uma vez. |
| `01_captador_neovertex.json` | Webhook (POST) | Workflow principal. Recebe webhooks do Chatwoot, debounce, agente IA, responde no WhatsApp. |
| `02_escalar_humano.json` | Sub-workflow | Pausa o agente para o lead, registra no CRM e dispara alerta no WhatsApp pessoal do Nelson. |
| `03_quebrar_e_enviar_mensagens.json` | Sub-workflow | Divide a resposta longa em pedaços naturais e envia simulando digitação humana. |

## Ordem de importação no n8n

1. `03_quebrar_e_enviar_mensagens.json` (sub-workflow, sem dependências).
2. `02_escalar_humano.json` (sub-workflow, sem dependências).
3. `00_configuracoes_neovertex.json` (manual).
4. `01_captador_neovertex.json` (workflow principal — depende dos dois sub-workflows e do `Sugerir_horario` que você cria à parte).

## Pré-requisitos

### Credenciais a configurar no n8n (antes de importar/rodar)

1. **Postgres** — conexão com o banco dedicado da Neo Vertex. Pode usar o nome padrão `Postgres account`. Será referenciada por todos os nodes Postgres dos workflows.
2. **Chatwoot API** (`chatwootApi`) — token de acesso pessoal extraído de `Perfil` no Chatwoot. URL base usada nas chamadas é `https://chatwoot.neovertexia.com`.
3. **OpenAI API** (`openAiApi`) — chave da OpenAI usada por `Modelo principal GPT-4.1` (workflow 01) e `OpenAI Chat Model` (workflow 03).

Após importar cada workflow, abra cada node de Postgres / OpenAI / Chatwoot e selecione a credencial correspondente.

## Passo a passo

### 1. Importar os 4 JSONs

No n8n: `Workflows` → `Import from File`. Importe um por um, na ordem acima.

### 2. Rodar a configuração inicial

Abra `00. Configurações - Neo Vertex`, valide o node `Info` (URL Chatwoot, ID conta, ID inbox, WhatsApp do Nelson) e clique em `Test workflow`.

Isso vai:

- Criar as tabelas: `nv_historico_mensagens`, `nv_fila_mensagens`, `nv_status_atendimento`, `nv_leads`.
- Criar as etiquetas no Chatwoot: `agente-off`, `testando-agente`, `lead-novo`, `aguardando-horario`, `pediu-humano`, `fora-escopo`, `desrespeito`.

Se alguma etiqueta já existir, o node está com `onError: continueRegularOutput` — ele só pula e segue.

### 3. Criar o workflow auxiliar `Sugerir horario` (manual)

O agente principal chama uma tool `Sugerir_horario` que devolve 3 horários genéricos. Crie um novo workflow em branco com:

- **Trigger**: `When Executed by Another Workflow` (sem inputs).
- **1 node Code** com este JS:

```javascript
const hoje = new Date();
const dias = [];
let d = new Date(hoje);
while (dias.length < 5) {
  d.setDate(d.getDate() + 1);
  const wd = d.getDay();
  if (wd !== 0 && wd !== 6) dias.push(new Date(d));
}
const horas = [10, 14, 16];
const nomesDia = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
const sugestoes = dias.slice(0, 3).map((dt, i) =>
  `${nomesDia[dt.getDay()]} ${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')} às ${horas[i]}h`
);
return [{ json: { sugestoes } }];
```

Salve, **copie o ID do workflow** que aparece na URL (`/workflow/<ID>`), e cole no node `Sugerir_horario` do `01_captador_neovertex.json` (campo `workflowId`).

### 4. Conectar tools do agente aos sub-workflows reais

No workflow `01`, abra:

- `Escalar_humano` → ajustar `workflowId` para o ID real do `02_escalar_humano` importado.
- `Sugerir_horario` → ajustar `workflowId` para o ID do auxiliar criado no passo 3.
- `Quebrar e enviar resposta` → ajustar `workflowId` para o ID real do `03_quebrar_e_enviar_mensagens`.

(Os IDs dos JSONs entregues são placeholders — substitua todos.)

### 5. Configurar o webhook no Chatwoot

`Settings` → `Integrations` → `Webhooks` → `Add new webhook`:

- **URL**: `https://n8n.neovertexia.com/webhook/ba5dfe9c-dc78-4a7d-b304-56afa771ec77`
- **Subscribe to events**: marcar **Conversation Created**, **Message Created**.

(O path do webhook do workflow 01 está fixado neste UUID — se mudar, atualize aqui.)

### 6. Ativar o workflow principal

No n8n, abra `01. Captador Neo Vertex` e ligue o toggle `Active` no canto superior direito.

A partir desse momento toda mensagem recebida na inbox 5 do Chatwoot vai disparar o agente.

## Como testar

1. Mande uma mensagem do seu WhatsApp pessoal pro número da empresa `+5521972185315`.
2. No n8n veja `Executions` em `01. Captador Neo Vertex` — deve aparecer uma execução em ~8s.
3. O agente responde no WhatsApp do lead em algumas mensagens curtas.
4. Se você pedir "quero falar com humano", o `02. Escalar humano` é chamado, a etiqueta `agente-off` é aplicada na conversa, e você (Nelson) recebe uma mensagem no `+5521972808355` com o resumo do lead.

## Como pausar / reativar a IA pra um lead específico

- **Pausar**: na conversa do lead no Chatwoot, adicione a etiqueta `agente-off`. O agente para de responder.
- **Reativar**: remova a etiqueta `agente-off`. O agente volta a responder na próxima mensagem do lead.

(O sistema também marca `agente_pausado=true` em `nv_status_atendimento` quando há escalada, mas o controle prático no dia a dia é só pela etiqueta.)

## Pontos de atenção

- Os UUIDs internos dos workflows nos JSONs entregues (`NV01CaptadorBaseId`, etc.) são placeholders. O n8n vai gerar IDs reais ao importar; refaça as ligações de sub-workflow conforme passo 4.
- O agente NÃO agenda no Google Calendar — apenas sugere horários no texto e sinaliza o horário aceito no alerta pro Nelson. A confirmação real do horário é manual.
- O agente NÃO transcreve áudio. Se o lead mandar áudio, ele pede pra digitar.
- O alerta enviado pro Nelson é uma conversa no Chatwoot que sai do Baileys (`+5521972185315`) pro WhatsApp pessoal (`+5521972808355`). Ou seja: o Nelson recebe a notificação direto no celular dele.
- Limites de iteração do agente: configuração padrão do n8n (até ~10 chamadas de tool por turno). Se atingir, o `Output válido?` redireciona pro fluxo de erro que libera o lock.
- O `Sugerir_horario` é um workflow simples que VOCÊ cria à mão (passo 3 acima). Ele não vem pronto nos JSONs porque é só 1 node Code; deixá-lo separado evita conflito de ID.
