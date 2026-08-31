export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned.charAt(i)) * (10 - i);
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned.charAt(i)) * (11 - i);
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

export function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

export function isValidCEP(cep) {
  return cep.replace(/\D/g, '').length === 8;
}

export function isValidPrice(price) {
  return typeof price === 'number' && price > 0 && price < 1000000 && !isNaN(price);
}

export function isValidQuantity(qty) {
  return Number.isInteger(qty) && qty > 0 && qty <= 999;
}

export function limitLength(text, maxLength = 500) {
  if (typeof text !== 'string') return '';
  return text.slice(0, maxLength);
}

export function validateCheckoutData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 3) errors.push('Nome deve ter pelo menos 3 caracteres');
  if (data.name && data.name.length > 100) errors.push('Nome muito longo');
  if (!isValidPhone(data.phone || '')) errors.push('Telefone inválido');
  if (!isValidCEP(data.cep || '')) errors.push('CEP inválido');
  if (!data.address || data.address.trim().length < 5) errors.push('Endereço muito curto');
  if (data.address && data.address.length > 200) errors.push('Endereço muito longo');
  if (!data.number || data.number.trim().length < 1) errors.push('Número é obrigatório');
  if (!data.neighborhood || data.neighborhood.trim().length < 2) errors.push('Bairro é obrigatório');

  return { valid: errors.length === 0, errors };
}

export function validateMessage(text) {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 2000;
}