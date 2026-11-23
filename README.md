# 🍊 Cardápio Kids

Planejador de cardápio infantil com receitas adaptadas, lista de compras automática e jogos — feito para a criança participar.

## O que tem

- **Cardápio de 7 ou 14 dias** com 5 refeições por dia, botão **⭐ Comi!** em cada refeição e selo de **Dia Perfeito**.
- **Estrelas, níveis e conquistas** (Sementinha → Lenda dos Sabores), com sons, vibração e confete.
- **Missão Arco-Íris**: acende uma fruta a cada fruta diferente que a criança come.
- **42 receitas** em 6 categorias, com favoritas, “a criança pode ajudar” e **Modo Cozinheira** passo a passo.
- **Guia de Mercado** com dicas de rótulo.
- **Diversão**: quiz *Verdade ou Mito*, **Passaporte das Frutas** (com frutas do Nordeste) e mural de conquistas.
- **Lista de compras** por setor, com progresso, envio pelo WhatsApp, cópia e impressão.
- Nome, bichinho e títulos personalizáveis; backup e restauração em arquivo.
- Funciona **offline** e pode ser **instalado no celular** (PWA).

Os dados ficam só no aparelho (localStorage). Use “Salvar backup” nas configurações para levar para outro celular.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `cardapio-kids`).
2. Envie **todos os arquivos desta pasta** para a raiz do repositório (inclusive a pasta `icons/` e o arquivo `.nojekyll`).
3. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, pasta `/ (root)` → **Save**.
4. Em 1–2 minutos o site estará em `https://SEU-USUARIO.github.io/cardapio-kids/`.

No celular, abra o link e use **“Adicionar à tela de início”** para virar um app.

### Ao atualizar o site

Edite `sw.js` e aumente o número em `const CACHE = 'cardapio-kids-v2.0.0'` (ex.: `v2.0.1`). Assim os celulares baixam a versão nova.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Estrutura das telas e modais |
| `styles.css` | Visual, animações, responsivo e impressão |
| `data.js` | Receitas, frutas, bebidas, mercado, quiz, níveis e conquistas |
| `app.js` | Toda a lógica (cardápio, estrelas, jogos, compras, sons, confete) |
| `manifest.webmanifest`, `sw.js`, `icons/` | Instalação como app e modo offline |

Para adicionar uma receita, copie um bloco `rec({...})` em `data.js` e troque os campos. O `id` precisa ser único.

---
As sugestões são gerais e não substituem a orientação do pediatra ou nutricionista.
