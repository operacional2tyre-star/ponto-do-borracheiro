import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_ID = process.env.NUVEMSHOP_STORE_ID || '6416066';
const ACCESS_TOKEN = process.env.NUVEMSHOP_ACCESS_TOKEN || '';
const USER_AGENT = 'PontoDoBorracheiro (contato@pontodoborracheiro.com.br)';

const CACHE_DIR = path.join(__dirname, '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'products.json');

let memoryProducts = [];
let isFetching = false;
let lastSyncTime = null;

// Mapeamento exato das categorias do Nuvemshop
function detectCategory(name, nuvemshopCategories) {
  if (Array.isArray(nuvemshopCategories) && nuvemshopCategories.length > 0) {
    const rawName = (
      nuvemshopCategories[0]?.name?.pt ||
      nuvemshopCategories[0]?.name ||
      ''
    ).trim().toUpperCase();

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

  // Fallback pelo nome do produto
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

function getDescription(p) {
  if (!p.description) return '';
  if (typeof p.description === 'string') return p.description;
  if (typeof p.description === 'object') return p.description.pt || p.description.en || '';
  return '';
}

function getName(p) {
  if (!p.name) return '';
  if (typeof p.name === 'string') return p.name;
  if (typeof p.name === 'object') return p.name.pt || p.name.en || '';
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
  const isTop = stock > 100 || (images.length > 0 && price > 0 && price < 300);

  return {
    id: p.id,
    name,
    price,
    pricePix: Number((price * 0.97).toFixed(2)),
    image,
    images,
    category,
    stock,
    freeShipping: Boolean(p.free_shipping),
    description: getDescription(p),
    sku,
    isTop,
  };
}

export function loadCacheFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        memoryProducts = parsed.products;
        lastSyncTime = parsed.lastSyncTime || new Date().toISOString();
        console.log(`[Nuvemshop] Carregados ${memoryProducts.length} produtos do cache local.`);
        return true;
      }
    }
  } catch (err) {
    console.error('[Nuvemshop] Erro ao carregar cache do disco:', err.message);
  }
  return false;
}

function saveCacheToDisk(products) {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ lastSyncTime: new Date().toISOString(), count: products.length, products }), 'utf-8');
    console.log(`[Nuvemshop] Salvos ${products.length} produtos no cache.`);
  } catch (err) {
    console.error('[Nuvemshop] Erro ao salvar cache:', err.message);
  }
}

export async function syncAllProductsFromNuvemshop() {
  if (isFetching) return memoryProducts;
  isFetching = true;
  console.log('[Nuvemshop] Iniciando sincronização...');

  try {
    let page = 1;
    const allFetched = [];

    while (true) {
      const url = `https://api.nuvemshop.com.br/v1/${STORE_ID}/products?per_page=200&page=${page}`;
      const res = await fetch(url, {
        headers: { Authentication: `bearer ${ACCESS_TOKEN}`, 'User-Agent': USER_AGENT },
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      for (const item of data) allFetched.push(normalizeProduct(item));

      console.log(`[Nuvemshop] Página ${page} — ${data.length} produtos (total: ${allFetched.length})`);
      if (data.length < 200) break;
      page++;
    }

    if (allFetched.length > 0) {
      memoryProducts = allFetched;
      lastSyncTime = new Date().toISOString();
      saveCacheToDisk(memoryProducts);
      console.log(`[Nuvemshop] Concluído! ${memoryProducts.length} produtos prontos.`);
    }

    return memoryProducts;
  } catch (err) {
    console.error('[Nuvemshop] Erro:', err.message);
    return memoryProducts;
  } finally {
    isFetching = false;
  }
}

export function queryProducts({ search = '', category = '', page = 1, limit = 50 }) {
  let result = memoryProducts;

  if (category && category !== 'Todos') {
    const catLower = category.toLowerCase();
    result = result.filter(p => p.category.toLowerCase() === catLower);
  }

  if (search && search.trim()) {
    const sLower = search.trim().toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(sLower) ||
      p.sku.toLowerCase().includes(sLower) ||
      p.category.toLowerCase().includes(sLower)
    );
  }

  const total = result.length;
  const numLimit = parseInt(limit, 10) || 50;
  const numPage = parseInt(page, 10) || 1;
  const start = (numPage - 1) * numLimit;
  const paginated = numLimit === -1 ? result : result.slice(start, start + numLimit);

  return { total, page: numPage, limit: numLimit, totalPages: numLimit === -1 ? 1 : Math.ceil(total / numLimit), products: paginated, lastSyncTime };
}

export function getProductById(id) {
  return memoryProducts.find(p => p.id === parseInt(id, 10));
}

export function getAllProductsList() {
  return memoryProducts;
}

export function getCategoriesSummary() {
  const counts = {};
  for (const p of memoryProducts) counts[p.category] = (counts[p.category] || 0) + 1;
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}