/**
 * Resolve the public URL of the site at server-render time.
 * Priority:
 *   1. NEXT_PUBLIC_APP_URL  — explicit override (set this in Vercel env if you want)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — stable production URL on Vercel
 *   3. VERCEL_URL           — current deployment URL (preview/branch deploys)
 *   4. http://localhost:3000 — local dev fallback
 */
function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "cursed.ai",
  tagline: "The meme maker that doesn't suck.",
  description:
    "Drop in any image. A vision model riffs on what's actually in the photo and hands you six memes worth sharing.",
  url: resolveBaseUrl(),
  links: {
    github: "https://github.com/your-org/your-repo",
    twitter: "https://x.com/your-handle",
  },
} as const;

export type SiteConfig = typeof siteConfig;
