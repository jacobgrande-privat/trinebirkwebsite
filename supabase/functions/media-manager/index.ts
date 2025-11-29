import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MEDIA_DIR = "/tmp/media";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // List all media files
    if (req.method === "GET" && path === "/media-manager") {
      try {
        await Deno.mkdir(MEDIA_DIR, { recursive: true });
        const files: { name: string; url: string; size: number }[] = [];
        
        for await (const entry of Deno.readDir(MEDIA_DIR)) {
          if (entry.isFile) {
            const stat = await Deno.stat(`${MEDIA_DIR}/${entry.name}`);
            files.push({
              name: entry.name,
              url: `/media/${entry.name}`,
              size: stat.size
            });
          }
        }

        return new Response(JSON.stringify({ files }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ files: [] }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }
    }

    // Upload a media file
    if (req.method === "POST" && path === "/media-manager/upload") {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      // Validate file type (images only)
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        return new Response(JSON.stringify({ error: "Invalid file type. Only images allowed." }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      // Generate safe filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}-${safeName}`;
      const filepath = `${MEDIA_DIR}/${filename}`;

      // Ensure directory exists
      await Deno.mkdir(MEDIA_DIR, { recursive: true });

      // Save file
      const bytes = await file.arrayBuffer();
      await Deno.writeFile(filepath, new Uint8Array(bytes));

      return new Response(JSON.stringify({
        success: true,
        filename,
        url: `/media/${filename}`
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Delete a media file
    if (req.method === "DELETE" && path.startsWith("/media-manager/")) {
      const filename = path.replace("/media-manager/", "");
      
      if (!filename || filename.includes("..") || filename.includes("/")) {
        return new Response(JSON.stringify({ error: "Invalid filename" }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      const filepath = `${MEDIA_DIR}/${filename}`;

      try {
        await Deno.remove(filepath);
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "File not found" }), {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});