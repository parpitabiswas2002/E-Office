import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      // Directs API calls to the local Wrangler/Hono Worker during development
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: "dist", // Target folder served by Cloudflare Workers Assets
    emptyOutDir: true
  }
});
