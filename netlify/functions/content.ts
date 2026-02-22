import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const STORE_NAME = 'site-content';
const CONTENT_KEY = 'content/current';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const parseBearerToken = (authHeader: string | null): string | null => {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

const isValidContentShape = (value: unknown): value is {
  siteConfig: unknown;
  pages: unknown[];
  events: unknown[];
} => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return Array.isArray(record.pages) && Array.isArray(record.events) && typeof record.siteConfig === 'object';
};

const timingSafeTokenMatch = (providedToken: string, expectedToken: string): boolean => {
  const providedBuffer = Buffer.from(providedToken, 'utf8');
  const expectedBuffer = Buffer.from(expectedToken, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
};

const verifyContentAdminToken = (request: Request): { ok: true } | { ok: false; status: number; message: string } => {
  const expectedToken = process.env.CONTENT_ADMIN_TOKEN;
  if (!expectedToken) {
    return { ok: false, status: 500, message: 'Missing CONTENT_ADMIN_TOKEN env var' };
  }

  const headerToken = request.headers.get('x-content-admin-token');
  const bearerToken = parseBearerToken(request.headers.get('authorization'));
  const providedToken = headerToken ?? bearerToken;

  if (!providedToken) {
    return { ok: false, status: 401, message: 'Missing content admin token' };
  }

  if (!timingSafeTokenMatch(providedToken, expectedToken)) {
    return { ok: false, status: 403, message: 'Invalid content admin token' };
  }

  return { ok: true };
};

export default async (request: Request): Promise<Response> => {
  const method = request.method.toUpperCase();
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });

  try {
    if (method === 'GET') {
      let content = await store.get(CONTENT_KEY, { type: 'json' });

      if (!content) {
        const seedResponse = await fetch(new URL('/content.json', request.url));
        if (!seedResponse.ok) {
          return jsonResponse({ error: 'Seed content.json not found' }, 500);
        }

        content = await seedResponse.json();
        await store.setJSON(CONTENT_KEY, content);
      }

      return jsonResponse(content, 200);
    }

    if (method === 'PUT') {
      const access = verifyContentAdminToken(request);
      if (!access.ok) {
        return jsonResponse({ error: access.message }, access.status);
      }

      const body = await request.json();
      if (!isValidContentShape(body)) {
        return jsonResponse({ error: 'Invalid content payload' }, 400);
      }

      await store.setJSON(CONTENT_KEY, body);
      return jsonResponse(body, 200);
    }

    if (method === 'DELETE') {
      const access = verifyContentAdminToken(request);
      if (!access.ok) {
        return jsonResponse({ error: access.message }, access.status);
      }

      await store.delete(CONTENT_KEY);
      return jsonResponse({ success: true }, 200);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Content function error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
