"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MemeCard } from "@/components/meme-card";
import { UploadZone } from "@/components/upload-zone";
import { Button } from "@/components/ui/button";
import { fileToCompressedDataUrl } from "@/lib/image";
import type { MemeConcept } from "@/lib/meme-schema";
import { cn } from "@/lib/utils";

const EditorModal = dynamic(
  () => import("@/components/meme-editor/editor-modal"),
  { ssr: false },
);

const LOADING_PHRASES = [
  "analyzing your photo…",
  "writing the jokes…",
  "shopping for memes…",
  "almost there…",
];

export function MemeStudio() {
  const [concepts, setConcepts] = useState<MemeConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!loading) {
      setLoadingPhase(0);
      return;
    }
    const interval = window.setInterval(() => {
      setLoadingPhase((i) => Math.min(i + 1, LOADING_PHRASES.length - 1));
    }, 2500);
    return () => window.clearInterval(interval);
  }, [loading]);

  const generate = async (file: File) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    setConcepts([]);
    setLastFile(file);

    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setImageDataUrl(dataUrl);
      const res = await fetch("/api/memes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
        signal: ac.signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { concepts: MemeConcept[] };
      if (ac.signal.aborted) return;
      // Rank by confidence (highest first) so the best meme is top-left.
      // Stable sort preserves AI's original order on ties.
      const ranked = [...(data.concepts ?? [])].sort(
        (a, b) => b.confidence - a.confidence,
      );
      setConcepts(ranked);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setConcepts([]);
    setError(null);
    setLastFile(null);
    setImageDataUrl(null);
    setLoading(false);
    setSelectedIndex(null);
  };

  const retry = () => {
    if (lastFile) generate(lastFile);
  };

  const updateCaptions = (i: number, captions: string[]) => {
    setConcepts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, captions } : c)),
    );
  };

  const hasFile = lastFile !== null;
  const hasResults = loading || error || concepts.length > 0;

  return (
    <div className="flex w-full flex-col gap-8">
      <div
        className={cn(
          "w-full",
          hasFile && "lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6",
        )}
      >
        <UploadZone onFileAccepted={generate} onReset={handleReset} />

        {hasResults && (
          <section className="mt-6 flex flex-col space-y-4 lg:mt-0">
            <header>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {loading ? (
                  <span
                    key={loadingPhase}
                    className="animate-in fade-in slide-in-from-bottom-1 inline-block duration-300"
                  >
                    {LOADING_PHRASES[loadingPhase]}
                  </span>
                ) : (
                  <span>
                    Six fresh{" "}
                    <span className="text-gradient-brand">memes</span>
                  </span>
                )}
              </h2>
              {!loading && concepts.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap one to edit and share.
                </p>
              )}
            </header>

            {error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
                <p className="font-medium text-destructive">
                  Something went sideways.
                </p>
                <p className="mt-1 text-foreground/80">{error}</p>
                {lastFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={retry}
                  >
                    Try again
                  </Button>
                )}
              </div>
            )}

            {loading && <ConceptSkeletons />}

            {!loading && concepts.length > 0 && imageDataUrl && (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {concepts.map((c, i) => (
                  <MemeCard
                    key={i}
                    concept={c}
                    userImage={imageDataUrl}
                    index={i}
                    onClick={() => setSelectedIndex(i)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {selectedIndex !== null && imageDataUrl && concepts[selectedIndex] && (
        <EditorModal
          concept={concepts[selectedIndex]}
          userImage={imageDataUrl}
          onCaptionsChange={(captions) =>
            updateCaptions(selectedIndex, captions)
          }
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}

function ConceptSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-2xl border border-foreground/10 bg-card/40"
        />
      ))}
    </div>
  );
}
