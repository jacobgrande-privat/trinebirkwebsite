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
  console.log('Gmail settings:', {
    host: settings.gmail_smtp_host,
    port: settings.gmail_smtp_port,
    username: settings.gmail_smtp_username,
    secure: settings.gmail_smtp_secure,
    hasPassword: !!settings.gmail_smtp_password
  });
  
  try {
    // Try dynamic import
    const nodemailer = await import('npm:nodemailer@6.9.0');
    console.log('Nodemailer imported successfully');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: settings.gmail_smtp_host,
      port: settings.gmail_smtp_port,
      secure: settings.gmail_smtp_secure,
      auth: {
        user: settings.gmail_smtp_username,
        pass: settings.gmail_smtp_password,
      },
      debug: true,
      logger: true,
    });

    console.log('Transporter created, verifying connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully!');

    // Send email
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

    console.log('Email sent successfully via Gmail!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('=== Gmail SMTP ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Full error:', JSON.stringify(error, null, 2));
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

    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log('Name:', formData.name);
    console.log('Email:', formData.email);

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

    console.log('✓ Message saved to database successfully');

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
      console.log('✓ Email is enabled');
      console.log('Provider:', emailSettings.provider);
      
      try {
        if (emailSettings.provider === 'gmail') {
          console.log('Using Gmail provider...');
          // Validate Gmail settings
          if (!emailSettings.gmail_smtp_host || !emailSettings.gmail_smtp_username || !emailSettings.gmail_smtp_password) {
            console.error("Gmail SMTP settings incomplete!");
            console.error('Host:', emailSettings.gmail_smtp_host);
            console.error('Username:', emailSettings.gmail_smtp_username);
            console.error('Has password:', !!emailSettings.gmail_smtp_password);
          } else {
            await sendViaGmail(emailSettings, formData);
            console.log('✓✓✓ EMAIL SENT SUCCESSFULLY! ✓✓✓');
          }
        } else if (emailSettings.provider === 'sendgrid') {
          console.log('Using SendGrid provider...');
          // Validate SendGrid settings
          if (!emailSettings.sendgrid_api_key) {
            console.error("SendGrid API key missing");
          } else {
            await sendViaSendGrid(emailSettings, formData);
            console.log('✓✓✓ EMAIL SENT SUCCESSFULLY! ✓✓✓');
          }
        }
      } catch (emailError) {
        console.error("=== EMAIL SENDING FAILED ===");
        console.error("Error:", emailError);
        // Don't fail the entire request if email fails, message is still saved
      }
    } else {
      console.log('Email sending is disabled or settings not found');
    }

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