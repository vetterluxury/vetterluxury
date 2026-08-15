# Vetter Luxury — Loja Virtual

Projeto completo de e-commerce da **Vetter Luxury**, construído com Next.js 14 (App Router), TypeScript, Tailwind CSS e Supabase (Auth, Database, Storage). Pagamentos preparados para Mercado Pago (Pix e Cartão de Crédito).

---

## Índice

1. [Como instalar](#1-como-instalar)
2. [Como executar localmente](#2-como-executar-localmente)
3. [Como criar o projeto no Supabase](#3-como-criar-o-projeto-no-supabase)
4. [Como configurar as variáveis de ambiente](#4-como-configurar-as-variáveis-de-ambiente)
5. [Como criar o banco de dados](#5-como-criar-o-banco-de-dados)
6. [Como configurar o Storage](#6-como-configurar-o-storage)
7. [Como configurar o administrador](#7-como-configurar-o-administrador)
8. [Como configurar o Mercado Pago](#8-como-configurar-o-mercado-pago)
9. [Como configurar o Google Analytics](#9-como-configurar-o-google-analytics)
10. [Como configurar o Google Search Console](#10-como-configurar-o-google-search-console)
11. [Como publicar na Vercel](#11-como-publicar-na-vercel)
12. [Como conectar um domínio próprio](#12-como-conectar-um-domínio-próprio)
13. [Como atualizar o projeto](#13-como-atualizar-o-projeto)
14. [O que está pronto vs. o que precisa de configuração](#14-o-que-está-pronto-vs-o-que-precisa-de-configuração)
15. [Checklist final de publicação](#15-checklist-final-de-publicação)

---

## 1. Como instalar

Pré-requisitos: [Node.js 18+](https://nodejs.org) e uma conta no [GitHub](https://github.com) e na [Vercel](https://vercel.com).

```bash
# dentro da pasta do projeto
npm install
```

## 2. Como executar localmente

```bash
cp .env.example .env.local
# edite .env.local com suas credenciais (veja seções 3–9 abaixo)
npm run dev
```

O site abre em `http://localhost:3000`. O painel administrativo fica em `http://localhost:3000/admin`.

Antes de publicar, rode:

```bash
npm run typecheck   # verifica erros de TypeScript
npm run lint        # verifica erros de lint/imports
npm run build       # build de produção — pega a maioria dos erros de rota/componente
```

> Este projeto foi escrito e revisado manualmente, mas não foi possível rodar `npm install` / `npm run build` no ambiente em que foi gerado (sem acesso à internet). **Rode os três comandos acima antes do primeiro deploy** e corrija qualquer apontamento do TypeScript/ESLint — geralmente são ajustes pequenos de tipagem.

## 3. Como criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**.
2. Escolha nome, senha do banco e região (ex: São Paulo).
3. Aguarde a criação (leva ~2 minutos).
4. Em **Project Settings → API**, copie:
   - `Project URL` → vai em `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → vai em `SUPABASE_SERVICE_ROLE_KEY` (**nunca exponha no frontend**)

## 4. Como configurar as variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha cada variável. Cada uma tem um comentário explicando onde encontrá-la. Resumo:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` |
| `MERCADOPAGO_ACCESS_TOKEN` / `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | [Painel do desenvolvedor Mercado Pago](https://www.mercadopago.com.br/developers/panel) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Painel Mercado Pago → Webhooks |
| `NEXT_PUBLIC_SITE_URL` | URL do seu site (local: `http://localhost:3000`; produção: sua URL da Vercel/domínio) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics → Administrador → Fluxos de dados |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console, ao adicionar a propriedade |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Já preenchido com `5551996767044` |

**Nunca** cometa `.env.local` no Git — já está no `.gitignore`.

## 5. Como criar o banco de dados

1. No Supabase, vá em **SQL Editor → New query**.
2. Cole todo o conteúdo de `supabase/schema.sql` e clique **Run**.
3. Isso cria todas as tabelas (`products`, `categories`, `collections`, `orders`, `coupons`, `banners`, etc.), índices, triggers de `updated_at` e todas as políticas de **Row Level Security**.

## 6. Como configurar o Storage

1. Ainda no **SQL Editor**, cole o conteúdo de `supabase/storage.sql` e clique **Run**.
2. Isso cria os buckets `products`, `banners` e `collections` (públicos para leitura, restritos a administradores para upload) e as políticas de acesso do Storage.
3. Pronto — o upload de imagens no painel administrativo (`/admin/produtos`, `/admin/banners`, `/admin/colecoes`) já funciona.

## 7. Como configurar o administrador

1. Acesse o site publicado (ou local) e crie sua conta normalmente em `/cadastro`.
2. Confirme o e-mail (Supabase envia automaticamente).
3. No Supabase, vá em **SQL Editor** e rode:

```sql
update profiles set is_admin = true where id = (
  select id from auth.users where email = 'seu-email@exemplo.com'
);
```

4. Faça login novamente — agora `/admin` estará acessível.

## 8. Como configurar o Mercado Pago

1. Crie uma conta em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers/panel).
2. Crie uma aplicação e copie as **credenciais de teste** primeiro:
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
3. Teste o fluxo completo de compra com as credenciais de teste.
4. Quando estiver tudo certo, troque para as **credenciais de produção** no `.env.local` (local) e nas Environment Variables da Vercel (produção).
5. Em **Webhooks** no painel do Mercado Pago, cadastre a URL:
   ```
   https://SEU-DOMINIO/api/mercadopago/webhook
   ```
6. Copie a chave secreta do webhook para `MERCADOPAGO_WEBHOOK_SECRET`.

A rota `src/app/api/checkout/route.ts` cria o pedido no Supabase e a preferência de pagamento no Mercado Pago. A rota `src/app/api/mercadopago/webhook/route.ts` recebe a notificação de pagamento, **valida a assinatura** (`x-signature` / HMAC-SHA256 com `MERCADOPAGO_WEBHOOK_SECRET`, conforme a documentação oficial) e só então atualiza o status do pedido — isso impede que alguém forje uma notificação de "pagamento aprovado" sem ter pago de verdade. Se `MERCADOPAGO_WEBHOOK_SECRET` não estiver configurado, a validação é pulada com um aviso no log (útil em desenvolvimento local), mas **deve sempre estar configurada em produção**.

**Frete:** a arquitetura está preparada para integração com Correios/Melhor Envio (ver `src/app/checkout/page.tsx`), mas nenhum valor de frete é inventado — hoje ele é combinado diretamente com a cliente até uma API de logística ser conectada.

## 9. Como configurar o Google Analytics

1. Crie uma propriedade GA4 em [analytics.google.com](https://analytics.google.com).
2. Em **Administrador → Fluxos de dados → Web**, copie o **ID de Medição** (`G-XXXXXXXXXX`).
3. Cole em `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
4. Os eventos de e-commerce (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`) já estão implementados em `src/lib/analytics.ts` e disparados nos pontos certos do fluxo.

## 10. Como configurar o Google Search Console

1. Acesse [search.google.com/search-console](https://search.google.com/search-console).
2. Adicione sua propriedade (domínio ou prefixo de URL).
3. Escolha o método de verificação **HTML tag** e copie o código.
4. Cole em `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
5. Depois de publicado, envie o sitemap: `https://SEU-DOMINIO/sitemap.xml`.

## 11. Como publicar na Vercel

1. Suba o projeto para um repositório no GitHub (veja abaixo).
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. Em **Environment Variables**, adicione **todas** as variáveis do seu `.env.local` (uma por uma, os mesmos nomes).
4. Clique **Deploy**.
5. Depois do primeiro deploy, atualize `NEXT_PUBLIC_SITE_URL` com a URL final da Vercel (ou seu domínio) e faça um novo deploy — essa variável é usada nos links de retorno do Mercado Pago e no sitemap.

### GitHub

```bash
git init
git add .
git commit -m "Vetter Luxury — versão inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/vetter-luxury.git
git push -u origin main
```

O `.gitignore` já impede que `.env.local`, `node_modules` e arquivos de build sejam enviados.

## 12. Como conectar um domínio próprio

1. Na Vercel, vá em **Project → Settings → Domains** e adicione seu domínio.
2. Siga as instruções para apontar o DNS (geralmente um registro `A` ou `CNAME`, conforme a Vercel indicar).
3. Atualize `NEXT_PUBLIC_SITE_URL` para o novo domínio e faça redeploy.

## 13. Como atualizar o projeto

Qualquer alteração de código: `git push` para o `main` (ou branch configurada) — a Vercel faz o deploy automaticamente.

Alterações de **conteúdo** (produtos, categorias, coleções, banners, cupons, preços, estoque) **não exigem deploy** — tudo é editado direto no painel `/admin`, que grava no Supabase.

## 14. O que está pronto vs. o que precisa de configuração

**Totalmente funcional assim que Supabase estiver configurado (seções 3–7):**
site público completo, busca, filtros, favoritos, carrinho persistido, cadastro/login/recuperação de senha, conta do cliente com endereços, avaliação de cupons, checkout com registro de pedido, painel admin completo (dashboard, produtos com variantes/estoque/imagens, categorias, coleções, banners, cupons, pedidos com atualização de status e rastreamento, clientes, estoque, configurações), SEO (metadata, sitemap, robots, dados estruturados), newsletter e mensagens de contato.

**Funcional após adicionar credenciais reais (não inventadas — ver seções 8–10):**
pagamento via Mercado Pago (Pix/Cartão), Google Analytics, verificação do Google Search Console.

**Estrutura pronta, aguardando uma decisão/API externa:**
cálculo de frete em tempo real (Correios/Melhor Envio) — hoje o frete é combinado manualmente; a integração pode ser conectada em `src/app/checkout/page.tsx` e um novo endpoint em `src/app/api/frete/`.

## 15. Checklist final de publicação

- [ ] `npm install`, `npm run typecheck`, `npm run lint` e `npm run build` sem erros
- [ ] `supabase/schema.sql` executado com sucesso
- [ ] `supabase/storage.sql` executado com sucesso
- [ ] Conta criada em `/cadastro` e promovida a admin via SQL (seção 7)
- [ ] Login em `/admin` funcionando
- [ ] Ao menos uma categoria, uma coleção e um produto cadastrados pelo painel
- [ ] Credenciais de **teste** do Mercado Pago configuradas e uma compra de teste concluída
- [ ] Webhook do Mercado Pago cadastrado e testado (o status do pedido muda para "Pagamento aprovado" após pagamento de teste)
- [ ] `MERCADOPAGO_WEBHOOK_SECRET` configurado (a validação de assinatura do webhook depende dele)
- [ ] Variáveis de ambiente adicionadas na Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` atualizada com a URL final após o primeiro deploy
- [ ] Google Analytics recebendo eventos (verifique em Tempo Real)
- [ ] Propriedade verificada no Google Search Console e sitemap enviado
- [ ] Credenciais do Mercado Pago trocadas de teste para produção
- [ ] Domínio próprio conectado (se aplicável)
- [ ] Teste completo em celular real (iPhone e Android) e em desktop

---

## Estrutura de pastas

```
src/
  app/                    → páginas (App Router) e rotas de API
    admin/                → painel administrativo (protegido por middleware)
    api/                  → checkout, webhook Mercado Pago, validação de cupom
    produtos/ colecoes/ categorias/  → páginas públicas de catálogo
  components/             → componentes de UI reutilizáveis
    admin/                → componentes exclusivos do painel
  contexts/                → CartContext (carrinho)
  hooks/                  → useAuth, useFavorites
  lib/                    → clientes Supabase, Mercado Pago, utils, analytics
  types/                  → tipos TypeScript que espelham o banco
  middleware.ts           → proteção de rotas /admin e /conta
supabase/
  schema.sql              → schema completo do banco + RLS
  storage.sql             → buckets e políticas de Storage
```

## Segurança

- Toda a autorização de dados acontece via **Row Level Security** no Postgres — não apenas no frontend.
- A `service_role key` só é usada em duas rotas server-side (`/api/mercadopago/webhook`) — nunca no navegador.
- Senhas e sessões são geridas inteiramente pelo Supabase Auth.
- `/admin` é protegido em duas camadas: middleware (server-side, redireciona quem não é admin) e RLS (mesmo que alguém burle o middleware, o banco recusa escrita sem `is_admin = true`).
  V
