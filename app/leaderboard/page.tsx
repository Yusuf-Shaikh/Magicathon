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
  return (
    <Link
      href={`/m/${entry.id}`}
      className="group animate-in fade-in slide-in-from-bottom-2 relative block overflow-hidden rounded-2xl border border-paper/10 bg-card/40 shadow-lg backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-acid/40 hover:shadow-acid/10"
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
        <span
          className={cn(
            "absolute left-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold shadow-md backdrop-blur",
            rank === 1 && "bg-amber-400/95 text-amber-950",
            rank === 2 && "bg-zinc-300/95 text-zinc-900",
            rank === 3 && "bg-orange-400/95 text-orange-950",
            rank > 3 && "bg-black/65 text-white/95",
          )}
        >
          #{rank}
        </span>
        {entry.reactionCount > 0 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-xs font-medium text-white/95 backdrop-blur">
            🔥 {entry.reactionCount}
          </span>
        )}
      </div>
      <div className="border-t border-paper/10 bg-card/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {entry.template}
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
