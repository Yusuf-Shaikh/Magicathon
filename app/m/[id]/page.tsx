import Link from "next/link";
import { notFound } from "next/navigation";
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
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-10 sm:py-14">
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between duration-300">
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

        <div
          className="animate-in fade-in slide-in-from-bottom-3 overflow-hidden rounded-3xl border border-paper/10 bg-card/40 shadow-2xl backdrop-blur-xl duration-500"
          style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meme.image_url}
            alt="meme"
            className="block aspect-square w-full bg-black object-contain"
          />
        </div>

        <div
          className="animate-in fade-in duration-500"
          style={{ animationDelay: "260ms", animationFillMode: "backwards" }}
        >
          <ReactionsBar
            memeId={meme.id}
            initialCounts={initialReactionCounts}
          />
        </div>

        <div
          className="animate-in fade-in flex flex-col items-center gap-3 duration-500"
          style={{ animationDelay: "360ms", animationFillMode: "backwards" }}
        >
          <ShareActions url={shareUrl} />
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ✨ make your own
          </Link>
        </div>
      </div>
    </main>
  );
}
