export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const STORE_ID = process.env.NUVEMSHOP_STORE_ID || '6416066';
  const ACCESS_TOKEN = process.env.NUVEMSHOP_ACCESS_TOKEN;
  const USER_AGENT = 'PontoDoBorracheiro (contato@pontodoborracheiro.com.br)';
  const { id } = req.query;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Token não configurado' });
  }

  if (!id) {
    return res.status(400).json({ error: 'ID do produto não informado' });
  }

  try {
    const url = `https://api.nuvemshop.com.br/v1/${STORE_ID}/products/${id}`;
    const response = await fetch(url, {
      headers: {
        'Authentication': `bearer ${ACCESS_TOKEN}`,
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Produto não encontrado' });
    }

    const data = await response.json();

    const name = data.name?.pt || data.name || '';
    const price = parseFloat(data.variants?.[0]?.price || 0);
    const images = (data.images || []).map(i => i.src).filter(Boolean);

    const product = {
      id: data.id,
      name,
      price,
      pricePix: Number((price * 0.97).toFixed(2)),
      image: images[0] || '',
      images,
      category: data.categories?.[0]?.name?.pt || 'Acessórios',
      stock: parseInt(data.variants?.[0]?.stock || 0, 10),
      freeShipping: Boolean(data.free_shipping),
      description: data.description?.pt || data.description || '',
      sku: (data.variants?.[0]?.sku || '').toString(),
    };

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}