export const siteConfig = {
  name: "Magicathon",
  tagline: "Sign in to continue.",
  description: "Magicathon.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/your-org/your-repo",
    twitter: "https://x.com/your-handle",
  },
} as const;

export type SiteConfig = typeof siteConfig;
