import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchRankedMemes, type RankedMeme } from "@/lib/memes";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Leaderboard",
};

export default async function LeaderboardPage() {
  const entries = await fetchRankedMemes(20);

  return (
    <main className="relative overflow-hidden">
      <div className="hero-glow" />
      <div className="hero-grid" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-5 py-12 sm:gap-10 sm:py-16">
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3 text-center duration-500">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="text-acid">✦</span> Top memes · ranked by reactions
          </span>
          <div className="text-5xl">🏆</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Leader<span className="text-acid">board</span>
            <span className="text-acid">.</span>
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            What&rsquo;s actually hitting right now.
          </p>
        </div>

        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {entries.map((entry, i) => (
              <LeaderboardCard
                key={entry.id}
                entry={entry}
                rank={i + 1}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function LeaderboardCard({
  entry,
  rank,
  index,
}: {
  entry: RankedMeme;
  rank: number;
  index: number;
}) {
  const paddedRank = String(rank).padStart(2, "0");
  return (
    <Link
      href={`/m/${entry.id}`}
      aria-label={`Rank ${rank} meme · ${entry.reactionCount} reactions`}
      className="group animate-in fade-in slide-in-from-bottom-2 relative block overflow-hidden rounded-2xl border border-foreground/10 bg-card/40 shadow-lg backdrop-blur-xl transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-acid/60 hover:bg-card/60 hover:shadow-2xl hover:shadow-acid/20"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="relative aspect-square bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Top gradient so rank + reactions read on any meme */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/75 via-black/40 to-transparent"
        />

        {/* Rank — huge display number */}
        <span
          className={cn(
            "pointer-events-none absolute left-3 top-1 font-display text-5xl font-bold leading-none tracking-tight sm:left-4 sm:top-2 sm:text-6xl",
            rank === 1 && "text-amber-300",
            rank === 2 && "text-zinc-200",
            rank === 3 && "text-orange-300",
            rank > 3 && "text-paper/80",
          )}
          style={{
            textShadow:
              "0 2px 10px rgba(0,0,0,0.8), 0 0 24px rgba(0,0,0,0.4)",
          }}
        >
          {paddedRank}
        </span>

        {entry.reactionCount > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-xs font-medium text-white/95 backdrop-blur sm:right-4 sm:top-4">
            🔥 {entry.reactionCount}
          </span>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="space-y-4 py-12 text-center">
      <p className="text-muted-foreground">no memes yet. be the first.</p>
      <Button asChild variant="gradient" size="lg">
        <Link href="/">create a meme</Link>
      </Button>
    </div>
  );
}
