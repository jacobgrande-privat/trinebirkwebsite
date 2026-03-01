import { getStore } from '@netlify/blobs';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const STORE_NAME = 'site-media';
const INDEX_KEY = 'media/index';
const MEDIA_PREFIX = 'media/files/';
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

interface StoredMediaFile {
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface ApiErrorPayload {
  title: string;
  detail: string;
  action: string;
  code:
    | 'UNAUTHORIZED'
    | 'MISSING_FILE'
    | 'UNSUPPORTED_TYPE'
    | 'FILE_TOO_LARGE'
    | 'INVALID_IMAGE_CONTENT'
    | 'MIME_MISMATCH'
    | 'MISSING_KEY'
    | 'NOT_FOUND'
    | 'INTERNAL';
}

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const apiError = (error: ApiErrorPayload, status = 400): Response =>
  jsonResponse({ error }, status);

const parseAuthHeaderToken = (authHeader: string | null): string | null => {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

const fromBase64Url = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

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

const sanitizeBaseName = (originalName: string): string => {
  const withoutExtension = originalName.replace(/\.[^.]+$/, '');
  const normalized = withoutExtension
    .normalize('NFKD')
    .replace(/[^\w.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || 'billede';
};

const readUint32LE = (bytes: Uint8Array, offset: number): number =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);

const detectMimeByMagicBytes = (bytes: Uint8Array): string | null => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return 'image/gif';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    const riffSize = readUint32LE(bytes, 4);
    if (riffSize > 0) {
      return 'image/webp';
    }
  }

  return null;
};

const normalizeAndValidateMimeType = (mimeType: string): string | null => {
  const normalized = mimeType.toLowerCase();
  if (normalized === 'image/jpg') return 'image/jpeg';
  return ALLOWED_MIME_TYPES[normalized] ? normalized : null;
};

const requireEditorAuth = (request: Request): { ok: true } | { ok: false; response: Response } => {
  const sessionSecret = process.env.BACKOFFICE_SESSION_SECRET;
  if (!sessionSecret) {
    return {
      ok: false,
      response: apiError(
        {
          code: 'INTERNAL',
          title: 'Upload er midlertidigt utilgængelig',
          detail: 'Serveren mangler nødvendig konfiguration til sikker upload.',
          action: 'Kontakt administrator og prøv igen bagefter.',
        },
        500
      ),
    };
  }

  const token = parseAuthHeaderToken(request.headers.get('authorization'));
  if (!token) {
    return {
      ok: false,
      response: apiError(
        {
          code: 'UNAUTHORIZED',
          title: 'Du skal være logget ind',
          detail: 'Vi kunne ikke bekræfte din redaktør-session.',
          action: 'Log ud og ind igen i backoffice, og prøv upload på ny.',
        },
        401
      ),
    };
  }

  const verified = verifySessionToken(token, sessionSecret);
  if (!verified.valid) {
    return {
      ok: false,
      response: apiError(
        {
          code: 'UNAUTHORIZED',
          title: 'Din session er udløbet',
          detail: 'Din sikkerhedstoken er ikke længere gyldig.',
          action: 'Log ind igen i backoffice og prøv derefter.',
        },
        401
      ),
    };
  }

  return { ok: true };
};

const readMediaIndex = async (store: ReturnType<typeof getStore>): Promise<StoredMediaFile[]> => {
  const current = (await store.get(INDEX_KEY, { type: 'json' })) as StoredMediaFile[] | null;
  if (!Array.isArray(current)) return [];
  return current.filter((item) => item && typeof item.key === 'string' && typeof item.url === 'string');
};

const writeMediaIndex = async (store: ReturnType<typeof getStore>, entries: StoredMediaFile[]): Promise<void> => {
  await store.setJSON(INDEX_KEY, entries);
};

const sortByLatest = (items: StoredMediaFile[]): StoredMediaFile[] =>
  [...items].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

export const config = {
  path: '/api/media',
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};

export default async (request: Request): Promise<Response> => {
  const method = request.method.toUpperCase();
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const url = new URL(request.url);
  const key = url.searchParams.get('key')?.trim() || '';

  try {
    if (method === 'GET' && key) {
      const mediaIndex = await readMediaIndex(store);
      const file = mediaIndex.find((entry) => entry.key === key);
      if (!file) {
        return apiError(
          {
            code: 'NOT_FOUND',
            title: 'Billedet blev ikke fundet',
            detail: 'Det valgte billede findes ikke længere i mediebiblioteket.',
            action: 'Vælg et andet billede eller upload filen igen.',
          },
          404
        );
      }

      const fileData = await store.get(file.key, { type: 'arrayBuffer' });
      if (!fileData) {
        return apiError(
          {
            code: 'NOT_FOUND',
            title: 'Billedet blev ikke fundet',
            detail: 'Selve billedfilen mangler i lagringen.',
            action: 'Upload billedet igen og opdater indholdet.',
          },
          404
        );
      }

      return new Response(fileData, {
        status: 200,
        headers: {
          'Content-Type': file.mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    if (method === 'GET') {
      const access = requireEditorAuth(request);
      if (!access.ok) return access.response;

      const mediaIndex = await readMediaIndex(store);
      return jsonResponse({ files: sortByLatest(mediaIndex) }, 200);
    }

    if (method === 'POST') {
      const access = requireEditorAuth(request);
      if (!access.ok) return access.response;

      const formData = await request.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) {
        return apiError(
          {
            code: 'MISSING_FILE',
            title: 'Ingen fil valgt',
            detail: 'Upload kræver, at du vælger en billedfil først.',
            action: 'Klik "Vælg billede", vælg en fil, og prøv igen.',
          },
          400
        );
      }

      const normalizedMimeType = normalizeAndValidateMimeType(file.type || '');
      if (!normalizedMimeType) {
        return apiError(
          {
            code: 'UNSUPPORTED_TYPE',
            title: 'Filtypen understøttes ikke',
            detail: 'Kun JPG, PNG, WebP og GIF kan uploades.',
            action: 'Gem billedet som JPG/PNG/WebP/GIF og upload igen.',
          },
          400
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return apiError(
          {
            code: 'FILE_TOO_LARGE',
            title: 'Filen er for stor',
            detail: `Maksimal filstørrelse er 4 MB, men filen er ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
            action: 'Komprimer billedet eller vælg en mindre fil og upload igen.',
          },
          400
        );
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const magicMimeType = detectMimeByMagicBytes(bytes);
      if (!magicMimeType) {
        return apiError(
          {
            code: 'INVALID_IMAGE_CONTENT',
            title: 'Filen ligner ikke et gyldigt billede',
            detail: 'Filens indhold matcher ikke et gyldigt JPG, PNG, WebP eller GIF-billede.',
            action: 'Eksporter billedet på ny fra dit billedprogram og upload igen.',
          },
          400
        );
      }

      if (magicMimeType !== normalizedMimeType) {
        return apiError(
          {
            code: 'MIME_MISMATCH',
            title: 'Filtype og filindhold passer ikke sammen',
            detail: `Filen er markeret som ${normalizedMimeType}, men indholdet ligner ${magicMimeType}.`,
            action: 'Gem filen i korrekt format (eller korrekt filendelse) og upload igen.',
          },
          400
        );
      }

      const extension = ALLOWED_MIME_TYPES[magicMimeType];
      const safeBaseName = sanitizeBaseName(file.name || 'billede');
      const unique = randomUUID().replace(/-/g, '').slice(0, 12);
      const filename = `${safeBaseName}-${Date.now()}-${unique}.${extension}`;
      const storageKey = `${MEDIA_PREFIX}${filename}`;
      const publicUrl = `/api/media?key=${encodeURIComponent(storageKey)}`;

      await store.set(storageKey, bytes);

      const mediaIndex = await readMediaIndex(store);
      const entry: StoredMediaFile = {
        key: storageKey,
        url: publicUrl,
        name: filename,
        size: bytes.byteLength,
        mimeType: magicMimeType,
        uploadedAt: new Date().toISOString(),
      };
      const updatedIndex = sortByLatest([entry, ...mediaIndex]);
      await writeMediaIndex(store, updatedIndex);

      return jsonResponse({ success: true, file: entry }, 200);
    }

    if (method === 'DELETE') {
      const access = requireEditorAuth(request);
      if (!access.ok) return access.response;

      if (!key) {
        return apiError(
          {
            code: 'MISSING_KEY',
            title: 'Mangler billedenøgle',
            detail: 'Vi ved ikke, hvilket billede der skal slettes.',
            action: 'Prøv igen fra mediebiblioteket og vælg Slet på det konkrete billede.',
          },
          400
        );
      }

      await store.delete(key);
      const mediaIndex = await readMediaIndex(store);
      const updatedIndex = mediaIndex.filter((entry) => entry.key !== key);
      await writeMediaIndex(store, updatedIndex);

      return jsonResponse({ success: true }, 200);
    }

    return jsonResponse({ error: { code: 'NOT_FOUND', title: 'Ikke fundet' } }, 404);
  } catch (error) {
    console.error('media function error:', error);
    return apiError(
      {
        code: 'INTERNAL',
        title: 'Der opstod en serverfejl',
        detail: 'Uploaden kunne ikke gennemføres på grund af en intern fejl.',
        action: 'Prøv igen om et øjeblik. Hvis det fortsætter, kontakt administrator.',
      },
      500
    );
  }
};
