import { getStore } from '@netlify/blobs';
import { createHmac, timingSafeEqual } from 'node:crypto';

const EMAIL_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';
const STORE_NAME = 'site-settings';
const EMAIL_SETTINGS_KEY = 'email/settings';

interface EmailSettingsPayload {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
  recipient_email: string;
  enabled: boolean;
}

type StoredEmailSettings = EmailSettingsPayload & {
  id: string;
  updated_at?: string;
  updated_by_email?: string;
};

const defaultEmailSettings: StoredEmailSettings = {
  id: EMAIL_SETTINGS_ID,
  smtp_host: 'smtp-relay.brevo.com',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  smtp_secure: false,
  from_email: '',
  from_name: '',
  recipient_email: '',
  enabled: false,
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const parseAuthHeaderToken = (authHeader: string | null): string | null => {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

const fromBase64Url = (value: string): string =>
  Buffer.from(value, 'base64url').toString('utf8');

const signPayload = (payload: string, secret: string): string =>
  createHmac('sha256', secret).update(payload).digest('base64url');

const timingSafeStringMatch = (provided: string, expected: string): boolean => {
  const providedBuffer = Buffer.from(provided, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
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

const validatePayload = (value: unknown): value is EmailSettingsPayload => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.smtp_host === 'string' &&
    typeof record.smtp_port === 'number' &&
    typeof record.smtp_username === 'string' &&
    typeof record.smtp_password === 'string' &&
    typeof record.smtp_secure === 'boolean' &&
    typeof record.from_email === 'string' &&
    typeof record.from_name === 'string' &&
    typeof record.recipient_email === 'string' &&
    typeof record.enabled === 'boolean'
  );
};

export default async (request: Request): Promise<Response> => {
  const method = request.method.toUpperCase();

  const sessionSecret = process.env.BACKOFFICE_SESSION_SECRET;
  if (!sessionSecret) {
    return jsonResponse({ error: 'Missing BACKOFFICE_SESSION_SECRET env var' }, 500);
  }

  const token = parseAuthHeaderToken(request.headers.get('authorization'));
  if (!token) return jsonResponse({ error: 'Missing authorization token' }, 401);

  const verified = verifySessionToken(token, sessionSecret);
  if (!verified.valid) return jsonResponse({ error: 'Invalid or expired session token' }, 401);

  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const envPassword = process.env.BREVO_SMTP_PASSWORD || process.env.SMTP_PASSWORD || '';
  const passwordFromEnv = !!envPassword;

  try {
    if (method === 'GET') {
      let data = await store.get(EMAIL_SETTINGS_KEY, { type: 'json' }) as StoredEmailSettings | null;
      if (!data) {
        data = { ...defaultEmailSettings };
        await store.setJSON(EMAIL_SETTINGS_KEY, data);
      }

      const sanitized = {
        ...data,
        smtp_password: passwordFromEnv ? '' : data.smtp_password,
      };

      return jsonResponse({ settings: sanitized, password_from_env: passwordFromEnv }, 200);
    }

    if (method === 'PUT') {
      const body = await request.json();
      if (!validatePayload(body)) {
        return jsonResponse({ error: 'Invalid email settings payload' }, 400);
      }

      const stored: StoredEmailSettings = {
        id: EMAIL_SETTINGS_ID,
        ...body,
        smtp_password: passwordFromEnv ? '' : body.smtp_password,
        updated_at: new Date().toISOString(),
        updated_by_email: verified.email,
      };
      await store.setJSON(EMAIL_SETTINGS_KEY, stored);

      return jsonResponse({ success: true }, 200);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('email-settings function error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
