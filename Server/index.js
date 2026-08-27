import express from 'express';
import dotenv from 'dotenv';
import {
  loadCacheFromDisk,
  syncAllProductsFromNuvemshop,
  queryProducts,
  getProductById,
  getAllProductsList,
  getCategoriesSummary,
} from './nuvemshop-store.js';

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 1. Get products (with full pagination, search & category filters)
app.get('/api/nuvemshop/products', async (req, res) => {
  try {
    const { search, category, page, limit, all } = req.query;

    // If client requested 'all=true' or limit=-1, return flat array of all products
    if (all === 'true' || limit === '-1') {
      const allItems = getAllProductsList();
      if (allItems.length > 0) {
        let filtered = allItems;
        if (category && category !== 'Todos') {
          filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
        }
        return res.json(filtered);
      }
    }

    const result = queryProducts({ search, category, page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos', message: err.message });
  }
});

// 2. Get single product by ID
app.get('/api/nuvemshop/products/:id', (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto', message: err.message });
  }
});

// 3. Get categories summary with counts
app.get('/api/nuvemshop/categories', (req, res) => {
  try {
    const summary = getCategoriesSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias', message: err.message });
  }
});

// 4. Force sync endpoint
app.post('/api/nuvemshop/sync', async (req, res) => {
  try {
    const products = await syncAllProductsFromNuvemshop();
    res.json({ success: true, count: products.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao sincronizar', message: err.message });
  }
});

const PORT = process.env.PORT || 3001;

// Initialize on startup
(async () => {
  const hasCache = loadCacheFromDisk();
  if (!hasCache) {
    console.log('[Nuvemshop] Nenhum cache em disco encontrado. Baixando catálogo completo...');
    syncAllProductsFromNuvemshop();
  } else {
    console.log('[Nuvemshop] Cache carregado! Atualizando em segundo plano...');
    syncAllProductsFromNuvemshop();
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Nuvemshop rodando na porta ${PORT}`);
  });
})();