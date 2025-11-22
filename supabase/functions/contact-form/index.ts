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
  sendgrid_api_key: string;
  from_email: string;
  from_name: string;
  recipient_email: string;
  enabled: boolean;
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

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
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

    // Get email settings
    const { data: emailSettings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    // If email is enabled and configured, send email via SendGrid
    if (emailSettings && emailSettings.enabled && emailSettings.sendgrid_api_key) {
      try {
        const emailBody = {
          personalizations: [
            {
              to: [{ email: emailSettings.recipient_email }],
              subject: `Ny kontaktbesked fra ${formData.name}`,
            },
          ],
          from: {
            email: emailSettings.from_email,
            name: emailSettings.from_name,
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

        const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${emailSettings.sendgrid_api_key}`,
          },
          body: JSON.stringify(emailBody),
        });

        if (!sendGridResponse.ok) {
          const errorText = await sendGridResponse.text();
          console.error("SendGrid error:", errorText);
          // Don't fail the entire request if email fails, message is still saved
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the entire request if email fails, message is still saved
      }
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
      JSON.stringify({ error: "Internal server error" }),
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