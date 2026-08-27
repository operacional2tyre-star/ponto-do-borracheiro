const API_URL = '/api/nuvemshop';

// Dados de exemplo para fallback offline
const mockProducts = [
  {
    id: 1,
    name: '1 METRO DE MANGUEIRA PNEUMÁTICA DE POLIURETANO (PU) 8MM',
    price: 13.00,
    pricePix: 12.61,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop'],
    category: 'Mangueiras',
    stock: 45,
    freeShipping: true,
    isTop: true,
    description: 'Mangueira de poliuretano (PU) de alta resistência, ideal para ar comprimido e fluidos industriais.',
    sku: 'MANG-PU-08MM'
  },
  {
    id: 2,
    name: '1 METRO ROLO DE CABELINHO DO FINO BRANCO P/ REPARO',
    price: 14.90,
    pricePix: 14.45,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop'],
    category: 'Mangueiras',
    stock: 35,
    freeShipping: true,
    isTop: false,
    description: 'Rolo de cordão/cabelinho fino para reparo e vedação de alta precisão em borracharias.',
    sku: 'ROLO-CAB-01'
  },
  {
    id: 3,
    name: 'ABRACADEIRA FITA DE ACO DE 8 A 12 MM',
    price: 3.85,
    pricePix: 3.72,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d6810?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d6810?w=400&h=400&fit=crop'],
    category: 'Abraçadeiras',
    stock: 120,
    freeShipping: false,
    isTop: false,
    description: 'Abraçadeira tipo fita fabricada em aço carbono/inoxidável com alta pressão de aperto de 8 a 12mm.',
    sku: 'ABRAC-ACO-8-12'
  },
  {
    id: 4,
    name: 'ADAPTADOR 5 X 4 4 X130 OU 131 - 4 X 130',
    price: 0.00,
    pricePix: 0.00,
    image: '',
    images: [],
    category: 'Conexões',
    stock: 10,
    freeShipping: false,
    isTop: false,
    description: 'Adaptador de roda/furação 5x4 4x130 ou 131 - 4x130 usinado em alta precisão.',
    sku: 'ADAPT-5X4-130'
  },
  {
    id: 5,
    name: 'PNEU ROADWELL 480.400-8 4 LONAS INDUSTRIAL',
    price: 255.00,
    pricePix: 247.35,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&h=400&fit=crop'],
    category: 'Pneus',
    stock: 12,
    freeShipping: true,
    isTop: true,
    description: 'Pneu para empilhadeira e equipamentos industriais. 4 lonas de alta resistência.',
    sku: 'PNEU-RW-480'
  },
  {
    id: 6,
    name: 'KIT COMPLETO DE REPAROS RÁPIDOS VULCAFLEX',
    price: 89.90,
    pricePix: 87.20,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=400&fit=crop'],
    category: 'Kits',
    stock: 23,
    freeShipping: true,
    isTop: false,
    description: 'Kit completo com 50 remendos, lixa, cola vulcanizante e aplicador reforçado.',
    sku: 'KIT-REP-01'
  },
  {
    id: 7,
    name: 'ENGATE RÁPIDO AR 1/4" ROSCA 1/2 BSP',
    price: 27.90,
    pricePix: 27.06,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop'],
    category: 'Conexões',
    stock: 28,
    freeShipping: true,
    isTop: false,
    description: 'Engate rápido para ar comprimido com rosca 1/2 BSP. Aço inoxidável com vedação em nylon.',
    sku: 'ENG-AR-14'
  },
  {
    id: 8,
    name: 'PNEU INDUSTRIAL REFORÇADO 15X6.00-8 CARGA',
    price: 189.00,
    pricePix: 184.23,
    image: 'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=400&h=400&fit=crop'],
    category: 'Pneus',
    stock: 8,
    freeShipping: true,
    isTop: false,
    description: 'Pneu industrial para carrinhos de transporte e carga. Alta durabilidade e tração.',
    sku: 'PNEU-IND-15'
  }
];

const categories = ['Todos', 'Pneus', 'Mangueiras', 'Conexões', 'Kits', 'Abraçadeiras', 'Acessórios', 'Ferramentas'];

// Normaliza produtos
function normalizeItem(product) {
  if (product.pricePix !== undefined && typeof product.name === 'string') {
    return {
      ...product,
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : [])
    };
  }

  const name = product.name?.pt || product.name || '';
  const price = parseFloat(product.variants?.[0]?.price || product.price || 0);
  const images = (product.images || []).map(i => typeof i === 'string' ? i : i.src).filter(Boolean);
  const image = images[0] || product.image || '';
  const category = product.categories?.[0]?.name?.pt || product.category || 'Acessórios';
  const stock = parseInt(product.variants?.[0]?.stock ?? product.stock ?? 0, 10);
  const sku = (product.variants?.[0]?.sku || product.sku || '').toString();

  return {
    id: product.id,
    name,
    price,
    pricePix: Number((price * 0.97).toFixed(2)),
    image,
    images,
    category,
    stock,
    freeShipping: Boolean(product.free_shipping || product.freeShipping),
    description: product.description?.pt || product.description || '',
    sku,
    isTop: Boolean(product.isTop || stock > 100),
  };
}

// Busca produtos da API com suporte a filtros, busca e paginação
export async function getProducts(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.category && options.category !== 'Todos') params.set('category', options.category);
    if (options.search) params.set('search', options.search);
    if (options.page) params.set('page', options.page);
    if (options.limit) params.set('limit', options.limit);
    else params.set('limit', '-1'); // Retorna todos os itens do catálogo por padrão

    const url = `${API_URL}/products?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na API (${response.status})`);

    const data = await response.json();
    const rawList = Array.isArray(data) ? data : (data.products || []);

    if (rawList.length === 0 && !options.search && !options.category) {
      return mockProducts;
    }

    return rawList.map(normalizeItem);
  } catch (error) {
    console.error('Erro ao buscar produtos da Nuvemshop:', error);
    // Filtragem no mock offline caso a API esteja indisponível
    let filtered = mockProducts;
    if (options.category && options.category !== 'Todos') {
      filtered = filtered.filter(p => p.category.toLowerCase() === options.category.toLowerCase());
    }
    if (options.search && options.search.trim()) {
      const s = options.search.trim().toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s));
    }
    return filtered;
  }
}

// Busca produto por ID
export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (response.ok) {
      const data = await response.json();
      return normalizeItem(data);
    }
  } catch (err) {
    console.warn(`[Nuvemshop] Erro ao buscar produto #${id} direto, buscando na lista...`);
  }

  const products = await getProducts();
  return products.find(p => String(p.id) === String(id));
}

// Busca categorias com contagem em tempo real
export async function getCategoriesSummary() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('[Nuvemshop] Erro ao buscar resumo de categorias');
  }
  return [];
}

export { mockProducts, categories };
export const fetchProductsFromAPI = getProducts;