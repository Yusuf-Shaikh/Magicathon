# Magicathon — AI SaaS Starter

A production-ready Next.js 15 starter for shipping AI products at hackathon speed.

**Stack:** Next.js App Router · TypeScript · Tailwind · shadcn/ui · Clerk · Supabase · Framer Motion · Vercel

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# fill in Clerk + Supabase keys

# 3. Dev
npm run dev
```

Then open <http://localhost:3000>.

---

## Required environment variables

| Var | Source |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings (server-only) |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Bucket name, e.g. `uploads` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Pick a provider for `lib/ai.ts` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` in dev |

See `.env.example` for the full list.

---

## Folder structure

```
app/
  (auth)/
    layout.tsx
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  (dashboard)/
    dashboard/
      layout.tsx           # Clerk-protected
      page.tsx             # Overview
      loading.tsx
      ai/                  # AI Studio
      uploads/             # File uploads
      settings/
  api/
    health/route.ts
    generate/route.ts      # POST → AI generate
    upload/route.ts        # POST multipart → Supabase Storage
    protected/me/route.ts
  layout.tsx
  page.tsx                 # Landing
  error.tsx
  not-found.tsx
  globals.css

components/
  ui/                      # shadcn primitives
  shared/                  # logo, motion, uploader, gradient, ...
  dashboard/               # sidebar, navbar, page-header, stat-card, ...

lib/
  utils.ts                 # cn, formatBytes, sleep, absoluteUrl
  api.ts                   # ok / fail / handler / api fetcher
  ai.ts                    # provider adapter (swap inside)
  env.ts                   # zod-validated env
  site.ts                  # site config
  storage.ts               # browser + server upload helpers
  supabase/{client,server,admin}.ts

hooks/
  use-upload.ts
  use-toast.ts
  use-media-query.ts

utils/
  format.ts
  fetcher.ts

types/
  index.ts
  database.ts              # replace with `supabase gen types`

middleware.ts              # Clerk route protection
```

---

## What's wired

- **Auth** — Clerk `clerkMiddleware` protects `/dashboard/**` and `/api/protected|upload|generate/**`. Sign-in / sign-up pages mounted at `/sign-in` and `/sign-up`.
- **Supabase** — three clients: browser (`@supabase/ssr`), server (cookie-aware), admin (service-role). Storage helpers in `lib/storage.ts`.
- **UI** — shadcn primitives + a gradient/glass dark theme. Sidebar collapses to a Sheet on mobile.
- **Uploads** — `<FileUploader />` (drag-and-drop, preview, progress) backed by the `useUpload` hook. Also a server route at `POST /api/upload` for trusted uploads.
- **AI** — `POST /api/generate` validates with zod, delegates to `lib/ai.ts`. Swap the stub for OpenAI / Anthropic / Vercel AI SDK.
- **Motion** — `FadeIn`, `StaggerChildren`, `PageTransition` ready to wrap any element.
- **API** — uniform `{ ok, data }` / `{ ok: false, error }` envelope with a typed `api<T>()` client fetcher.

---

## Adding a new shadcn component

`components.json` is preconfigured. To add another:

```bash
npx shadcn@latest add <name>
```

---

## Deploy to Vercel

```bash
# Option A — CLI
npx vercel

# Option B — Git
# push to GitHub, import on https://vercel.com/new
```

Set the env vars from `.env.example` in **Project Settings → Environment Variables**. Add `NEXT_PUBLIC_APP_URL` to your production URL. The included `vercel.json` pins the framework to Next.js — nothing else required.

After Clerk is connected, add your production domain in the Clerk dashboard.

---

## Local commands

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## Extending

- **Database schema** — run `supabase gen types typescript --project-id <id> > types/database.ts`, then pass `Database` to the Supabase clients as a generic.
- **AI provider** — replace the stub in `lib/ai.ts`. The route already enforces auth + zod validation.
- **Background jobs** — drop in Trigger.dev / Inngest / QStash; the API envelope works as-is.
- **Billing** — wire Stripe Checkout into `/dashboard/billing`; gate features by Clerk metadata.
