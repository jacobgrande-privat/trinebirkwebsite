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

async function sendViaSMTP(settings: EmailSettings, formData: ContactFormData) {
  console.log('Attempting to send via SMTP using nodemailer...');
  console.log('SMTP settings:', {
    host: settings.smtp_host,
    port: settings.smtp_port,
    username: settings.smtp_username,
    secure: settings.smtp_secure,
    hasPassword: !!settings.smtp_password
  });
  
  try {
    const nodemailer = await import('npm:nodemailer@6.9.0');
    console.log('Nodemailer imported successfully');
    
    const transporter = nodemailer.default.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      secure: settings.smtp_secure,
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
      debug: true,
      logger: true,
    });

    console.log('Transporter created, verifying connection...');
    
    await transporter.verify();
    console.log('SMTP connection verified successfully!');

    console.log('Sending email...');
    const info = await transporter.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: settings.recipient_email,
      subject: `Ny kontaktbesked fra ${formData.name}`,
      text: `Ny kontaktbesked\n\nNavn: ${formData.name}\nEmail: ${formData.email}\n\nBesked:\n${formData.message}\n\n---\nDenne besked blev sendt fra kontaktformularen på din hjemmeside.`,
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
            Denne besked blev sendt fra kontaktformularen på din hjemmeside.
          </p>
        </div>
      `,
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('=== SMTP ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
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
      console.error('Host:', emailSettings.smtp_host);
      console.error('Username:', emailSettings.smtp_username);
      console.error('Has password:', !!emailSettings.smtp_password);
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
    
    await sendViaSMTP(emailSettings, formData);
    console.log('✓✓✓ EMAIL SENT SUCCESSFULLY! ✓✓✓');

    console.log('=== REQUEST COMPLETED SUCCESSFULLY ===');
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
    console.error("Stack:", error instanceof Error ? error.stack : 'No stack');
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: error instanceof Error ? error.message : 'Unknown error' }),
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