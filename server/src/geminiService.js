import { GoogleGenerativeAI } from "@google/generative-ai";
import { DRAFT_SYSTEM_PROMPT, REPLY_SYSTEM_PROMPT } from "./promptTemplates.js";

/**
 * Validates and instantiates the Gemini AI Client.
 * @param {string} apiKey - The dynamic API key fetched from server/worker environments.
 */
function getGeminiClient(apiKey) {
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "Gemini API key is not configured. Please supply a valid GEMINI_API_KEY."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generates an official letter draft.
 * @param {string} apiKey - Gemini API Key.
 * @param {string} context - Subject / Context for the letter.
 * @param {string} tone - Letter tone (Formal, Urgent, Request, Strict).
 * @param {string} letterType - Type of document (Memo, Show Cause, etc.).
 */
export async function generateDraft(apiKey, context, tone, letterType) {
  const genAI = getGeminiClient(apiKey);
  
  if (!context || !context.trim()) {
    throw new Error("Context/Subject is required to generate a letter draft.");
  }

  try {
    // Configure Gemini model to enforce a structured JSON output schema
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `${DRAFT_SYSTEM_PROMPT}

SPECIFICATIONS:
- Document Type: ${letterType || "General Letter"}
- Subject / Context: ${context}
- Tone / Communication Style: ${tone || "Formal"}

Draft the structured JSON letter now:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().trim();
    
    // Parse the JSON directly to verify syntactical validity before returning
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error in generateDraft service:", error);
    throw new Error(`Failed to generate draft: ${error.message}`);
  }
}

/**
 * Generates a reply letter response. Supports text context and uploaded binary documents (Multimodal).
 * @param {string} apiKey - Gemini API Key.
 * @param {string|Object} incomingLetter - Plain text or a file representation (with buffer/arrayBuffer and mimeType).
 * @param {string} responsePoints - Key points to address.
 * @param {string} tone - Letter tone.
 */
export async function generateReply(apiKey, incomingLetter, responsePoints, tone) {
  const genAI = getGeminiClient(apiKey);

  if (!responsePoints || !responsePoints.trim()) {
    throw new Error("Key response points are required to generate a reply.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `${REPLY_SYSTEM_PROMPT}

SPECIFICATIONS:
- Response Points to address: ${responsePoints}
- Reply Tone: ${tone || "Formal"}`;

    const contentParts = [];

    // Multimodal handling for Cloudflare Worker environment (using standard ArrayBuffer/File)
    if (incomingLetter && typeof incomingLetter === "object" && (incomingLetter.buffer || incomingLetter.arrayBuffer)) {
      const mimeType = incomingLetter.mimetype || incomingLetter.type;
      
      // Extract arrayBuffer and convert it to base64
      const buffer = incomingLetter.buffer || await incomingLetter.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");

      contentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      contentParts.push({
        text: `${prompt}\n\nPlease analyze the attached incoming document (MIME type: ${mimeType}) and generate the structured JSON reply letter now.`
      });
    } else {
      // Plain text representation fallback
      const letterText = typeof incomingLetter === "string" ? incomingLetter : JSON.stringify(incomingLetter);
      contentParts.push({
        text: `${prompt}\n\nHere is the incoming letter content:\n---\n${letterText}\n---\n\nPlease generate the structured JSON reply letter now.`
      });
    }

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const jsonText = response.text().trim();
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error in generateReply service:", error);
    throw new Error(`Failed to generate reply: ${error.message}`);
  }
}

/**
 * Generates only the body paragraphs of an official letter.
 * @param {string} apiKey - Gemini API Key.
 * @param {string} subject - Subject / Context of the letter.
 * @param {string} style - Paragraph tab style (concise, urgent, professional, legal).
 * @param {string} letterType - Type of document (Memo, Show Cause, etc.).
 * @param {string} tone - Dynamic tone preference.
 */
export async function generateBodyParagraphs(apiKey, subject, style, letterType, tone) {
  const genAI = getGeminiClient(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert government administrator assistant. Draft only the main body paragraphs of an official letter based on the following:
- Document Type: ${letterType || "General Memo"}
- Subject/Context: ${subject}
- Communication Tone: ${tone || "Formal"}
- Style Variant: ${style.toUpperCase()}

STYLE GUIDELINES FOR THE STYLE VARIANT:
- CONCISE: Extremely direct, short, to-the-point sentences with zero filler.
- URGENT: Demands immediate attention/action, emphasizes strict deadlines or critical timelines.
- PROFESSIONAL: Balanced, polite but firm, highly polished bureaucratic standard formatting.
- LEGAL: Cites administrative guidelines, departmental codes, or compliance procedures with formal authority.

CRITICAL REQUIREMENT:
Generate ONLY the body paragraphs text itself.
- Do NOT output any Letterhead, Memo No, Dates, "To", "From", Salutations ("Sir", "Dear", etc.), Signatures, Enclosures, or Copy Distribution.
- Output 1 to 3 paragraphs separated by double newlines.
- Return ONLY the clean plain text paragraphs without any markdown bold headers, quotes, or JSON wrappers. Just return raw text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error in generateBodyParagraphs service:", error);
    throw new Error(`Failed to generate body paragraphs: ${error.message}`);
  }
}
