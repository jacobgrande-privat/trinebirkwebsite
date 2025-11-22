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
  provider: 'sendgrid' | 'gmail';
  sendgrid_api_key: string;
  gmail_smtp_host: string;
  gmail_smtp_port: number;
  gmail_smtp_username: string;
  gmail_smtp_password: string;
  gmail_smtp_secure: boolean;
  from_email: string;
  from_name: string;
  recipient_email: string;
  enabled: boolean;
}

async function sendViaGmail(settings: EmailSettings, formData: ContactFormData) {
  console.log('Attempting to send via Gmail SMTP...');
  
  const emailContent = `From: ${settings.from_name} <${settings.from_email}>
To: ${settings.recipient_email}
Subject: Ny kontaktbesked fra ${formData.name}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<html><body>
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
</body></html>`;

  try {
    // Use nodemailer-like approach via Gmail API
    const auth = btoa(`${settings.gmail_smtp_username}:${settings.gmail_smtp_password}`);
    
    // For Gmail SMTP, we'll use a simpler approach with fetch to Gmail's REST API
    // This requires the user to have set up OAuth or App Password
    console.log('Gmail SMTP settings:', {
      host: settings.gmail_smtp_host,
      port: settings.gmail_smtp_port,
      username: settings.gmail_smtp_username,
      secure: settings.gmail_smtp_secure
    });
    
    // Since Deno.connect with SMTP is complex, let's use a workaround
    // We'll make a direct HTTPS request to send via Gmail API if available
    throw new Error('Gmail SMTP via raw sockets is not supported in Supabase Edge Functions. Please use SendGrid or implement Gmail API OAuth.');
    
  } catch (error) {
    console.error('Gmail SMTP error:', error);
    throw error;
  }
}

async function sendViaSendGrid(settings: EmailSettings, formData: ContactFormData) {
  console.log('Sending via SendGrid...');
  
  const emailBody = {
    personalizations: [
      {
        to: [{ email: settings.recipient_email }],
        subject: `Ny kontaktbesked fra ${formData.name}`,
      },
    ],
    from: {
      email: settings.from_email,
      name: settings.from_name,
    },
    content: [
      {
        type: "text/html",
        value: `
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
      },
    ],
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${settings.sendgrid_api_key}`,
    },
    body: JSON.stringify(emailBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SendGrid API error:', errorText);
    throw new Error(`SendGrid error: ${errorText}`);
  }
  
  console.log('Email sent successfully via SendGrid');
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

    console.log('Received contact form submission:', { name: formData.name, email: formData.email });

    // Validate required fields
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

    // Validate field lengths
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

    // Check line count (max 40 lines)
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

    // Insert message into database
    console.log('Saving message to database...');
    const { data: messageData, error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save message" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('Message saved to database successfully');

    // Get email settings
    console.log('Fetching email settings...');
    const { data: emailSettings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    if (settingsError) {
      console.error('Error fetching email settings:', settingsError);
    }

    // If email is enabled and configured, send email based on provider
    if (emailSettings && emailSettings.enabled) {
      console.log('Email is enabled. Provider:', emailSettings.provider);
      
      try {
        if (emailSettings.provider === 'gmail') {
          console.log('Gmail provider selected');
          // Validate Gmail settings
          if (!emailSettings.gmail_smtp_host || !emailSettings.gmail_smtp_username || !emailSettings.gmail_smtp_password) {
            console.error("Gmail SMTP settings incomplete");
            // Continue without sending email
          } else {
            console.warn('Gmail SMTP via raw sockets is not supported in Supabase Edge Functions.');
            console.warn('Please use SendGrid or implement Gmail API with OAuth.');
            console.warn('Message has been saved to database but email was not sent.');
          }
        } else if (emailSettings.provider === 'sendgrid') {
          console.log('SendGrid provider selected');
          // Validate SendGrid settings
          if (!emailSettings.sendgrid_api_key) {
            console.error("SendGrid API key missing");
          } else {
            await sendViaSendGrid(emailSettings, formData);
          }
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the entire request if email fails, message is still saved
      }
    } else {
      console.log('Email sending is disabled or settings not found');
    }

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
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' }),
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