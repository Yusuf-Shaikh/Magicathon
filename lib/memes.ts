import { supabase } from "@/lib/supabase";

export interface SiteStats {
  memes: number;
  reactions: number;
}

/**
 * Total counts across the site — used in the hero strip.
 * Head queries with exact count: cheap, no row payload.
 */
export async function fetchStats(): Promise<SiteStats> {
  const [memes, reactions] = await Promise.all([
    supabase.from("memes").select("*", { count: "exact", head: true }),
    supabase.from("reactions").select("*", { count: "exact", head: true }),
  ]);
  return {
    memes: memes.count ?? 0,
    reactions: reactions.count ?? 0,
  };
}

export interface RankedMeme {
  id: string;
  imageUrl: string;
  template: string;
  reactionCount: number;
}

/**
 * Returns memes sorted by total reactions (desc), most-recent first as tiebreaker.
 * Used by the homepage trending preview and the leaderboard page.
 */
export async function fetchRankedMemes(limit = 20): Promise<RankedMeme[]> {
  const { data, error } = await supabase
    .from("memes")
    .select("id, image_url, template, created_at, reactions(count)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[memes] fetch error", error);
    return [];
  }

  type Row = {
    id: string;
    image_url: string;
    template: string;
    reactions: Array<{ count: number }> | null;
  };

  return (data as unknown as Row[])
    .map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      template: row.template,
      reactionCount: row.reactions?.[0]?.count ?? 0,
    }))
    .sort((a, b) => b.reactionCount - a.reactionCount)
    .slice(0, limit);
}
