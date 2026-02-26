import { getStore } from '@netlify/blobs';
import nodemailer from 'nodemailer';

const STORE_NAME = 'site-settings';
const EMAIL_SETTINGS_KEY = 'email/settings';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface EmailSettings {
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

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const validatePayload = (value: unknown): value is ContactFormData => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === 'string' &&
    typeof record.email === 'string' &&
    typeof record.message === 'string'
  );
};

const sanitizeInput = (input: string, allowWhitespace = false): string => {
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  if (!allowWhitespace) {
    sanitized = sanitized.replace(/[<>'"&]/g, '').trim();
  }
  return sanitized;
};

const resolveSettings = async (): Promise<EmailSettings> => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const data = await store.get(EMAIL_SETTINGS_KEY, { type: 'json' }) as EmailSettings | null;

  const envPassword = process.env.BREVO_SMTP_PASSWORD || process.env.SMTP_PASSWORD || '';

  if (!data) {
    return {
      smtp_host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      smtp_port: Number(process.env.SMTP_PORT || '587'),
      smtp_username: process.env.SMTP_USERNAME || '',
      smtp_password: envPassword,
      smtp_secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      from_email: process.env.MAIL_FROM || '',
      from_name: process.env.MAIL_FROM_NAME || 'Website Contact',
      recipient_email: process.env.MAIL_TO || '',
      enabled: false,
    };
  }

  return {
    ...data,
    smtp_password: envPassword || data.smtp_password,
  };
};

export default async (request: Request): Promise<Response> => {
  const method = request.method.toUpperCase();

  if (method === 'GET') {
    try {
      const settings = await resolveSettings();
      return jsonResponse({ enabled: !!settings.enabled }, 200);
    } catch {
      return jsonResponse({ enabled: false }, 200);
    }
  }

  if (method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await request.json();
    if (!validatePayload(body)) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const formData: ContactFormData = {
      name: sanitizeInput(body.name, true),
      email: sanitizeInput(body.email, false),
      message: sanitizeInput(body.message, true),
    };

    if (!formData.name || !formData.email || !formData.message) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    if (formData.name.length > 80) {
      return jsonResponse({ error: 'Name too long (max 80 characters)' }, 400);
    }
    if (formData.email.length > 100) {
      return jsonResponse({ error: 'Email too long (max 100 characters)' }, 400);
    }
    if (formData.message.length > 500) {
      return jsonResponse({ error: 'Message too long (max 500 characters)' }, 400);
    }
    if (formData.message.split('\n').length > 40) {
      return jsonResponse({ error: 'Message has too many lines (max 40 lines)' }, 400);
    }

    const settings = await resolveSettings();
    if (!settings.enabled) {
      return jsonResponse({ error: 'Email udsendelse er ikke mulig' }, 503);
    }

    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password) {
      return jsonResponse({ error: 'SMTP settings incomplete' }, 500);
    }
    if (!settings.from_email || !settings.recipient_email) {
      return jsonResponse({ error: 'From/recipient email not configured' }, 500);
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      secure: settings.smtp_secure,
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: settings.recipient_email,
      replyTo: formData.email,
      subject: `Ny kontaktbesked fra ${formData.name}`,
      text: `Ny kontaktbesked\n\nNavn: ${formData.name}\nEmail: ${formData.email}\n\nBesked:\n${formData.message}\n\n---\nDenne besked blev sendt fra kontaktformularen på Trine Birk Andersen's hjemmeside.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ny kontaktbesked</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Navn:</strong> ${formData.name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${formData.email}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <p style="margin: 0 0 10px 0;"><strong>Besked:</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${formData.message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Denne besked blev sendt fra kontaktformularen på Trine Birk Andersen's hjemmeside.
          </p>
        </div>
      `,
    });

    return jsonResponse({ success: true, message: 'Message sent successfully' }, 200);
  } catch (error) {
    console.error('contact-form function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: 'Failed to send email', details: message }, 500);
  }
};
