"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const ACCEPT_ATTR = ACCEPTED.join(",");

interface UploadZoneProps {
  onFileAccepted?: (file: File) => void;
  onReset?: () => void;
}

export function UploadZone({ onFileAccepted, onReset }: UploadZoneProps = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const acceptFile = (f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      setError("That file isn't a PNG, JPG, or WEBP.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`Image is ${formatBytes(f.size)} — keep it under 10 MB.`);
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    onFileAccepted?.(f);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    onReset?.();
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT_ATTR}
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) acceptFile(f);
        e.target.value = "";
      }}
    />
  );

  if (file && previewUrl) {
    return (
      <div className="w-full lg:h-full">
        <div className="relative flex aspect-square w-full flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-card/40 shadow-lg backdrop-blur-xl lg:aspect-auto lg:h-full">
          <div className="relative flex-1 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={file.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-foreground/10 bg-card/60 px-3 py-2">
            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
              {file.name}
            </p>
            <div className="flex shrink-0 gap-1.5">
              <Button variant="outline" size="sm" onClick={openPicker}>
                Replace
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                Remove
              </Button>
            </div>
          </div>
        </div>
        {hiddenInput}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative block w-full overflow-hidden rounded-3xl border-2 border-dashed bg-card/40 p-8 text-left outline-none backdrop-blur-xl transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-12",
          isDragging
            ? "scale-[1.01] border-acid/60 bg-acid/5"
            : "border-foreground/15 hover:border-foreground/30",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-acid/5 via-transparent to-hot/5"
        />
        <span className="relative flex flex-col items-center gap-5 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-acid ring-2 ring-acid-deep/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-ink"
              aria-hidden
            >
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
            </svg>
          </span>

          <span className="space-y-1.5">
            <span className="block text-lg font-medium">
              {isDragging
                ? "Drop it like it's hot"
                : "Drop an image to get started"}
            </span>
            <span className="block text-sm text-muted-foreground">
              Selfies, pets, screenshots, reaction shots &mdash; the weirder,
              the better.
            </span>
          </span>

          <span
            className={cn(
              buttonVariants({ variant: "gradient", size: "lg" }),
              "mt-1 w-full sm:w-auto",
            )}
          >
            Choose image
          </span>

          <span className="block text-xs text-muted-foreground">
            PNG, JPG, WEBP &middot; up to 10&nbsp;MB
          </span>
        </span>
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 text-center text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      {hiddenInput}
    </div>
  );
}
