"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-white/5 bg-card/60 p-6 text-center backdrop-blur-xl">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={reset} variant="gradient" className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}
