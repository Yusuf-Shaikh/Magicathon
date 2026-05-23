"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareActionsProps {
  url: string;
}

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
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — clipboard API may be blocked
    }
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ url, title: "Look at this meme" });
    } catch {
      // user cancelled
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="gradient" size="sm" onClick={copy}>
        {copied ? "✓ copied" : "copy link"}
      </Button>
      {canNativeShare && (
        <Button variant="outline" size="sm" onClick={share}>
          share
        </Button>
      )}
    </div>
  );
}
