const requestCounts = {};
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS = 30;

export function checkRateLimit(action = 'default') {
  const now = Date.now();

  if (!requestCounts[action]) {
    requestCounts[action] = [];
  }

  requestCounts[action] = requestCounts[action].filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (requestCounts[action].length >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((requestCounts[action][0] + RATE_LIMIT_WINDOW - now) / 1000),
    };
  }

  requestCounts[action].push(now);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - requestCounts[action].length,
  };
}

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Log de auditoria do cliente
export async function logAudit(action, data = {}) {
  try {
    await fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        data,
        userId: data.userId || 'anonymous',
      }),
    });
  } catch (err) {
    // Silencioso - não afeta o usuário
  }
}