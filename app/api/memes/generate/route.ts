import { NextResponse } from "next/server";
import { generateMemeConcepts } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { imageDataUrl?: string };
    const { imageDataUrl } = body;

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Missing or invalid image" },
        { status: 400 },
      );
    }

    const concepts = await generateMemeConcepts(imageDataUrl);
    return NextResponse.json({ concepts });
  } catch (err) {
    console.error("[memes/generate]", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
