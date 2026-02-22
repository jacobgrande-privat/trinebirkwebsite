import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const timingSafeStringMatch = (provided: string, expected: string): boolean => {
  const providedBuffer = Buffer.from(provided, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
};

const parseAuthHeaderToken = (authHeader: string | null): string | null => {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

const toBase64Url = (value: string): string =>
  Buffer.from(value, 'utf8').toString('base64url');

const fromBase64Url = (value: string): string =>
  Buffer.from(value, 'base64url').toString('utf8');

const signPayload = (payload: string, secret: string): string =>
  createHmac('sha256', secret).update(payload).digest('base64url');

const createSessionToken = (email: string, secret: string): string => {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_DURATION_MS,
  });
  const encodedPayload = toBase64Url(payload);
  const signature = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
};

const verifySessionToken = (token: string, secret: string): { valid: true; email: string } | { valid: false } => {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return { valid: false };

  const expectedSignature = signPayload(encodedPayload, secret);
  if (!timingSafeStringMatch(signature, expectedSignature)) return { valid: false };

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as { email?: string; exp?: number };
    if (!payload.email || !payload.exp) return { valid: false };
    if (Date.now() > payload.exp) return { valid: false };
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
};

export default async (request: Request): Promise<Response> => {
  const configuredEmail = process.env.BACKOFFICE_EMAIL;
  const configuredPassword = process.env.BACKOFFICE_PASSWORD;
  const sessionSecret = process.env.BACKOFFICE_SESSION_SECRET;

  if (!configuredEmail || !configuredPassword || !sessionSecret) {
    return jsonResponse({ error: 'Missing BACKOFFICE_* env vars' }, 500);
  }

  const method = request.method.toUpperCase();

  if (method === 'POST') {
    try {
      const body = await request.json();
      const email = typeof body?.email === 'string' ? body.email.trim() : '';
      const password = typeof body?.password === 'string' ? body.password : '';

      const emailMatch = timingSafeStringMatch(email.toLowerCase(), configuredEmail.trim().toLowerCase());
      const passwordMatch = timingSafeStringMatch(password, configuredPassword);

      if (!emailMatch || !passwordMatch) {
        return jsonResponse({ success: false }, 401);
      }

      const token = createSessionToken(email, sessionSecret);
      return jsonResponse({
        success: true,
        token,
        user: {
          id: 'netlify-admin',
          email,
          name: 'Backoffice Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      });
    } catch {
      return jsonResponse({ success: false }, 400);
    }
  }

  if (method === 'GET') {
    const token = parseAuthHeaderToken(request.headers.get('authorization'));
    if (!token) return jsonResponse({ success: false }, 401);

    const verified = verifySessionToken(token, sessionSecret);
    if (!verified.valid) return jsonResponse({ success: false }, 401);

    return jsonResponse({
      success: true,
      user: {
        id: 'netlify-admin',
        email: verified.email,
        name: 'Backoffice Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
};
