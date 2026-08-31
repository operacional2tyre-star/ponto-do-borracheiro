import { securityHeaders, corsHeaders, sanitize } from './middleware/security.js';

export default async function handler(req, res) {
  securityHeaders(res);
  corsHeaders(res, req.headers.origin);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { action, data, userId } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';

    const logEntry = {
      timestamp: new Date().toISOString(),
      action: sanitize(action || ''),
      userId: sanitize(userId || ''),
      ip,
      userAgent: ua.slice(0, 200),
      data: typeof data === 'object' ? JSON.stringify(data).slice(0, 500) : sanitize(String(data || '')),
    };

    console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);

    return res.status(200).json({ logged: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}