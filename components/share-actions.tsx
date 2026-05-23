"use client";

import { useEffect, useState } from "react";

interface ShareActionsProps {
  url: string;
}

/**
 * Icon-only circle buttons for clipboard copy + native share.
 * Returns a Fragment so it can sit inline with other CTAs in a flex row.
 */
export function ShareActions({ url }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — no-op
    }
  };

  const share = async () => {
    if (!navigator.share) {
      void copy();
      return;
    }
    try {
      await navigator.share({ url, title: "Look at this meme" });
    } catch {
      // user cancelled — no-op
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Link copied to clipboard" : "Copy link"}
        title={copied ? "Copied!" : "Copy link"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-acid/40 bg-acid/10 text-acid transition-colors hover:border-acid hover:bg-acid hover:text-ink"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      {canNativeShare && (
        <button
          type="button"
          onClick={share}
          aria-label="Share"
          title="Share"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-acid/40 bg-acid/10 text-acid transition-colors hover:border-acid hover:bg-acid hover:text-ink"
        >
          <ShareIcon />
        </button>
      )}
    </>
  );
}

function CopyIcon() {
  return (
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
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ShareIcon() {
  return (
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
