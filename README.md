# cursed.ai

> The meme maker that doesn't suck. Drop in any image, get six AI-written memes specific to what's in it, edit them in a canvas, share them with anyone — no signup, no install.

Built for the Magicathon hackathon. Live at <https://magicathon-nu.vercel.app>.

---

## Table of contents

- [What it is](#what-it-is)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [Project structure](#project-structure)
- [Architecture deep-dives](#architecture-deep-dives)
  - [The AI layer](#the-ai-layer-libai)
  - [The template system](#the-template-system-componentstemplatestsx)
  - [The editor](#the-editor-componentsmeme-editor)
  - [Save → share → react flow](#save--share--react-flow)
  - [State persistence](#state-persistence)
- [Design system](#design-system)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Known limitations](#known-limitations)
- [What's next](#whats-next)

---

## What it is

cursed.ai is an end-to-end meme-creation tool. The flow:

1. **Upload** a photo — selfie, pet, screenshot, reaction shot, anything
2. **Generate** — a vision-capable LLM looks at what's actually in the image and writes six meme concepts tailored to it
3. **Pick & edit** — six live previews, click any one to open a canvas editor with drag-text, font/color/size/shadow controls, mobile-friendly gestures
4. **Save & share** — exports a PNG, persists to Supabase Storage, and gives you a public URL
5. **React live** — anyone with the link can react with emoji; counts update in realtime across browsers

There's a leaderboard ranking memes by reaction count. No signup, no install, mobile-first. The app is authless by design — the **meme** is the primary entity, not the user.

---

## Features

- **Vision-aware meme generation** — the AI sees the uploaded image and writes captions referencing what's actually in it. Banned phrases ("when Monday hits", "POV:") are explicitly excluded in the system prompt. Each concept's `title` is image-specific (e.g. "trade offer: stress for serotonin").
- **6 reusable meme templates** rendered as React components with container-query-scaled typography:
  - `top-bottom` (classic Impact two-caption)
  - `drake` (reject/approve with grayscale + saturated image halves)
  - `expanding-brain` (4 escalating filtered image rows)
  - `two-button` (sweating decision)
  - `distracted-boyfriend` (3 pill labels)
  - `this-is-fine` (warm gradient + speech bubble)
- **Canvas editor (Konva)** with:
  - Click-to-edit captions
  - Drag-to-reposition with fractional coordinates (resolution-independent)
  - Font (Impact / Comic Sans / Serif / Mono), size, fill color, outline color + width, shadow toggle
  - PNG export at 2× resolution
- **Camera capture** — `getUserMedia` modal on desktop, native camera capture on mobile via `<input capture>`
- **Image compression on upload** — files are downscaled to 1024px JPEG @ 0.85 quality before anything else touches them
- **Anonymous reactions** with 6 emoji set, optimistic UI + Supabase Realtime live updates, `localStorage` anti-spam
- **Leaderboard** ranked by total reactions with medal styling for top 3
- **Creator vs viewer share page** — the person who created the meme sees "back to editor" / "make another" CTAs; everyone else sees a "create your meme now" conversion CTA
- **Brutalist editorial design** — alternating ink (dark) and paper (cream) sections, acid lime accent, rotating ✦ decorations, marquee ticker, mono caps eyebrow labels
- **State persistence** — sessionStorage keeps your generated set across refresh + back-navigation from share page
- **Mobile-first responsive** — verified down to 360px, full layout at 1440px+

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** (App Router, server components) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v3.4** with custom palette via CSS variables, `tailwindcss-animate` |
| Fonts | **Bricolage Grotesque** (display) · **Space Grotesk** (body) · **JetBrains Mono** (mono), all via `next/font/google` |
| Canvas | **Konva 10.x** (vanilla, no `react-konva`) for the editor |
| Database / storage / realtime | **Supabase** (Postgres, Storage, Realtime channels) |
| AI provider | **OpenRouter** (provider-agnostic LLM router, defaults to Claude Sonnet 4 with image input) |
| Auth | **Clerk** installed but **not used** — app is intentionally authless. Routes still mount under `/(auth)` for future re-enablement. |
| Deployment | **Vercel** (production at `magicathon-nu.vercel.app`) |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your keys
cp .env.example .env.local
# edit .env.local — see Environment variables section below

# 3. Run the Supabase SQL (see Supabase setup section)

# 4. Start dev server
npm run dev
```

Open <http://localhost:3000>.

---

## Environment variables

Put these in `.env.local` for local dev, or in **Vercel Project Settings → Environment Variables** for production.

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | yes | OpenRouter API key. Get one at <https://openrouter.ai/keys> |
| `OPENROUTER_MODEL` | no | Model identifier. Defaults to `anthropic/claude-sonnet-4`. Other tested values: `openai/gpt-4o`, `openai/gpt-4o-mini`, `google/gemini-2.5-flash` |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL (e.g. `https://abc.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon (public) API key |
| `NEXT_PUBLIC_APP_URL` | no | Base URL used for share links + OG metadata. If not set, falls back to `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost:3000`. Set explicitly to lock the share URL to a custom domain. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | no | Clerk is installed but unused. Provide an empty string if you want to silence the warning. |
| `CLERK_SECRET_KEY` | no | Same as above. |
| `GEMINI_API_KEY` | no | Legacy — only used if you swap `lib/ai/index.ts` back to the Gemini provider (still in the repo as `lib/ai/gemini.ts`). |

The URL cascade for `siteConfig.url` lives in `lib/site.ts`. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is set automatically to the stable production hostname, so share URLs work out of the box without you setting `NEXT_PUBLIC_APP_URL`.

---

## Supabase setup

Run this in **Supabase Dashboard → SQL Editor**. Safe to re-run; all `create` statements use `if not exists` semantics where the SQL allows it.

### 1. Memes table

```sql
create table public.memes (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  template text not null,
  captions jsonb not null,
  title text,
  created_at timestamptz not null default now()
);

alter table public.memes enable row level security;

create policy "memes are publicly readable"
  on public.memes for select using (true);

create policy "anyone can create memes"
  on public.memes for insert with check (true);
```

> The `title` column was added later — the API route falls back gracefully if it's missing (catches PostgREST `42703` and re-inserts without `title`).

### 2. Storage bucket

```sql
insert into storage.buckets (id, name, public)
  values ('memes', 'memes', true)
  on conflict (id) do update set public = excluded.public;

create policy "public read memes bucket"
  on storage.objects for select
  using (bucket_id = 'memes');

create policy "anyone can upload to memes bucket"
  on storage.objects for insert
  with check (bucket_id = 'memes');
```

### 3. Reactions table + realtime

```sql
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  meme_id uuid not null references public.memes(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now()
);

create index reactions_meme_id_idx on public.reactions (meme_id);

alter table public.reactions enable row level security;

create policy "reactions are publicly readable"
  on public.reactions for select using (true);

create policy "anyone can add a reaction"
  on public.reactions for insert with check (true);

-- Enable realtime broadcasts so the share page picks up live reaction counts
alter publication supabase_realtime add table public.reactions;
```

### Verifying

After running the SQL:

- **Table Editor** → `memes` exists with columns `id, image_url, template, captions, title, created_at`
- **Table Editor** → `reactions` exists with `meme_id` foreign-keyed to `memes.id`
- **Storage** → `memes` bucket exists and is marked **Public**
- **Database → Replication** → the `supabase_realtime` publication lists `reactions` under its tables

---

## Project structure

```
app/
  api/
    memes/
      [id]/reactions/route.ts    # POST anonymous reaction
      generate/route.ts          # POST image → 6 meme concepts (calls AI layer)
      route.ts                   # POST save meme (upload PNG + insert row)
  m/[id]/
    page.tsx                     # Public share page
    not-found.tsx                # Custom 404 for missing memes
  leaderboard/page.tsx           # Ranked grid of top memes
  create/page.tsx                # Redirect to / (legacy URL)
  (auth)/                        # Clerk sign-in/sign-up routes (installed, unused)
  layout.tsx                     # Root layout, fonts, ClerkProvider, Navbar
  page.tsx                       # Homepage: hero + marquee + upload + trending + footer
  globals.css                    # CSS variables, paper-section theme, hero-glow, hero-grid, marquee keyframes, meme-font utility
  error.tsx
  not-found.tsx

components/
  meme-editor/
    editor-canvas.tsx            # Vanilla Konva stage: image + decorations + draggable Konva.Text nodes
    editor-modal.tsx             # Modal shell with header, save flow, dark-section theme override
    text-edit-bar.tsx            # Bottom toolbar: instructions + caption text + font/size/color/outline/shadow controls
  templates.tsx                  # 6 meme template React components + TEMPLATE_COMPONENTS registry
  meme-studio.tsx                # Orchestrator: state, sessionStorage persistence, generate/retry, layout switch
  meme-card.tsx                  # Single concept card with edge-to-edge meme + "match XX%" footer
  upload-zone.tsx                # Dropzone + camera trigger + preview footer (Replace/Remove)
  camera-modal.tsx               # Webcam capture via getUserMedia
  reactions-bar.tsx              # Emoji buttons with optimistic UI + Supabase Realtime
  share-actions.tsx              # Circle copy/share icon buttons
  share-call-to-actions.tsx      # Creator vs viewer CTA component (uses sessionStorage to detect)
  scroll-to-top.tsx              # Forces scroll-top on share page mount
  back-to-editor-link.tsx        # (legacy — consolidated into share-call-to-actions)
  navbar.tsx                     # Sticky top nav: brand + Create + Leaderboard
  marquee.tsx                    # Auto-scrolling phrase ticker
  ui/
    button.tsx                   # shadcn primitive (legacy — most CTAs are bare <button> now)

lib/
  ai/
    index.ts                     # Public surface — generateMemeConcepts(dataUrl)
    openrouter.ts                # Active provider — OpenRouter REST + JSON output cleaning
    gemini.ts                    # Dormant Gemini provider (kept as fallback)
    prompt.ts                    # System prompt + user prompt strings
  templates/
    editor-config.ts             # Per-template caption slot positions (fractions of stage)
    konva-templates.ts           # Per-template background drawing functions for the Konva editor
    slot-edit.ts                 # SlotEdit type + font options + factory
  meme-schema.ts                 # Domain types — MemeTemplate, MemeConcept, slot labels/counts
  image.ts                       # compressFile, fileToDataUrl, fileToCompressedDataUrl
  memes.ts                       # fetchRankedMemes, fetchStats
  reaction-emojis.ts             # Allowed emoji set + validator
  supabase.ts                    # Supabase JS client (anon key, used both client + server)
  site.ts                        # siteConfig + base URL resolution cascade
  utils.ts                       # cn, formatBytes, sleep, absoluteUrl

middleware.ts                    # clerkMiddleware (passthrough — no routes protected)
tailwind.config.ts               # Palette colors mapped to CSS vars + font family stacks
.env.example                     # Documented env vars
```

---

## Architecture deep-dives

### The AI layer (`lib/ai/`)

The architecture follows an explicit provider-abstraction rule: **callers import from `@/lib/ai` only, never from a provider file**. This lets us swap providers in one line.

- `lib/ai/index.ts` exports `generateMemeConcepts(imageDataUrl: string): Promise<MemeConcept[]>` — the only public function.
- `lib/ai/openrouter.ts` implements it via `fetch` to OpenRouter's OpenAI-compatible endpoint. No SDK dependency. Sends the system prompt + user message + image data URL as `image_url` content block.
- `lib/ai/gemini.ts` is the legacy Gemini implementation, kept for fallback. The Gemini SDK uses native structured outputs via `responseSchema`.
- `lib/ai/prompt.ts` is provider-agnostic — same prompt, any model.

**JSON parsing is defensive** — Claude often wraps JSON in markdown code fences or adds a preamble like "Here's the JSON:". `openrouter.ts` includes an `extractJson` helper that strips fences and falls back to slicing from the first `{` to the last `}` before parsing.

**The prompt** (`lib/ai/prompt.ts`) is explicit about:
- Persona: "elite meme creator with the comedic instincts of a chronically online Gen Z poster"
- Required output schema with constrained `template` field (must be one of 6 renderable templates) but free-form `title`, `humorStyle`, `reasoning`
- Banned patterns ("when Monday hits", "me trying to", "POV:", etc.)
- Caption style rules (lowercase, no period, short)
- Variety mandate across the 6 concepts

To swap providers, edit `lib/ai/index.ts`:
```ts
import { generate as openrouterGenerate } from "./openrouter";
// import { generate as geminiGenerate } from "./gemini";

export async function generateMemeConcepts(imageDataUrl: string) {
  return openrouterGenerate(imageDataUrl);
}
```

### The template system (`components/templates.tsx`)

Each of the 6 templates is a React component with a uniform signature:

```ts
interface TemplateProps {
  userImage: string;          // data URL of the user's compressed image
  captions: string[];          // length matches TEMPLATE_SLOT_COUNT[template]
}
```

They render the user's image edge-to-edge with caption overlays positioned absolutely. Typography uses container-query units (`text-[clamp(0.5rem,3cqw,1.5rem)]`) so text scales with the card it's in — small in the grid, large in the editor preview.

The `TEMPLATE_COMPONENTS` registry maps the AI's chosen `template` string to the corresponding React component. Used by `MemeCard` (grid preview) and `MemeStudio` (concept rendering).

Konva-specific drawing logic for the editor lives in `lib/templates/konva-templates.ts` — separate from the React components because Konva needs imperative drawing (`new Konva.Rect`, `new Konva.Image`, etc.). The two render paths intentionally diverge in detail level: React templates have CSS filters/gradients/emojis; Konva versions reproduce the same vibe imperatively.

### The editor (`components/meme-editor/`)

The editor is **vanilla Konva**, not `react-konva` — that library reaches into React internals (`__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner`) that React 18.3+ moved, breaking it. Vanilla Konva via `useRef` + `useEffect` is more verbose but stable on any React version.

**Slot edits** (`lib/templates/slot-edit.ts`) are the per-slot styling overrides:
```ts
interface SlotEdit {
  fontFamily: string;          // from 4 system fonts
  fontSizeScale: number;       // 1.0 = template default
  fill: string;                // hex
  stroke: string | null;       // hex or null = no outline
  strokeWidthScale: number;
  shadow: boolean;
  fractionX: number | null;    // null = use template anchor; else 0..1 of stage width
  fractionY: number | null;
}
```

All numeric values are **scales** or **fractions** — never absolute pixels — so edits stay correct when the canvas resizes (mobile vs. desktop vs. high-DPI export).

The editor has 6 `useEffect` hooks split by responsibility (resize, stage lifecycle, image load + background, text node creation, slot edit sync, selection visuals). The bottom toolbar (`text-edit-bar.tsx`) is the empty-state instruction card + the full editing controls (font, size, fill, stroke, shadow, position reset).

**Modal theming**: The modal lives inside whatever section it was opened from. On the homepage that's the paper-themed upload section, which would cascade light-mode CSS variables into the modal. To prevent that, the modal root has `.dark-section` which redefines `--background`, `--card`, etc. back to dark theme regardless of ancestry.

**PNG export**: `Konva.Stage.toDataURL({ pixelRatio: 2 })` produces a ~1200×1200 image. The selection rect is briefly hidden during export so it doesn't bake into the saved PNG.

### Save → share → react flow

1. **Editor exports PNG** via `useImperativeHandle`'s `exportPng()` method
2. **Client POSTs** `{ template, title, captions, imageDataUrl }` to `/api/memes`
3. **API route** validates, decodes base64, uploads to Supabase Storage bucket `memes/<uuid>.png`, inserts a `memes` row, returns the new id
4. **Client redirects** to `/m/<id>`
5. **Share page** (server component) fetches the meme + initial reaction counts, renders the image + a reactions bar + share buttons + creator/viewer CTAs

**Reactions** (`components/reactions-bar.tsx`):
- 6 emoji buttons (`😂 💀 🔥 🤡 💯 🥲`)
- Optimistic increment on click + a pending-counter dedupe (so the Supabase realtime echo of your own insert doesn't double-count)
- `localStorage` tracks `reacted:<meme_id>` so the same browser can't react with the same emoji twice
- Server-side validation: only allowlisted emojis, meme_id must be a valid UUID

**Creator vs viewer detection** (`components/share-call-to-actions.tsx`):
- After save, `editor-modal.tsx` stamps `lastSavedMemeId` into the sessionStorage state
- On the share page mount, the component reads sessionStorage and compares `lastSavedMemeId === current memeId`
- Match → creator → renders "← back to editor" + "✨ make another" outline pills
- No match → viewer → renders a single bold acid CTA "create your meme now →"
- Creator path also **prefetches the editor chunk** (`void import("@/components/meme-editor/editor-modal")`) so clicking back-to-editor opens instantly without a chunk-load delay

### State persistence

The studio state — `{ concepts, imageDataUrl, selectedIndex, lastSavedMemeId }` — lives in `sessionStorage` under key `cursed-studio-state`. Why sessionStorage:

- **Per-tab**: doesn't leak across unrelated browsing sessions
- **Survives refresh**: hitting Cmd-R after generating memes restores the 6 cards
- **Survives navigation**: clicking "back to editor" from a share page restores everything
- **Cleared on Remove**: explicit reset wipes it

The persist effect in `meme-studio.tsx` **merges** with existing storage instead of overwriting, so fields set externally (like `lastSavedMemeId` written by the editor modal after a successful save) aren't clobbered by subsequent state syncs.

Restoration runs **unconditionally on mount**. The `?continue=1` URL param is an *additional* signal that triggers (a) automatically reopening the editor for the last-edited meme and (b) smooth-scrolling to the `#upload` section. Without the param, restoration still happens but the editor stays closed — that's the refresh case.

---

## Design system

### Palette

CSS variables in HSL channels (so Tailwind opacity modifiers like `bg-acid/20` work):

| Token | HSL | Hex | Purpose |
|---|---|---|---|
| `--ink` | `60 9% 4%` | `#0c0c0a` | Near-black background |
| `--ink-2` | `60 9% 9%` | `#161613` | Card background on dark |
| `--paper` | `45 35% 93%` | `#f4f1e8` | Cream background |
| `--paper-2` | `43 33% 89%` | `#ece7d8` | Card background on cream |
| `--acid` | `75 86% 63%` | `#c6f24e` | Brand accent (lime) |
| `--acid-deep` | `75 100% 41%` | `#9fd400` | Darker lime for paper-bg buttons |
| `--hot` | `9 100% 60%` | `#ff5436` | Secondary accent (orange), used for destructive + paper-section emphasis |

Exposed as Tailwind utilities: `bg-acid`, `text-paper`, `border-acid-deep/40`, etc.

### Typography

- **Display** (`var(--font-display)`): Bricolage Grotesque — h1/h2/h3 by default. Slightly tightened letter-spacing (`-0.015em`) for magazine feel.
- **Body** (`var(--font-body)`): Space Grotesk — applied via `body { font-family }`.
- **Mono** (`var(--font-mono)`): JetBrains Mono — used for eyebrow labels (`font-mono text-[11px] uppercase tracking-[0.3em]`), badges, template names, button labels.
- **Meme caption font** (`.meme-font` utility): Impact stack — `Impact, Anton, Haettenschweiler, 'Franklin Gothic Bold', 'Arial Black', sans-serif`. Loaded inside template renders only.

### Section theming

The homepage alternates between **ink** (dark) and **paper** (cream) sections. The `.paper-section` class (in `globals.css`) swaps CSS variables (`--background`, `--card`, `--foreground`, `--muted-foreground`, `--border`) to light-mode values within that section. Components using semantic Tailwind utilities (`bg-card`, `text-muted-foreground`) automatically adapt.

The `.dark-section` class is the inverse — used on the editor modal to override the paper section's variables and pin the modal to dark theme regardless of where in the DOM tree it mounts.

### Button language

All interactive buttons follow one of two patterns:

**Outline pill (on dark sections — share page, reactions, editor)**:
- Base: `border border-acid/40 bg-acid/10 text-acid`
- Hover: `hover:border-acid hover:bg-acid hover:text-ink`

**Solid pill (on paper section — upload zone)**:
- Base: `bg-acid-deep text-ink font-semibold` (acid-deep has enough contrast on cream)
- Hover: `hover:bg-acid hover:-translate-y-0.5 hover:shadow-md hover:shadow-acid/40`

Both patterns use color-inversion on hover for clear interactive feedback.

### Decorative motifs

- `.hero-glow` — acid radial gradient bloom from the top of a section
- `.hero-grid` — faint paper-toned grid lines fading from the top via radial mask
- Rotating ✦ stars in hero corners (acid + hot, different speeds, different directions)
- Auto-scrolling marquee with ✦ separators between phrases
- Mono caps eyebrow labels with section numbering (`01 / Drop a photo`)

---

## Deployment

The project deploys to Vercel out of the box. The included `vercel.json` pins the framework to Next.js — nothing else is required.

### Steps

1. Push to GitHub
2. Import on <https://vercel.com/new>
3. Set **Environment Variables** in Project Settings:
   - `OPENROUTER_API_KEY` (required)
   - `NEXT_PUBLIC_SUPABASE_URL` (required)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required)
   - `NEXT_PUBLIC_APP_URL` (optional but recommended — your stable production URL, e.g. `https://magicathon-nu.vercel.app`)
   - `OPENROUTER_MODEL` (optional override)
4. Deploy

### Custom domain

If you switch to a custom domain (`cursed.ai`?), update `NEXT_PUBLIC_APP_URL` in Vercel env vars and redeploy. The site config cascade picks it up automatically — no code change needed. Until you do, share links use Vercel's auto-detected production URL (`VERCEL_PROJECT_PRODUCTION_URL`).

---

## Scripts

```bash
npm run dev        # Next dev server on http://localhost:3000
npm run build      # Production build
npm run start      # Serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

---

## Known limitations

These are deliberate trade-offs for hackathon scope, not bugs:

- **Saves create new memes, never update** — clicking "save & share" twice after editing produces two distinct meme records with two URLs. The original is never overwritten. Intentional simplicity; could be revisited with an "edit in place" flow.
- **`slotEdits` aren't persisted** — font/size/color/position tweaks live in modal-local state. Closing and reopening the editor on the same concept resets to template defaults. The *saved PNG* captures all tweaks correctly; only the editing state is ephemeral.
- **No anti-spam beyond localStorage** — clearing site data lets you re-react. Acceptable for hackathon; a real product would use rate limiting + cookies or session IDs.
- **Original image not stored** — only the rendered PNG is saved. "Back to editor" restores the studio from sessionStorage (per-tab), but if the tab closes, the original image is gone. Re-editing a saved meme isn't possible from another browser.
- **Realtime is bursty** — Supabase Realtime delivers each reaction insert individually. Fine for a single popular meme but doesn't batch.
- **No image moderation** — uploads go straight to the AI. If hosted publicly long-term, NSFW filtering should be added.
- **Clerk is installed but unused** — sign-in/sign-up routes exist under `app/(auth)/` for future re-enablement. Removing the dependency would shave ~80KB from the bundle.

---

## What's next

Ordered by impact-to-effort:

- **Customize `cursed.ai` domain** — buy + point at Vercel, update `NEXT_PUBLIC_APP_URL`
- **Persist `slotEdits` to sessionStorage** — so back-to-editor restores fonts/colors/positions too
- **Store original image alongside rendered PNG** — enables full re-editing of saved memes; add a `source_image_url` column to `memes`
- **"I'm feeling lucky"** — one-click button that uploads + generates + auto-picks the highest-confidence concept + saves, in one shot
- **Remix** — `/?remix=<meme_id>` loads someone else's meme as input for a new generation pass
- **Animated GIF templates** — short-loop GIFs (drake nod, mandalorian baby yoda sip)
- **Reaction-weighted ranking** — leaderboard ranking factors in trending velocity (reactions in the last hour) instead of just total
- **Background removal** — `@imgly/background-removal` or similar to drop subjects onto new scenes
- **Sticker layer** — drag-and-drop emoji or PNG stickers in the editor
- **Server-side image moderation** — Supabase moderation queue or an external service before public visibility
- **Toast notification system** — replace the inline error banners with a proper toast queue
- **Production logging** — wire up Vercel Analytics + a real error tracker (Sentry, Highlight)

---

*Built end-to-end during the Magicathon hackathon.*
