import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {
  loadCacheFromDisk,
  syncAllProductsFromNuvemshop,
  queryProducts,
  getProductById,
  getAllProductsList,
  getCategoriesSummary,
} from './Server/nuvemshop-store.js';

function nuvemshopDevPlugin() {
  return {
    name: 'nuvemshop-dev-server',
    configureServer(server) {
      // Load cache and trigger background sync on Vite start
      const hasCache = loadCacheFromDisk();
      if (!hasCache) {
        syncAllProductsFromNuvemshop();
      } else {
        syncAllProductsFromNuvemshop();
      }

      server.middlewares.use('/api/nuvemshop/products', (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const idMatch = url.pathname.match(/^\/(\d+)/);
        if (idMatch) {
          const product = getProductById(idMatch[1]);
          if (product) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(product));
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Produto não encontrado' }));
          }
        }

        const search = url.searchParams.get('search') || '';
        const category = url.searchParams.get('category') || '';
        const page = url.searchParams.get('page') || '1';
        const limit = url.searchParams.get('limit') || '50';
        const all = url.searchParams.get('all') === 'true' || limit === '-1';

        if (all) {
          const allItems = getAllProductsList();
          let filtered = allItems;
          if (category && category !== 'Todos') {
            filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
          }
          if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
          }
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(filtered));
        }

        const result = queryProducts({ search, category, page, limit });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      });

      server.middlewares.use('/api/nuvemshop/categories', (req, res) => {
        const summary = getCategoriesSummary();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(summary));
      });

      server.middlewares.use('/api/nuvemshop/sync', async (req, res) => {
        const products = await syncAllProductsFromNuvemshop();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, count: products.length }));
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    nuvemshopDevPlugin()
  ],
  server: {
    port: 5173,
    proxy: {
      // Fallback if standalone server is active
      '/api/nuvemshop-ext': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nuvemshop-ext/, '/api/nuvemshop'),
      },
    },
  },
});