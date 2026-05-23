import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MEME_TEMPLATES, type MemeTemplate } from "@/lib/meme-schema";

export const runtime = "nodejs";
export const maxDuration = 30;

interface SaveBody {
  template?: string;
  title?: string;
  captions?: unknown;
  imageDataUrl?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SaveBody;
    const { template, title, captions, imageDataUrl } = body;

    if (
      typeof template !== "string" ||
      !MEME_TEMPLATES.includes(template as MemeTemplate)
    ) {
      return NextResponse.json(
        { error: "Invalid template" },
        { status: 400 },
      );
    }
    if (!Array.isArray(captions) || captions.some((c) => typeof c !== "string")) {
      return NextResponse.json(
        { error: "Invalid captions" },
        { status: 400 },
      );
    }
    if (
      typeof imageDataUrl !== "string" ||
      !imageDataUrl.startsWith("data:image/png;base64,")
    ) {
      return NextResponse.json(
        { error: "Invalid image" },
        { status: 400 },
      );
    }

    const base64 = imageDataUrl.slice("data:image/png;base64,".length);
    const buffer = Buffer.from(base64, "base64");

    const id = randomUUID();
    const path = `${id}.png`;

    const { error: uploadError } = await supabase.storage
      .from("memes")
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("[memes/POST] upload error", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: urlData } = supabase.storage.from("memes").getPublicUrl(path);
    const imageUrl = urlData.publicUrl;

    const baseRow = {
      id,
      image_url: imageUrl,
      template,
      captions,
    };
    const includeTitle = typeof title === "string" && title.length > 0;
    const initialRow: Record<string, unknown> = includeTitle
      ? { ...baseRow, title }
      : baseRow;

    let result = await supabase
      .from("memes")
      .insert(initialRow)
      .select("id")
      .single();

    // PGRST204 = PostgREST can't find the column in the schema cache.
    // Means the `title` column hasn't been added to the DB yet. Retry
    // without title so saves work pre-migration.
    if (
      result.error?.code === "PGRST204" &&
      result.error.message.toLowerCase().includes("title")
    ) {
      console.warn(
        "[memes/POST] title column not in schema — retrying without it",
      );
      result = await supabase
        .from("memes")
        .insert(baseRow)
        .select("id")
        .single();
    }

    if (result.error) {
      console.error("[memes/POST] insert error", result.error);
      // Clean up the orphaned upload so storage doesn't fill with junk
      await supabase.storage.from("memes").remove([path]).catch(() => {});
      return NextResponse.json(
        { error: `Save failed: ${result.error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: result.data.id });
  } catch (err) {
    console.error("[memes/POST]", err);
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
