"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; label: string; isAnchor?: boolean }[] = [
  { href: "/#upload", label: "Create", isAnchor: true },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/70 backdrop-blur-xl">
      <nav className="flex h-14 w-full items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight transition-opacity hover:opacity-80 sm:text-xl"
        >
          <span className="text-gradient-brand">cursed.ai</span>
        </Link>
        <ul className="flex items-center gap-5 text-sm sm:gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive =
              !item.isAnchor &&
              (pathname === item.href ||
                pathname.startsWith(item.href + "/"));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "font-medium text-acid"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
