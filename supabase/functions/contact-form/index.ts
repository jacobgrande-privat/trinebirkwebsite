import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

async function sendEmail(settings: EmailSettings, formData: ContactFormData) {
  console.log('Preparing to send email via SMTP...');
  console.log('SMTP Host:', settings.smtp_host);
  console.log('SMTP Port:', settings.smtp_port);
  console.log('From:', settings.from_email);
  console.log('To:', settings.recipient_email);

  const boundary = `----=_Part${Date.now()}`;

  const subject = `Ny kontaktbesked fra ${formData.name}`;
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const emailBody = [
    `From: "${settings.from_name}" <${settings.from_email}>`,
    `To: ${settings.recipient_email}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    `Ny kontaktbesked`,
    ``,
    `Navn: ${formData.name}`,
    `Email: ${formData.email}`,
    ``,
    `Besked:`,
    `${formData.message}`,
    ``,
    `---`,
    `Denne besked blev sendt fra kontaktformularen på din hjemmeside.`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">`,
    `  <h2 style="color: #333;">Ny kontaktbesked</h2>`,
    `  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">`,
    `    <p style="margin: 10px 0;"><strong>Navn:</strong> ${formData.name}</p>`,
    `    <p style="margin: 10px 0;"><strong>Email:</strong> ${formData.email}</p>`,
    `  </div>`,
    `  <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">`,
    `    <p style="margin: 0 0 10px 0;"><strong>Besked:</strong></p>`,
    `    <p style="margin: 0; white-space: pre-wrap;">${formData.message}</p>`,
    `  </div>`,
    `  <p style="color: #666; font-size: 12px; margin-top: 20px;">`,
    `    Denne besked blev sendt fra kontaktformularen på din hjemmeside.`,
    `  </p>`,
    `</div>`,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  try {
    console.log('Connecting to SMTP server with TLS...');

    const conn = await Deno.connectTls({
      hostname: settings.smtp_host,
      port: settings.smtp_port,
    });

    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    async function send(command: string) {
      const logCommand = command.includes(settings.smtp_password)
        ? command.replace(settings.smtp_password, '***')
        : command;
      console.log('>', logCommand);
      await conn.write(textEncoder.encode(command + '\r\n'));
    }

    async function receive(): Promise<string> {
      const buffer = new Uint8Array(4096);
      const n = await conn.read(buffer);
      if (!n) {
        throw new Error('Connection closed by server');
      }
      const response = textDecoder.decode(buffer.subarray(0, n));
      console.log('<', response.trim());
      return response;
    }

    let response = await receive();
    if (!response.startsWith('220')) {
      throw new Error('SMTP connection failed: ' + response);
    }

    await send(`EHLO ${settings.smtp_host}`);
    response = await receive();

    while (response.startsWith('250-')) {
      response = await receive();
    }

    const authString = btoa(`\0${settings.smtp_username}\0${settings.smtp_password}`);
    await send('AUTH PLAIN ' + authString);
    response = await receive();
    if (!response.startsWith('235')) {
      throw new Error('Authentication failed: ' + response);
    }

    await send(`MAIL FROM:<${settings.from_email}>`);
    response = await receive();
    if (!response.startsWith('250')) {
      throw new Error('MAIL FROM failed: ' + response);
    }

    await send(`RCPT TO:<${settings.recipient_email}>`);
    response = await receive();
    if (!response.startsWith('250')) {
      throw new Error('RCPT TO failed: ' + response);
    }

    await send('DATA');
    response = await receive();
    if (!response.startsWith('354')) {
      throw new Error('DATA command failed: ' + response);
    }

    await send(emailBody);
    await send('.');
    response = await receive();
    if (!response.startsWith('250')) {
      throw new Error('Message sending failed: ' + response);
    }

    await send('QUIT');
    await receive();

    conn.close();

    console.log('✓ Email sent successfully!');

  } catch (error) {
    console.error('=== SMTP ERROR ===');
    console.error('Error:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData: ContactFormData = await req.json();

    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log('Name:', formData.name);
    console.log('Email:', formData.email);

    if (!formData.name || !formData.email || !formData.message) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (formData.name.length > 80) {
      return new Response(
        JSON.stringify({ error: "Name too long (max 80 characters)" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (formData.email.length > 100) {
      return new Response(
        JSON.stringify({ error: "Email too long (max 100 characters)" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (formData.message.length > 500) {
      return new Response(
        JSON.stringify({ error: "Message too long (max 500 characters)" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const lineCount = formData.message.split('\n').length;
    if (lineCount > 40) {
      return new Response(
        JSON.stringify({ error: "Message has too many lines (max 40 lines)" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('Fetching email settings...');
    const { data: emailSettings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    if (settingsError) {
      console.error('Error fetching email settings:', settingsError);
      return new Response(
        JSON.stringify({ error: "Email settings not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!emailSettings || !emailSettings.enabled) {
      console.log('Email sending is disabled');
      return new Response(
        JSON.stringify({ error: "Email sending is disabled" }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('✓ Email is enabled');

    if (!emailSettings.smtp_host || !emailSettings.smtp_username || !emailSettings.smtp_password) {
      console.error("SMTP settings incomplete!");
      return new Response(
        JSON.stringify({ error: "SMTP settings incomplete" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await sendEmail(emailSettings, formData);
    console.log('✓✓✓ EMAIL SENT SUCCESSFULLY! ✓✓✓');

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("=== FATAL ERROR ===");
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to send email",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});