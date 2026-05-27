import { Hono } from "hono";
import { cors } from "hono/cors";
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

// Direct export of Hono app for Cloudflare Workers compatibility
export default app;
