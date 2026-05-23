"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Acquire camera stream on mount; release on unmount
  useEffect(() => {
    let cancelled = false;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("Your browser doesn't support webcam access.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(
          err.name === "NotAllowedError"
            ? "Camera access was blocked. Allow it in your browser, or use upload instead."
            : err.message || "Couldn't access the camera.",
        );
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // ESC closes; lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the snapshot to match the mirrored preview the user sees
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File(
          [blob],
          `capture-${Date.now()}.jpg`,
          { type: "image/jpeg" },
        );
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }, [onCapture]);

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Take a photo"
      className="dark-section animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm duration-200"
      onClick={onClose}
    >
      <div
        className="animate-in fade-in slide-in-from-bottom-8 relative flex h-full w-full flex-col overflow-hidden bg-card duration-300 sm:h-auto sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-foreground/10 sm:shadow-2xl sm:slide-in-from-bottom-0 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
          <h2 className="text-sm font-semibold">Take a photo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera"
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-4">
          {error ? (
            <p className="max-w-sm text-center text-sm font-medium text-destructive">
              {error}
            </p>
          ) : (
            <>
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
                />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    starting camera…
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={capture}
                disabled={!ready}
                className="inline-flex items-center gap-2 rounded-full bg-acid px-7 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink shadow-[0_8px_30px_-12px_hsl(var(--acid)/0.55)] transition-all hover:bg-acid-deep active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <circle cx="12" cy="13" r="4" />
                  <path d="M3 7h3l2-3h8l2 3h3v14H3V7z" />
                </svg>
                capture
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
