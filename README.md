# NYPARFUM

Site da NYPARFUM (Nay Parfum) — perfumaria em Corumbá - MS.

## Estrutura

- `index.html` — página com duas abas: **Maison** (início) e **Catálogo**
- `assets/css/style.css` — estilos e animações
- `assets/js/main.js` — interações (abas, sacola, modal, animações)
- `assets/js/catalogo.js` — **lista de produtos do catálogo** (edite aqui)
- `assets/img/` — fotos

## Como adicionar ou editar perfumes

Abra `assets/js/catalogo.js`, copie um bloco `{ ... }` da lista `NY_PRODUTOS`
e edite nome, marca, coleções, volume, preço (ou `null` para "Consulte o valor")
e foto. As instruções de cada campo estão no topo do arquivo.

A sacola do site monta o pedido e envia pelo WhatsApp (67) 99828-7393.
