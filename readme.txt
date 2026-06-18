To run all three applications locally, open three separate terminals in the project's root directory and run the following commands:

1. Start the Backend API Server (Wrangler/Hono)
Run this command in the first terminal to start your local API server on http://localhost:8787:

bash
npm run dev:server
2. Start the User Frontend (Vite)
Run this command in the second terminal to start the user-facing application on http://localhost:3000:

bash
npm run dev:user
3. Start the Admin Frontend (Vite)
Run this command in the third terminal to start the admin dashboard portal on http://localhost:3001:

bash
npm run dev:admin




?? Important Next Steps
API URL configuration — The frontends currently proxy /api to localhost:8787 during local dev. For production, you'll need to update the frontend code to point API calls to your Worker's production URL (e.g., https://my-office-letter-app.<subdomain>.workers.dev).

Supabase redirect URLs — Add both https://e-office-user.pages.dev and https://e-office-admin.pages.dev to your Supabase Auth ? URL Configuration ? Redirect URLs.

Environment variables on Pages — You can set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Cloudflare dashboard under Pages ? Settings ? Environment Variables so they're injected at build time.