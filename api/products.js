import { securityHeaders, corsHeaders, checkServerRateLimit, validateOrigin, auditLog } from './middleware/security.js';

let cachedProducts = null;
let cacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000;

export default async function handler(req, res) {
  securityHeaders(res);
  corsHeaders(res, req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!validateOrigin(req)) {
    auditLog('BLOCKED_ORIGIN', { origin: req.headers.origin });
    return res.status(403).json({ error: 'Origem nao autorizada' });
  }

  const rateLimit = checkServerRateLimit(req, '/api/products');
  if (!rateLimit.allowed) {
    auditLog('RATE_LIMITED', { ip: req.headers['x-forwarded-for'] });
    return res.status(429).json({ error: 'Muitas requisicoes' });
  }

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  if (cachedProducts && (Date.now() - cacheTime) < CACHE_DURATION) {
    console.log('[API] Retornando cache');
    return res.status(200).json(cachedProducts);
  }

  const STORE_ID = process.env.NUVEMSHOP_STORE_ID || '6416066';
  const ACCESS_TOKEN = process.env.NUVEMSHOP_ACCESS_TOKEN;
  const USER_AGENT = 'PontoDoBorracheiro (contato@pontodoborracheiro.com.br)';

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Token nao configurado' });
  }

  function detectCategory(name, nuvemshopCategories) {
    const CATEGORY_MAP = {
      'PNEUS': 'Pneus',
      'PNEU': 'Pneus',
      'CAMARA DE AR': 'Cameras de Ar',
      'CAMARAS DE AR': 'Cameras de Ar',
      'CAMERA DE AR': 'Cameras de Ar',
      'MANGUEIRA': 'Mangueiras',
      'MANGUEIRAS': 'Mangueiras',
      'KIT': 'Kits',
      'KITS': 'Kits',
      'COLA': 'Colas e Remendos',
      'COLAS': 'Colas e Remendos',
      'REMENDO': 'Colas e Remendos',
      'REMENDOS': 'Colas e Remendos',
      'FERRAMENTA': 'Ferramentas',
      'FERRAMENTAS': 'Ferramentas',
      'BICO': 'Bicos e Valvulas',
      'BICOS': 'Bicos e Valvulas',
      'VALVULA': 'Bicos e Valvulas',
      'VALVULAS': 'Bicos e Valvulas',
      'ACESSORIO': 'Acessorios para Borracharia',
      'ACESSORIOS': 'Acessorios para Borracharia',
      'BORRACHARIA': 'Acessorios para Borracharia',
      'AUTOMACAO': 'Automacao',
      'ABRACADEIRA': 'Acessorios para Borracharia',
      'ABRACADEIRAS': 'Acessorios para Borracharia',
    };

    if (Array.isArray(nuvemshopCategories)) {
      for (const cat of nuvemshopCategories) {
        const catName = (cat?.name?.pt || cat?.name || '').trim().toUpperCase();
        if (CATEGORY_MAP[catName]) {
          return CATEGORY_MAP[catName];
        }
        for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
          if (catName === keyword || catName.startsWith(keyword + ' ') || catName.endsWith(' ' + keyword) || catName.includes(' ' + keyword + ' ')) {
            return category;
          }
        }
      }
    }

    const upper = (name || '').toUpperCase();
    if (/\bPNEU[S]?\b/.test(upper)) return 'Pneus';
    if (/\bCAMARA[S]?\s+DE\s+AR\b/.test(upper)) return 'Cameras de Ar';
    if (/\bMANGUEIRA[S]?\b/.test(upper) || /\bCABELINHO\b/.test(upper) || /\bTUBO\s+PU\b/.test(upper) || /\bESPIRAL\b/.test(upper)) return 'Mangueiras';
    if (/\bKIT[S]?\b/.test(upper) || /\bESTOJO\b/.test(upper)) return 'Kits';
    if (/\bCOLA[S]?\b/.test(upper) || /\bREMENDO[S]?\b/.test(upper) || /\bVULCAFLEX\b/.test(upper)) return 'Colas e Remendos';
    if (/\bCHAVE\b/.test(upper) || /\bCALIBRADOR\b/.test(upper) || /\bALICATE\b/.test(upper) || /\bPISTOLA\b/.test(upper) || /\bTORQUIMETRO\b/.test(upper) || /\bFERRAMENTA[S]?\b/.test(upper)) return 'Ferramentas';
    if (/\bBICO[S]?\b/.test(upper) || /\bVALVULA[S]?\b/.test(upper)) return 'Bicos e Valvulas';
    if (/\bAUTOMACAO\b/.test(upper) || /\bSENSOR\b/.test(upper)) return 'Automacao';
    if (/\bABRACADEIRA[S]?\b/.test(upper) || /\bENGATE\b/.test(upper) || /\bADAPTADOR\b/.test(upper) || /\bNIPLE\b/.test(upper)) return 'Acessorios para Borracharia';
    return 'Acessorios para Borracharia';
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
    console.log('[API] Buscando produtos da Nuvemshop...');
    const startTime = Date.now();
    let page = 1;
    const allProducts = [];

    const fetchPage = async (p) => {
      const url = 'https://api.nuvemshop.com.br/v1/' + STORE_ID + '/products?per_page=200&page=' + p;
      const response = await fetch(url, { headers: { 'Authentication': 'bearer ' + ACCESS_TOKEN, 'User-Agent': USER_AGENT } });
      if (!response.ok) throw new Error('Erro na pagina ' + p + ': ' + response.status);
      return response.json();
    };

    const firstPage = await fetchPage(1);
    if (!Array.isArray(firstPage) || firstPage.length === 0) {
      return res.status(200).json([]);
    }

    for (const item of firstPage) allProducts.push(normalizeProduct(item));

    const totalPages = Math.ceil(3600 / 200);

    for (let batch = 2; batch <= totalPages + 2; batch += 5) {
      const pages = [];
      for (let i = batch; i < batch + 5; i++) {
        pages.push(i);
      }

      const results = await Promise.allSettled(pages.map(p => fetchPage(p)));

      let hasMore = false;
      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value) && result.value.length > 0) {
          for (const item of result.value) allProducts.push(normalizeProduct(item));
          hasMore = true;
        }
      }

      if (!hasMore) break;
    }

    const categoryCount = {};
    allProducts.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    console.log('[API] Categorias:', JSON.stringify(categoryCount));

    const elapsed = Date.now() - startTime;
    console.log('[API] ' + allProducts.length + ' produtos carregados em ' + elapsed + 'ms');

    cachedProducts = allProducts;
    cacheTime = Date.now();

    auditLog('PRODUCTS_LOADED', { count: allProducts.length, elapsed });

    return res.status(200).json(allProducts);
  } catch (error) {
    console.error('[API] Erro:', error.message);
    auditLog('PRODUCTS_ERROR', { error: error.message });
    if (cachedProducts) return res.status(200).json(cachedProducts);
    return res.status(500).json({ error: error.message });
  }
}