let cachedProducts = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Retorna do cache se ainda válido
  if (cachedProducts && (Date.now() - cacheTime) < CACHE_DURATION) {
    return res.status(200).json(cachedProducts);
  }

  const STORE_ID = process.env.NUVEMSHOP_STORE_ID || '6416066';
  const ACCESS_TOKEN = process.env.NUVEMSHOP_ACCESS_TOKEN;
  const USER_AGENT = 'PontoDoBorracheiro (contato@pontodoborracheiro.com.br)';

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Token não configurado' });
  }

  function detectCategory(name, nuvemshopCategories) {
    if (Array.isArray(nuvemshopCategories) && nuvemshopCategories.length > 0) {
      const rawName = (nuvemshopCategories[0]?.name?.pt || nuvemshopCategories[0]?.name || '').trim().toUpperCase();
      if (rawName.includes('PNEU')) return 'Pneus';
      if (rawName.includes('CAMARA') || rawName.includes('CÂMARA')) return 'Câmaras de Ar';
      if (rawName.includes('MANGUEIRA')) return 'Mangueiras';
      if (rawName.includes('KIT')) return 'Kits';
      if (rawName.includes('COLA') || rawName.includes('REMENDO')) return 'Colas e Remendos';
      if (rawName.includes('FERRAMENTA')) return 'Ferramentas';
      if (rawName.includes('ACESSORIO') || rawName.includes('ACESSÓRIO') || rawName.includes('BORRACHARIA')) return 'Acessórios para Borracharia';
      if (rawName.includes('AUTOMACAO') || rawName.includes('AUTOMAÇÃO')) return 'Automação';
      if (rawName.includes('BICO') || rawName.includes('VALVULA') || rawName.includes('VÁLVULA')) return 'Bicos e Válvulas';
      if (rawName.length > 0) return rawName;
    }
    const upper = (name || '').toUpperCase();
    if (upper.includes('PNEU')) return 'Pneus';
    if (upper.includes('CAMARA') || upper.includes('CÂMARA')) return 'Câmaras de Ar';
    if (upper.includes('MANGUEIRA') || upper.includes('CABELINHO') || upper.includes('TUBO PU') || upper.includes('ESPIRAL')) return 'Mangueiras';
    if (upper.includes('KIT') || upper.includes('ESTOJO')) return 'Kits';
    if (upper.includes('COLA') || upper.includes('REMENDO') || upper.includes('VULCAFLEX')) return 'Colas e Remendos';
    if (upper.includes('CHAVE') || upper.includes('CALIBRADOR') || upper.includes('ALICATE') || upper.includes('PISTOLA') || upper.includes('TORQUIMETRO') || upper.includes('FERRAMENTA')) return 'Ferramentas';
    if (upper.includes('BICO') || upper.includes('VALVULA') || upper.includes('VÁLVULA')) return 'Bicos e Válvulas';
    if (upper.includes('AUTOMACAO') || upper.includes('AUTOMAÇÃO') || upper.includes('SENSOR')) return 'Automação';
    if (upper.includes('ABRACADEIRA') || upper.includes('ABRAÇADEIRA') || upper.includes('ENGATE') || upper.includes('ADAPTADOR') || upper.includes('NIPLE')) return 'Acessórios para Borracharia';
    return 'Acessórios para Borracharia';
  }

  function getName(p) {
    if (!p.name) return '';
    if (typeof p.name === 'string') return p.name;
    if (typeof p.name === 'object') return p.name.pt || p.name.en || '';
    return '';
  }

  function getDescription(p) {
    if (!p.description) return '';
    if (typeof p.description === 'string') return p.description;
    if (typeof p.description === 'object') return p.description.pt || p.description.en || '';
    return '';
  }

  function normalizeProduct(p) {
    const name = getName(p).trim();
    const price = parseFloat(p.variants?.[0]?.price || 0);
    const images = (p.images || []).map(i => i.src).filter(Boolean);
    const image = images[0] || '';
    const category = detectCategory(name, p.categories);
    const stock = parseInt(p.variants?.[0]?.stock || 0, 10);
    const sku = (p.variants?.[0]?.sku || '').toString();
    return { id: p.id, name, price, pricePix: Number((price * 0.97).toFixed(2)), image, images, category, stock, freeShipping: Boolean(p.free_shipping), description: getDescription(p), sku, isTop: stock > 100 };
  }

  try {
    let page = 1;
    const allProducts = [];
    while (true) {
      const url = `https://api.nuvemshop.com.br/v1/${STORE_ID}/products?per_page=200&page=${page}`;
      const response = await fetch(url, { headers: { 'Authentication': `bearer ${ACCESS_TOKEN}`, 'User-Agent': USER_AGENT } });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) break;
      for (const item of data) allProducts.push(normalizeProduct(item));
      if (data.length < 200) break;
      page++;
    }

    // Salva no cache
    cachedProducts = allProducts;
    cacheTime = Date.now();

    return res.status(200).json(allProducts);
  } catch (error) {
    console.error('[API] Erro:', error.message);
    // Se tem cache antigo, retorna ele
    if (cachedProducts) return res.status(200).json(cachedProducts);
    return res.status(500).json({ error: error.message });
  }
}