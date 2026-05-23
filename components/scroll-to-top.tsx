"use client";

import { useEffect } from "react";

/**
 * Forces the document to scroll to top on mount, instantly.
 *
 * Needed because:
 *  - Next.js Link/router.push can preserve scroll position from the previous
 *    page; when the new page is shorter, the position clamps to its bottom.
 *  - Browser `history.scrollRestoration` can restore previously cached scroll
 *    on direct URL visits.
 *
 * Both cases land the user past their expected starting point. This component
 * resets that on mount and disables Next.js scroll restoration so refreshes
 * don't reintroduce the issue.
 */
export function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // CSS has `scroll-behavior: smooth` globally — temporarily override so
    // the jump is instant (otherwise the user sees a long scroll animation).
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    window.setTimeout(() => {
      root.style.scrollBehavior = prevBehavior;
    }, 0);
  }, []);
  return null;
}
