import { generateDraft, generateReply } from "./geminiService.js";
import fs from "fs";
import path from "path";

// Extremely lightweight, zero-dependency .env parser
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (err) {
    console.error("Warning: Could not read .env file.", err);
  }
}

async function runTests() {
  loadEnv();

  console.log("==================================================");
  console.log(" SERVERLESS OFFICE LETTER ASSISTANT - CLI TEST");
  console.log("==================================================\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    console.error("❌ ERROR: GEMINI_API_KEY is not configured in the .env file.");
    console.log("Please populate the GEMINI_API_KEY inside your .env file.");
    console.log("Example:\nGEMINI_API_KEY=AIzaSy...\n");
    process.exit(1);
  }

  console.log("✅ Loaded GEMINI_API_KEY from .env");
  console.log("Testing letter drafting...\n");

  try {
    const draft = await generateDraft(
      apiKey,
      "Requesting budget approval of $15,000 for installing smart locks and facial recognition systems on departmental server rooms.",
      "Formal",
      "General Requisition"
    );
    console.log("✨ DRAFT REQUISITION GENERATED SUCCESSFULLY:\n");
    console.log(draft);
    console.log("\n--------------------------------------------------");
  } catch (error) {
    console.error("❌ Draft Requisition Test Failed:", error.message);
  }

  console.log("\nTesting letter reply responses...\n");
  try {
    const mockIncoming = `
    Ref: REQ/IT/2026/09
    To: Director, IT Division
    Subject: Requisition of facial recognition access logs.
    
    Please provide the digital log history for the server room access events between May 10th and May 20th for auditing.
    `;

    const reply = await generateReply(
      apiKey,
      mockIncoming,
      "Acknowledge the request. State that logs are classified under Protocol-9, but we will release the reports within 48 hours once Director-level clearance is authorized.",
      "Strict"
    );
    console.log("✨ REPLY LETTER GENERATED SUCCESSFULLY:\n");
    console.log(reply);
    console.log("\n==================================================");
  } catch (error) {
    console.error("❌ Reply Letter Test Failed:", error.message);
  }
}

runTests();
