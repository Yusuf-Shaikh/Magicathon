import Link from "next/link";
import { notFound } from "next/navigation";
import { BackToEditorLink } from "@/components/back-to-editor-link";
import { ReactionsBar } from "@/components/reactions-bar";
import { ShareActions } from "@/components/share-actions";
import { siteConfig } from "@/lib/site";
import { supabase } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

type MemeRow = {
  id: string;
  image_url: string;
  template: string;
  title: string | null;
  created_at: string;
};

async function fetchMeme(id: string): Promise<MemeRow | null> {
  // Try with the title column first (post-migration schema)
  const withTitle = await supabase
    .from("memes")
    .select("id, image_url, template, title, created_at")
    .eq("id", id)
    .maybeSingle();

  // Postgres error 42703 = column does not exist (pre-migration schema)
  if (withTitle.error?.code === "42703") {
    const fallback = await supabase
      .from("memes")
      .select("id, image_url, template, created_at")
      .eq("id", id)
      .maybeSingle();
    if (fallback.error) {
      console.error("[m/[id]] fetch error", fallback.error);
      return null;
    }
    return fallback.data
      ? ({ ...fallback.data, title: null } as MemeRow)
      : null;
  }

  if (withTitle.error) {
    console.error("[m/[id]] fetch error", withTitle.error);
    return null;
  }
  return (withTitle.data as MemeRow | null) ?? null;
}

async function fetchReactionCounts(
  memeId: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("reactions")
    .select("emoji")
    .eq("meme_id", memeId);
  if (error) {
    console.error("[m/[id]] reactions fetch error", error);
    return {};
  }
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const emoji = (row as { emoji: string }).emoji;
    counts[emoji] = (counts[emoji] ?? 0) + 1;
  }
  return counts;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const meme = await fetchMeme(id);
  if (!meme) return { title: "Meme not found" };
  return {
    title: `A meme from ${siteConfig.name}`,
    openGraph: {
      title: `A meme from ${siteConfig.name}`,
      images: [{ url: meme.image_url }],
    },
    twitter: {
      card: "summary_large_image",
      images: [meme.image_url],
    },
  };
}

export default async function MemePage({ params }: PageProps) {
  const { id } = await params;
  const meme = await fetchMeme(id);
  if (!meme) notFound();

  const [initialReactionCounts] = await Promise.all([fetchReactionCounts(meme.id)]);
  const shareUrl = absoluteUrl(`/m/${meme.id}`);

  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-5 py-8 sm:py-12 lg:max-w-6xl">
        {/* Header — spans full width */}
        <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-center justify-between duration-300">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← back
          </Link>
          <span className="rounded-full bg-acid px-2 py-0.5 font-mono text-xs lowercase text-ink">
            {meme.title || meme.template}
          </span>
        </div>

        {/* Image left · CTAs right on lg+, stacked on mobile/tablet */}
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-10">
          <div
            className="animate-in fade-in slide-in-from-bottom-3 overflow-hidden rounded-3xl border border-foreground/10 bg-card/40 shadow-2xl backdrop-blur-xl duration-500"
            style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meme.image_url}
              alt="meme"
              className="block aspect-square w-full bg-black object-contain"
            />
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-20">
            <div
              className="animate-in fade-in duration-500"
              style={{
                animationDelay: "200ms",
                animationFillMode: "backwards",
              }}
            >
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                react
              </p>
              <ReactionsBar
                memeId={meme.id}
                initialCounts={initialReactionCounts}
              />
            </div>

            <div
              className="animate-in fade-in duration-500"
              style={{
                animationDelay: "300ms",
                animationFillMode: "backwards",
              }}
            >
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                share
              </p>
              <ShareActions url={shareUrl} />
            </div>

            <div
              className="animate-in fade-in flex flex-col gap-3 border-t border-foreground/10 pt-5 duration-500"
              style={{
                animationDelay: "400ms",
                animationFillMode: "backwards",
              }}
            >
              <BackToEditorLink />
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                ✨ make another
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
