import { NextResponse } from "next/server";
import { isReactionEmoji } from "@/lib/reaction-emojis";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: memeId } = await params;

    if (!UUID_RE.test(memeId)) {
      return NextResponse.json({ error: "Invalid meme id" }, { status: 400 });
    }

    const body = (await req.json()) as { emoji?: unknown };
    if (!isReactionEmoji(body.emoji)) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }

    const { error } = await supabase
      .from("reactions")
      .insert({ meme_id: memeId, emoji: body.emoji });

    if (error) {
      console.error("[reactions/POST]", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reactions/POST]", err);
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
