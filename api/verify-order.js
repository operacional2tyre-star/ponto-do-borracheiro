import { securityHeaders, corsHeaders, checkServerRateLimit, validateOrigin, sanitize, validatePrice, validateQuantity, auditLog } from './middleware/security.js';

export default async function handler(req, res) {
  securityHeaders(res);
  corsHeaders(res, req.headers.origin);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  if (!validateOrigin(req)) {
    auditLog('BLOCKED_ORIGIN', { ip: req.headers['x-forwarded-for'], origin: req.headers.origin });
    return res.status(403).json({ error: 'Origem não autorizada' });
  }

  const rateLimit = checkServerRateLimit(req, '/api/safra/checkout');
  if (!rateLimit.allowed) {
    auditLog('RATE_LIMITED', { ip: req.headers['x-forwarded-for'] });
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em instantes.' });
  }

  try {
    const { items, total, paymentMethod, customer } = req.body;

    // Validações
    const errors = [];

    // Validar itens
    if (!Array.isArray(items) || items.length === 0) {
      errors.push('Carrinho vazio');
    }

    if (items.length > 50) {
      errors.push('Máximo de 50 itens por pedido');
    }

    // Validar cada item
    let calculatedTotal = 0;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item.id) errors.push('Item sem ID');
        if (!item.name || typeof item.name !== 'string') errors.push('Item sem nome');
        if (!validatePrice(item.price)) errors.push(`Preço inválido: ${item.name}`);
        if (!validateQuantity(item.quantity)) errors.push(`Quantidade inválida: ${item.name}`);

        if (validatePrice(item.price) && validateQuantity(item.quantity)) {
          calculatedTotal += item.price * item.quantity;
        }
      }
    }

    // Validar total (prevenir manipulação de preço)
    if (typeof total !== 'number' || total <= 0) {
      errors.push('Total inválido');
    }

    // Tolerância de R$0.01 para arredondamento
    if (calculatedTotal > 0 && Math.abs(calculatedTotal - total) > 0.01) {
      auditLog('PRICE_MISMATCH', {
        clientTotal: total,
        serverTotal: calculatedTotal,
        diff: Math.abs(calculatedTotal - total),
      });
      errors.push('Total não confere com os itens');
    }

    // Validar método de pagamento
    if (!['pix', 'credit_card', 'boleto'].includes(paymentMethod)) {
      errors.push('Método de pagamento inválido');
    }

    // Validar dados do cliente
    if (!customer?.name || customer.name.trim().length < 3) {
      errors.push('Nome inválido');
    }

    if (!customer?.phone || customer.phone.replace(/\D/g, '').length < 10) {
      errors.push('Telefone inválido');
    }

    if (errors.length > 0) {
      auditLog('ORDER_VALIDATION_FAILED', { errors, ip: req.headers['x-forwarded-for'] });
      return res.status(400).json({ error: 'Dados inválidos', details: errors });
    }

    // Tudo válido
    auditLog('ORDER_VERIFIED', {
      itemCount: items.length,
      total: calculatedTotal,
      paymentMethod,
    });

    return res.status(200).json({
      valid: true,
      verifiedTotal: calculatedTotal,
      itemCount: items.length,
    });
  } catch (error) {
    auditLog('ORDER_VERIFY_ERROR', { error: error.message });
    return res.status(500).json({ error: 'Erro ao validar pedido' });
  }
}