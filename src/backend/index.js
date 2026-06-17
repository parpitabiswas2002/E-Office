import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";
import { generateDraft, generateReply, generateBodyParagraphs } from "./geminiService.js";

const app = new Hono();

// Enable global CORS for API endpoints
app.use("/api/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

// API Status Route
app.get("/api/status", (c) => {
  // Cloudflare dynamic environment variables are bound to c.env
  const apiKey = c.env?.GEMINI_API_KEY || process.env?.GEMINI_API_KEY;
  const isKeyConfigured = !!apiKey && 
                          apiKey !== "your_gemini_api_key_here" && 
                          apiKey.trim() !== "";
  return c.json({
    status: "healthy",
    message: "Serverless Office Letter Assistant backend is fully operational.",
    geminiKeyConfigured: isKeyConfigured
  });
});

// Endpoint: Expose public config to frontend
app.get("/api/config", (c) => {
  const supabaseUrl = c.env?.SUPABASE_URL || process.env?.SUPABASE_URL;
  const supabaseAnonKey = c.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY;
  return c.json({
    supabaseUrl,
    supabaseAnonKey
  });
});

// Endpoint: Generate Letter Draft
app.post("/api/letters/draft", async (c) => {
  try {
    const { context, tone, letterType } = await c.req.json();
    const apiKey = c.env?.GEMINI_API_KEY || process.env?.GEMINI_API_KEY;

    if (!context) {
      return c.json({
        success: false,
        error: "Context/Subject is required for generating a draft."
      }, 400);
    }

    const draft = await generateDraft(apiKey, context, tone, letterType);
    return c.json({
      success: true,
      draft
    });
  } catch (error) {
    console.error("API Draft Error:", error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Endpoint: Generate Letter Body Paragraphs Only
app.post("/api/letters/generate-body", async (c) => {
  try {
    const { subject, style, letterType, tone } = await c.req.json();
    const apiKey = c.env?.GEMINI_API_KEY || process.env?.GEMINI_API_KEY;

    if (!subject) {
      return c.json({
        success: false,
        error: "Subject/Context is required to generate the body paragraphs."
      }, 400);
    }

    const bodyText = await generateBodyParagraphs(apiKey, subject, style || "professional", letterType, tone);
    return c.json({
      success: true,
      body: bodyText
    });
  } catch (error) {
    console.error("API Generate Body Error:", error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Endpoint: Generate Letter Reply (Multimodal)
app.post("/api/letters/reply", async (c) => {
  try {
    // Parse body containing standard form fields and files natively
    const body = await c.req.parseBody();
    const responsePoints = body.responsePoints;
    const tone = body.tone;
    const incomingLetterText = body.incomingLetterText;
    const file = body.incomingLetterFile; // File/Blob representation
    const apiKey = c.env?.GEMINI_API_KEY || process.env?.GEMINI_API_KEY;

    if (!responsePoints) {
      return c.json({
        success: false,
        error: "Response points/notes are required to generate a reply."
      }, 400);
    }

    let incomingLetterContent = null;
    if (file && typeof file === "object" && file.size > 0) {
      incomingLetterContent = {
        buffer: await file.arrayBuffer(),
        mimetype: file.type || "image/jpeg",
        name: file.name
      };
    } else if (incomingLetterText) {
      incomingLetterContent = incomingLetterText;
    } else {
      return c.json({
        success: false,
        error: "Either an uploaded letter file or incoming letter text content must be provided."
      }, 400);
    }

    const reply = await generateReply(apiKey, incomingLetterContent, responsePoints, tone);
    return c.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error("API Reply Error:", error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// --- Supabase E-Office API Routes ---

function getSupabaseClient(c) {
  const supabaseUrl = c.env?.SUPABASE_URL || process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL;
  const supabaseKey = c.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY;
  return createClient(supabaseUrl, supabaseKey);
}

// Get Preferences
app.get("/api/e-office/preferences", async (c) => {
  try {
    const supabase = getSupabaseClient(c);
    const { data, error } = await supabase
      .from("e_office_preferences")
      .select("*")
      .eq("id", "default")
      .single();

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, preferences: data });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update Preferences
app.post("/api/e-office/preferences", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient(c);

    // Upsert preferences for the 'default' profile
    const upsertPayload = {
      id: "default",
      letter_types: body.letterTypes,
      tones: body.tones,
      copy_presets: body.copyPresets,
      to_addresses: body.toAddresses,
      margins: body.margins,
      updated_at: new Date().toISOString()
    };

    // Only include header_logo if explicitly provided in the request
    if (body.headerLogo !== undefined) {
      upsertPayload.header_logo = body.headerLogo;
    }

    const { data, error } = await supabase
      .from("e_office_preferences")
      .upsert(upsertPayload)
      .select()
      .single();

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, preferences: data });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get History / Previous Letters
app.get("/api/e-office/history", async (c) => {
  try {
    const supabase = getSupabaseClient(c);
    const { data, error } = await supabase
      .from("e_office_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    // Map database fields to front-end keys
    const drafts = data.map(item => ({
      id: item.id,
      subject: item.subject,
      documentType: item.document_type,
      tone: item.tone,
      content: item.content,
      mode: item.mode,
      date: item.created_at
    }));

    return c.json({ success: true, drafts });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save/Upsert History Item (Previous Letter)
app.post("/api/e-office/history", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient(c);

    const { data, error } = await supabase
      .from("e_office_history")
      .upsert({
        id: body.id,
        subject: body.subject,
        document_type: body.documentType,
        tone: body.tone,
        content: body.content,
        mode: body.mode,
        created_at: body.date || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, draft: data });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete History Item
app.delete("/api/e-office/history/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = getSupabaseClient(c);

    const { error } = await supabase
      .from("e_office_history")
      .delete()
      .eq("id", id);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Direct export of Hono app for Cloudflare Workers compatibility
export default app;
