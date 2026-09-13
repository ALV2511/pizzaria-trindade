# Pizzaria Trindade — site de exemplo

Site de demonstração para uma pizzaria fictícia, feito em **HTML, CSS e
JavaScript puros** (sem frameworks, sem build, sem backend).

## Como abrir

Não precisa instalar nada. Duas formas de rodar:

1. **Direto no navegador**: dê duplo clique em `index.html`.
2. **Com um servidor local** (recomendado, evita alguns bloqueios de
   navegador com `file://`):
   ```
   cd pizzaria-trindade
   python3 -m http.server 8000
   ```
   Depois abra `http://localhost:8000` no navegador.

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Página inicial — hero, "como funciona" e teaser dos destaques |
| `destaques.html` | Destaques da semana (produtos marcados como destaque) |
| `login.html` | Login |
| `cadastro.html` | Criação de conta de cliente |
| `pedido.html` | Cardápio completo + carrinho — **exige login** |
| `admin.html` | Painel do dono: cadastrar/excluir produtos e ver pedidos — **exige login como admin** |

## Login de teste

- **Dono da pizzaria (admin):** `admin@trindade.com` / `admin123`
- **Cliente:** crie uma conta pela página de cadastro

## Como os dados são guardados

Este é um projeto **100% front-end**, sem servidor nem banco de dados
de verdade. Para simular persistência entre as páginas (login,
cardápio, pedidos), os dados ficam salvos no **localStorage do
navegador** (arquivo `js/db.js`).

Isso significa, na prática:

- Os dados ficam salvos **só naquele navegador**, no seu computador.
  Se abrir em outro navegador ou computador, começa vazio de novo.
- Limpar o cache/dados do site apaga tudo.
- As senhas são guardadas **em texto puro**, sem nenhuma criptografia
  — é só para fins de demonstração. **Não use senhas reais.**
- Não há nenhuma validação no servidor (porque não há servidor):
  qualquer pessoa com conhecimento técnico poderia alterar os dados
  pelo DevTools do navegador.

**Para um site real de produção**, seria necessário um backend de
verdade (servidor + banco de dados) com senhas criptografadas (hash),
validações no servidor, e proteção contra alteração de dados pelo
cliente. Este projeto serve como exemplo funcional de interface e
fluxo, não como sistema pronto para produção.

## Estrutura de arquivos

```
pizzaria-trindade/
├── index.html
├── destaques.html
├── login.html
├── cadastro.html
├── pedido.html
├── admin.html
├── css/
│   └── style.css
└── js/
    ├── db.js       — "banco de dados" via localStorage
    ├── nav.js       — cabeçalho, rodapé e proteção de rotas
    ├── icons.js     — ícone de pizza em SVG
    ├── pedido.js    — lógica do cardápio e carrinho
    └── admin.js     — lógica do painel do dono
```

## Personalização rápida

- **Cores e fontes**: tudo centralizado em `css/style.css`, nas
  variáveis do `:root` no topo do arquivo.
- **Cardápio inicial**: editar a lista `products` dentro da função
  `seedIfNeeded()` em `js/db.js`.
- **Endereço/horário no rodapé**: `js/nav.js`, função `renderFooter()`.
# pizzaria-trindade
