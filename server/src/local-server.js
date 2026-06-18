import { serve } from "@hono/node-server";
import app from "./index.js";
import fs from "fs";
import path from "path";

// Zero-dependency .env loader for local Node.js environment
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.trim().startsWith('"') && value.trim().endsWith('"')) {
          value = value.trim().substring(1, value.trim().length - 1);
        } else if (value.trim().startsWith("'") && value.trim().endsWith("'")) {
          value = value.trim().substring(1, value.trim().length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (err) {
  console.warn("Warning: Could not read .env file for local development.", err);
}

const port = 8787;
console.log("==================================================");
console.log(` E-OFFICE ASSISTANT — LOCAL RUNTIME SERVER`);
console.log(` Listening on: http://localhost:${port}`);
console.log(` API Endpoint: http://localhost:${port}/api/letters`);
console.log("==================================================\n");

// Start serving the Hono app natively on Node
serve({
  fetch: app.fetch,
  port
});
