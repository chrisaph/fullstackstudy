# StackLedger

A self-guided full-stack developer learning tracker built with React, Vite, and Tailwind CSS.

## Run locally

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

## Deploy to Netlify

Import this repository in Netlify. The included `netlify.toml` runs `npm run build`, publishes `dist`, and configures SPA fallback routing. Set these site environment variables to enable cloud sync:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (the Supabase publishable/anon key; never use a service-role key here)

Redeploy after setting the variables. Without them, the app continues to save progress in the current browser.

## Configure Supabase sync

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor.
2. Add the project URL and publishable/anon key to Netlify's environment variables.
3. In Supabase Authentication, configure the allowed site URL and redirect URLs for your Netlify domain.
4. Create an account in the app footer. The first sign-in uploads the current browser's progress; later changes sync to that account and restore on another device.

The `user_data` table has row-level security enabled. Each authenticated account can access only its own row.
