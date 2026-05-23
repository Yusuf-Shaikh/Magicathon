import Link from "next/link";
import { Marquee } from "@/components/marquee";
import { MemeStudio } from "@/components/meme-studio";
import { fetchRankedMemes, fetchStats, type RankedMeme } from "@/lib/memes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trending, stats] = await Promise.all([
    fetchRankedMemes(6),
    fetchStats(),
  ]);

  return (
    <main>
      {/* HERO — ink (full viewport height below navbar) */}
      <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center overflow-hidden border-b border-foreground/10">
        <div className="hero-glow" />
        <div className="hero-grid" />

        {/* Floating decorative ✦ stars — rotate at different speeds/directions */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[6%] top-[18%] hidden text-5xl text-acid/50 sm:block sm:text-7xl"
        >
          <span
            className="inline-block animate-spin"
            style={{ animationDuration: "32s" }}
          >
            ✦
          </span>
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute right-[8%] top-[14%] hidden text-4xl text-hot/50 sm:block sm:text-6xl"
        >
          <span
            className="inline-block animate-spin"
            style={{
              animationDuration: "24s",
              animationDirection: "reverse",
            }}
          >
            ✦
          </span>
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[24%] left-[12%] hidden text-3xl text-acid/40 sm:block sm:text-5xl"
        >
          <span
            className="inline-block animate-spin"
            style={{ animationDuration: "44s" }}
          >
            ✦
          </span>
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[22%] right-[10%] hidden text-4xl text-hot/40 sm:block sm:text-6xl"
        >
          <span
            className="inline-block animate-spin"
            style={{
              animationDuration: "38s",
              animationDirection: "reverse",
            }}
          >
            ✦
          </span>
        </span>

        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span
                className="inline-block animate-spin text-acid"
                style={{ animationDuration: "12s" }}
              >
                ✦
              </span>{" "}
              The meme maker that doesn&rsquo;t suck
            </span>
            <h1 className="mt-7 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
              Make memes
              <br />
              from your own
              <br />
              photos
              <span className="text-acid">.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-base text-muted-foreground sm:text-lg">
              Drop in any image. A vision model riffs on what&rsquo;s actually
              in the photo and hands you six memes worth sharing.
            </p>
          </div>

          <div
            className="animate-in fade-in mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground duration-500 sm:gap-x-5"
            style={{
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            <span>
              <span className="text-acid">{stats.memes}</span> memes made
            </span>
            <span className="text-acid">·</span>
            <span>
              <span className="text-acid">{stats.reactions}</span> reactions
            </span>
            <span className="text-acid">·</span>
            <span>no signup</span>
          </div>
        </div>

        <a
          href="#upload"
          aria-label="Scroll to upload"
          className="group absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground sm:bottom-10"
        >
          <span>scroll to upload</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-4 w-4 animate-bounce text-acid"
          >
            <path d="M12 5v14" />
            <path d="m5 12 7 7 7-7" />
          </svg>
        </a>
      </section>

      {/* MARQUEE — ink ticker */}
      <Marquee />

      {/* UPLOAD — paper */}
      <section
        id="upload"
        className="paper-section scroll-mt-20 border-b border-foreground/10"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20 lg:max-w-6xl">
          <div
            className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              01 / Drop a photo
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Pick something with <span className="text-hot">personality</span>
              <span className="text-hot">.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
              Selfies, pets, screenshots, reaction shots &mdash; the weirder,
              the better.
            </p>
          </div>
          <MemeStudio />
        </div>
      </section>

      {/* TRENDING — ink */}
      {trending.length > 0 && (
        <section className="relative">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
            <div
              className="mb-8 flex items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{
                animationDelay: "150ms",
                animationFillMode: "backwards",
              }}
            >
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  02 / Right now
                </span>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  What people are <span className="text-acid">making</span>
                  <span className="text-acid">.</span>
                </h2>
              </div>
              <Link
                href="/leaderboard"
                className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                see all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {trending.map((meme) => (
                <TrendingCard key={meme.id} meme={meme} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-foreground/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              may the best <span className="text-acid">meme</span> win
              <span className="text-acid">.</span>
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              cursed.ai · built for the magicathon
            </p>
          </div>
          <Link
            href="#upload"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            back to top ↑
          </Link>
        </div>
      </footer>
    </main>
  );
}

function TrendingCard({ meme }: { meme: RankedMeme }) {
  return (
    <Link
      href={`/m/${meme.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-foreground/10 bg-card/40 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-acid/40 hover:shadow-acid/10"
    >
      <div className="relative aspect-square bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meme.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
        {meme.reactionCount > 0 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-xs font-medium text-white/95 backdrop-blur">
            🔥 {meme.reactionCount}
          </span>
        )}
      </div>
    </Link>
  );
}
