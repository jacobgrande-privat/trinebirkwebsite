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

async function sendEmailViaBrevo(settings: EmailSettings, formData: ContactFormData) {
  console.log('Sending email via Brevo API...');
  console.log('From:', settings.from_email);
  console.log('To:', settings.recipient_email);

  const brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

  const emailPayload = {
    sender: {
      name: settings.from_name,
      email: settings.from_email,
    },
    to: [
      {
        email: settings.recipient_email,
      },
    ],
    subject: `Ny kontaktbesked fra ${formData.name}`,
    textContent: `Ny kontaktbesked\n\nNavn: ${formData.name}\nEmail: ${formData.email}\n\nBesked:\n${formData.message}\n\n---\nDenne besked blev sendt fra kontaktformularen på din hjemmeside.`,
    htmlContent: `
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
          Denne besked blev sendt fra kontaktformularen på din hjemmeside.
        </p>
      </div>
    `,
  };

  const response = await fetch(brevoApiUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': settings.smtp_password,
    },
    body: JSON.stringify(emailPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo API error:', response.status, errorText);
    throw new Error(`Failed to send email via Brevo: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('✓ Email sent successfully via Brevo API!', result);

  return result;
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

    if (!emailSettings.smtp_password || !emailSettings.from_email || !emailSettings.recipient_email) {
      console.error("Email settings incomplete!");
      return new Response(
        JSON.stringify({ error: "Email settings incomplete" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await sendEmailViaBrevo(emailSettings, formData);
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