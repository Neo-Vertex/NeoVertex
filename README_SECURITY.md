# Configuração de Segurança do Formulário de Contato

Este projeto utiliza o **Google reCAPTCHA v2** para proteção contra spam. Para que ele funcione corretamente em produção, você precisa configurar suas próprias chaves.

## Passos para Configuração

1.  Acesse o [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).
2.  Registre um novo site:
    *   **Etiqueta**: NeoVertex (ou o nome do seu projeto).
    *   **Tipo de reCAPTCHA**: Escolha **reCAPTCHA v2** > **Caixa de seleção "Não sou um robô"**.
    *   **Domínios**: Adicione os domínios onde o site será hospedado (ex: `localhost`, `neovertex.com`).
3.  Copie a **Chave do Site** (Site Key) e a **Chave Secreta** (Secret Key).

## Atualizando o Código

1.  Abra o arquivo `src/components/Contact.tsx`.
2.  Localize a linha onde o componente `<ReCAPTCHA />` é utilizado.
3.  Substitua a chave de teste pela sua **Chave do Site**:

```tsx
<ReCAPTCHA
    ref={recaptchaRef}
    sitekey="SUA_CHAVE_DO_SITE_AQUI" // <--- Cole sua chave aqui
    onChange={(token) => setRecaptchaToken(token)}
    theme="dark"
/>
```

> **Nota**: A chave atual no código (`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`) é uma chave de teste do Google que sempre funciona para fins de desenvolvimento.

## Outras Proteções Implementadas

*   **Honeypot**: Campo invisível que captura bots que preenchem todos os campos.
*   **Rate Limiting**: Impede o envio de mais de uma mensagem a cada 10 minutos pelo mesmo navegador.
*   **Validação de Spam**: Bloqueia palavras-chave suspeitas como 'casino', 'viagra', etc.
*   **Validação de Formato**: Garante que e-mails e nomes estejam no formato correto.
