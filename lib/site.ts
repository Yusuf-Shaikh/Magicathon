export const siteConfig = {
  name: "cursed.ai",
  tagline: "The meme maker that doesn't suck.",
  description:
    "Drop in any image. A vision model riffs on what's actually in the photo and hands you six memes worth sharing.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/your-org/your-repo",
    twitter: "https://x.com/your-handle",
  },
} as const;

export type SiteConfig = typeof siteConfig;
