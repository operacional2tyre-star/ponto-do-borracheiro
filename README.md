# 🛒 Ponto do Borracheiro

App mobile estilo e-commerce para borracharia, integrado com NuvemShop.

## 🚀 Como rodar

```bash
# 1. Instalar dependências
cd ponto-do-borracheiro
npm install

# 2. Rodar o dev server
npm run dev
```

O app vai abrir em http://localhost:3000

## 🔧 Configurar API da NuvemShop

Edite `src/services/nuvemshop.js` e coloque sua API Key:

```js
const API_KEY = 'sua-api-key-aqui';
```

Sem a API Key, o app usa dados mockados.

## 📱 Features

- ✅ Home com grid de produtos
- ✅ Busca e filtros por categoria
- ✅ Detalhes do produto
- ✅ Carrinho de compras
- ✅ Chat integrado com vendedor
- ✅ Perfil do usuário
- ✅ Design responsivo (mobile-first)
- ✅ PWA - instala sem App Store
- ✅ Integração com API da NuvemShop
- ✅ Preços com desconto no Pix

## 📦 Build para produção

```bash
npm run build
```

## 🎨 Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

---
Feito com 💜 por Larissa & equipe
