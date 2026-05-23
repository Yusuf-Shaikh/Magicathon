import Link from "next/link";

export default function MemeNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="animate-in fade-in zoom-in-95 max-w-sm space-y-6 text-center duration-500">
        <div className="text-6xl">🫥</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Meme not found
          </h1>
          <p className="text-sm text-muted-foreground">
            That link doesn&rsquo;t lead anywhere. Either the meme was deleted
            or the URL is a little off.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/40 px-4 py-2 text-sm transition-colors hover:border-white/25 hover:bg-card/60"
        >
          ✨ make your own
        </Link>
      </div>
    </main>
  );
}
