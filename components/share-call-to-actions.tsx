"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STUDIO_STATE_KEY = "cursed-studio-state";

interface ShareCallToActionsProps {
  memeId: string;
}

/**
 * Two-mode CTA block on the share page:
 * - Creator (sessionStorage's lastSavedMemeId matches this meme):
 *     ← back to editor + ✨ make another
 * - Viewer (no match — got here via shared link):
 *     create your meme now → (big primary CTA)
 *
 * Detection happens client-side from sessionStorage; pre-hydration the
 * component renders nothing to avoid an SSR/CSR mismatch and layout flash.
 */
export function ShareCallToActions({ memeId }: ShareCallToActionsProps) {
  const [isCreator, setIsCreator] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STUDIO_STATE_KEY);
      if (!raw) {
        setIsCreator(false);
        return;
      }
      const parsed = JSON.parse(raw) as { lastSavedMemeId?: string };
      const matches = parsed?.lastSavedMemeId === memeId;
      setIsCreator(matches);
      if (matches) {
        // Warm the editor chunk so back-to-editor opens with no visible delay.
        // Without this, the dynamic import (Konva needs ssr:false) only starts
        // downloading after navigation completes, and the user briefly sees
        // the hero before the modal mounts.
        void import("@/components/meme-editor/editor-modal");
      }
    } catch {
      setIsCreator(false);
    }
  }, [memeId]);

  if (isCreator === null) return null;

  if (isCreator) {
    return (
      <>
        <Link
          href="/?continue=1"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-acid/40 bg-acid/10 px-4 font-mono text-xs uppercase tracking-[0.2em] text-acid transition-colors hover:border-acid hover:bg-acid hover:text-ink"
        >
          ← back to editor
        </Link>
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-acid/40 bg-acid/10 px-4 font-mono text-xs uppercase tracking-[0.2em] text-acid transition-colors hover:border-acid hover:bg-acid hover:text-ink"
        >
          make another →
        </Link>
      </>
    );
  }

  // Non-creator viewer: same outline-pill style as creator buttons —
  // unified hover that flips to solid acid + ink text.
  return (
    <Link
      href="/"
      className="inline-flex h-9 items-center gap-2 rounded-full border border-acid/40 bg-acid/10 px-4 font-mono text-xs uppercase tracking-[0.2em] text-acid transition-colors hover:border-acid hover:bg-acid hover:text-ink"
    >
      create your meme now →
    </Link>
  );
}
