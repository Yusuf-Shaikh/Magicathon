"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type DragEvent } from "react";
import { compressFile } from "@/lib/image";
import { cn, formatBytes } from "@/lib/utils";

const CameraModal = dynamic(
  () => import("@/components/camera-modal").then((m) => m.CameraModal),
  { ssr: false },
);

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const ACCEPT_ATTR = ACCEPTED.join(",");

interface UploadZoneProps {
  onFileAccepted?: (file: File) => void;
  onReset?: () => void;
}

export function UploadZone({ onFileAccepted, onReset }: UploadZoneProps = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const acceptFile = async (raw: File) => {
    if (!ACCEPTED.includes(raw.type)) {
      setError("That file isn't a PNG, JPG, or WEBP.");
      return;
    }
    if (raw.size > MAX_BYTES) {
      setError(`Image is ${formatBytes(raw.size)} — keep it under 10 MB.`);
      return;
    }
    setError(null);
    setIsProcessing(true);

    // Compress up-front so preview, AI call, and editor all share one
    // optimized image. Falls back to original if compression fails.
    let processed = raw;
    try {
      processed = await compressFile(raw);
    } catch (err) {
      console.warn("[upload-zone] compression failed, using original", err);
    }

    setFile(processed);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(processed);
    });
    setIsProcessing(false);
    onFileAccepted?.(processed);
  };

  const handleTakePhoto = () => {
    // Prefer the in-browser webcam modal everywhere — works on desktop AND
    // mobile browsers. Only fall back to the native file input if
    // mediaDevices isn't available (old browser, http+remote, etc.).
    const hasGetUserMedia =
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getUserMedia === "function";
    if (hasGetUserMedia) {
      setShowCameraModal(true);
    } else {
      cameraInputRef.current?.click();
    }
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

  const cameraInput = (
    <input
      ref={cameraInputRef}
      type="file"
      accept="image/*"
      capture="user"
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
              <button
                type="button"
                onClick={openPicker}
                className="inline-flex h-8 items-center justify-center rounded-full bg-acid-deep px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink shadow-sm transition-colors hover:bg-acid"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-8 items-center justify-center rounded-full bg-acid-deep px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink shadow-sm transition-colors hover:bg-acid"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        {hiddenInput}
        {cameraInput}
        {showCameraModal && (
          <CameraModal
            onCapture={(f) => {
              setShowCameraModal(false);
              acceptFile(f);
            }}
            onClose={() => setShowCameraModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed bg-card/40 p-8 backdrop-blur-xl transition-all sm:p-12",
          isDragging
            ? "scale-[1.01] border-acid/60 bg-acid/5"
            : "border-foreground/15 hover:border-foreground/30",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-acid/5 via-transparent to-hot/5"
        />
        <div className="relative flex flex-col items-center gap-5 text-center">
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

          <div className="space-y-1.5">
            <p className="text-lg font-medium">
              {isProcessing
                ? "Optimizing your image…"
                : isDragging
                  ? "Drop it like it's hot"
                  : "Drop an image to get started"}
            </p>
            <p className="text-sm text-muted-foreground">
              Selfies, pets, screenshots, reaction shots &mdash; the weirder,
              the better.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-acid-deep px-6 font-mono text-sm font-semibold uppercase tracking-[0.15em] text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-acid hover:shadow-md hover:shadow-acid/40 sm:w-auto"
            >
              Upload
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTakePhoto();
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-acid-deep px-6 font-mono text-sm font-semibold uppercase tracking-[0.15em] text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-acid hover:shadow-md hover:shadow-acid/40 sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <circle cx="12" cy="13" r="4" />
                <path d="M3 7h3l2-3h8l2 3h3v14H3V7z" />
              </svg>
              Take photo
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP &middot; up to 10&nbsp;MB
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-center text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      {hiddenInput}
      {cameraInput}
      {showCameraModal && (
        <CameraModal
          onCapture={(f) => {
            setShowCameraModal(false);
            acceptFile(f);
          }}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
}
