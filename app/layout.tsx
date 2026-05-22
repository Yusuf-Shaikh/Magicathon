import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#a855f7", colorBackground: "#0a0a0c" },
        elements: {
          card: "bg-card/80 backdrop-blur-xl border border-white/10",
          formButtonPrimary:
            "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 text-white hover:brightness-110",
        },
      }}
    >
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable} dark`}
        suppressHydrationWarning
      >
        <body className="min-h-dvh font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
