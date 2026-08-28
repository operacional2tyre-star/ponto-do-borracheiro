const API_URL = '/api';

const mockProducts = [
  { id: 1, name: 'Carregando produtos...', price: 0, pricePix: 0, image: '', images: [], category: 'Acessórios', stock: 0, freeShipping: false, isTop: false, description: '', sku: '' },
];

const categories = ['Todos', 'Pneus', 'Câmaras de Ar', 'Mangueiras', 'Kits', 'Colas e Remendos', 'Ferramentas', 'Bicos e Válvulas', 'Acessórios para Borracharia', 'Automação'];

// Cache local no navegador
let localCache = null;
let localCacheTime = 0;
const LOCAL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export async function getProducts(options = {}) {
  try {
    // Retorna do cache local se válido
    if (localCache && (Date.now() - localCacheTime) < LOCAL_CACHE_DURATION) {
      let result = localCache;
      if (options.category && options.category !== 'Todos') {
        result = result.filter(p => p.category.toLowerCase() === options.category.toLowerCase());
      }
      if (options.search && options.search.trim()) {
        const s = options.search.trim().toLowerCase();
        result = result.filter(p =>
          p.name.toLowerCase().includes(s) ||
          (p.sku || '').toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s)
        );
      }
      return result;
    }

    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error(`Erro na API (${response.status})`);

    const data = await response.json();
    const rawList = Array.isArray(data) ? data : (data.products || []);

    if (rawList.length === 0) {
      return mockProducts;
    }

    // Salva no cache local
    localCache = rawList;
    localCacheTime = Date.now();

    let result = rawList;

    if (options.category && options.category !== 'Todos') {
      result = result.filter(p => p.category.toLowerCase() === options.category.toLowerCase());
    }
    if (options.search && options.search.trim()) {
      const s = options.search.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(s) ||
        (p.sku || '').toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
      );
    }

    return result;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return mockProducts;
  }
}

export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_URL}/product?id=${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn(`Erro ao buscar produto #${id}, buscando na lista...`);
  }

  const products = await getProducts();
  return products.find(p => String(p.id) === String(id));
}

export async function getCategoriesSummary() {
  return [];
}

export { mockProducts, categories };
export const fetchProductsFromAPI = getProducts;