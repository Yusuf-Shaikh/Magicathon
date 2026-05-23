"use client";

import { useEffect, useRef, useState } from "react";
import { REACTION_EMOJIS } from "@/lib/reaction-emojis";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ReactionsBarProps {
  memeId: string;
  initialCounts: Record<string, number>;
}

const STORAGE_PREFIX = "reacted:";

function loadReacted(memeId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + memeId);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function persistReacted(memeId: string, reacted: Set<string>) {
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + memeId,
      JSON.stringify([...reacted]),
    );
  } catch {
    // localStorage may be unavailable (private mode, etc.) — ignore
  }
}

export function ReactionsBar({ memeId, initialCounts }: ReactionsBarProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [reacted, setReacted] = useState<Set<string>>(new Set());
  // Tracks our own optimistic increments per emoji so realtime echoes don't double-count
  const pendingRef = useRef<Record<string, number>>({});

  // Hydrate localStorage state on mount (avoids SSR/CSR mismatch)
  useEffect(() => {
    setReacted(loadReacted(memeId));
  }, [memeId]);

  // Subscribe to live INSERTs on this meme's reactions
  useEffect(() => {
    const channel = supabase
      .channel(`reactions:${memeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reactions",
          filter: `meme_id=eq.${memeId}`,
        },
        (payload) => {
          const emoji = (payload.new as { emoji?: string }).emoji;
          if (typeof emoji !== "string") return;
          // If we already counted this one optimistically, swallow the echo
          if ((pendingRef.current[emoji] ?? 0) > 0) {
            pendingRef.current[emoji] -= 1;
            return;
          }
          setCounts((prev) => ({
            ...prev,
            [emoji]: (prev[emoji] ?? 0) + 1,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memeId]);

  const handleReact = async (emoji: string) => {
    if (reacted.has(emoji)) return;

    // Optimistic increment
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    const nextReacted = new Set(reacted);
    nextReacted.add(emoji);
    setReacted(nextReacted);
    persistReacted(memeId, nextReacted);
    pendingRef.current[emoji] = (pendingRef.current[emoji] ?? 0) + 1;

    try {
      const res = await fetch(`/api/memes/${memeId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || `Failed (${res.status})`);
      }
    } catch {
      // Roll back optimistic state on failure
      setCounts((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] ?? 1) - 1),
      }));
      const reverted = new Set(nextReacted);
      reverted.delete(emoji);
      setReacted(reverted);
      persistReacted(memeId, reverted);
      pendingRef.current[emoji] = Math.max(
        0,
        (pendingRef.current[emoji] ?? 1) - 1,
      );
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {REACTION_EMOJIS.map((emoji) => {
        const count = counts[emoji] ?? 0;
        const isReacted = reacted.has(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReact(emoji)}
            disabled={isReacted}
            aria-label={`React with ${emoji}${count ? ` (${count})` : ""}`}
            className={cn(
              "group relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-150 active:scale-95",
              isReacted
                ? "border-acid/50 bg-acid/15 text-acid"
                : "cursor-pointer border-foreground/10 bg-card/40 backdrop-blur hover:-translate-y-0.5 hover:border-acid/40 hover:bg-card/60",
            )}
          >
            <span className="text-lg leading-none">{emoji}</span>
            {count > 0 && (
              <span
                key={count}
                className="animate-in zoom-in-75 text-xs font-medium tabular-nums duration-200"
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
