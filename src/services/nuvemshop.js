const API_URL = '/api';

const mockProducts = [
  {
    id: 1,
    name: '1 METRO DE MANGUEIRA PNEUMÁTICA DE POLIURETANO (PU) 8MM',
    price: 13.00,
    pricePix: 12.61,
    image: '',
    images: [],
    category: 'Mangueiras',
    stock: 45,
    freeShipping: true,
    isTop: true,
    description: 'Mangueira de poliuretano (PU) de alta resistência.',
    sku: 'MANG-PU-08MM'
  },
  {
    id: 2,
    name: 'PNEU ROADWELL 480.400-8 4 LONAS INDUSTRIAL',
    price: 255.00,
    pricePix: 247.35,
    image: '',
    images: [],
    category: 'Pneus',
    stock: 12,
    freeShipping: true,
    isTop: true,
    description: 'Pneu para empilhadeira e equipamentos industriais.',
    sku: 'PNEU-RW-480'
  },
];

const categories = ['Todos', 'Pneus', 'Câmaras de Ar', 'Mangueiras', 'Kits', 'Colas e Remendos', 'Ferramentas', 'Bicos e Válvulas', 'Acessórios para Borracharia', 'Automação'];

export async function getProducts(options = {}) {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error(`Erro na API (${response.status})`);

    const data = await response.json();
    const rawList = Array.isArray(data) ? data : (data.products || []);

    if (rawList.length === 0) {
      return mockProducts;
    }

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