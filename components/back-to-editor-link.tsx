"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STUDIO_STATE_KEY = "cursed-studio-state";

/**
 * Renders a "back to editor" link only when there's studio state to
 * restore in sessionStorage. Clicking navigates to /?continue=1 which
 * triggers MemeStudio's restoration effect.
 */
export function BackToEditorLink() {
  const [hasState, setHasState] = useState(false);

  useEffect(() => {
    try {
      setHasState(!!window.sessionStorage.getItem(STUDIO_STATE_KEY));
    } catch {
      setHasState(false);
    }
  }, []);

  if (!hasState) return null;

  return (
    <Link
      href="/?continue=1"
      className="inline-flex items-center gap-2 rounded-full border border-acid/40 bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-acid transition-colors hover:bg-acid/20"
    >
      ← back to editor
    </Link>
  );
}
