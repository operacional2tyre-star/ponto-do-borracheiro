// Headers de segurança
export function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.nuvemshop.com.br https://*.firebaseio.com https://*.googleapis.com;");
}

export function corsHeaders(res, origin) {
  const allowed = [
    'https://ponto-do-borracheiro.vercel.app',
    'https://ponto-do-borracheiro-git-main-operacional2tyre-5857.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
  ];

  const requestOrigin = origin || '';
  const isAllowed = allowed.some(d => requestOrigin.includes(d)) || requestOrigin.includes('.vercel.app');

  res.setHeader('Access-Control-Allow-Origin', isAllowed ? requestOrigin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// Rate limiting por IP
const ipRequests = {};
const RATE_LIMITS = {
  '/api/products': { max: 30, window: 60000 },
  '/api/product': { max: 60, window: 60000 },
  '/api/safra/checkout': { max: 5, window: 60000 },
  'default': { max: 30, window: 60000 },
};

export function checkServerRateLimit(req, path = 'default') {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();
  const key = `${ip}:${path}`;
  const limit = RATE_LIMITS[path] || RATE_LIMITS['default'];

  if (!ipRequests[key]) {
    ipRequests[key] = [];
  }

  ipRequests[key] = ipRequests[key].filter(t => now - t < limit.window);

  if (ipRequests[key].length >= limit.max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((ipRequests[key][0] + limit.window - now) / 1000),
      remaining: 0,
    };
  }

  ipRequests[key].push(now);

  return {
    allowed: true,
    remaining: limit.max - ipRequests[key].length,
  };
}

// Validar origem
export function validateOrigin(req) {
  const origin = req.headers.origin || req.headers.referer || '';
  if (!origin) return true;
  return origin.includes('.vercel.app') || origin.includes('localhost');
}

// Sanitizar string
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .slice(0, 1000);
}

// Validar preço (evita manipulação)
export function validatePrice(price) {
  return typeof price === 'number' && price > 0 && price < 100000 && !isNaN(price);
}

// Validar quantidade
export function validateQuantity(qty) {
  return Number.isInteger(qty) && qty > 0 && qty <= 99;
}

// Log de auditoria
export function auditLog(action, data) {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT] ${timestamp} | ${action} | ${JSON.stringify(data)}`);
}