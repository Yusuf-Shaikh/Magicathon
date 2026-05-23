import type { MemeConcept } from "@/lib/meme-schema";
import { MEME_SYSTEM_PROMPT, MEME_USER_PROMPT } from "./prompt";

// OpenRouter is OpenAI-compatible. Defaults to Claude Sonnet 4 (strong humor +
// vision); override with OPENROUTER_MODEL if you want gpt-4o, gemini-2.5-flash,
// etc. without touching code.
const DEFAULT_MODEL = "anthropic/claude-sonnet-4";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export async function generate(imageDataUrl: string): Promise<MemeConcept[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (!imageDataUrl.startsWith("data:image/")) {
    throw new Error("Invalid image data URL");
  }

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // OpenRouter's optional but recommended attribution headers
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "cursed.ai",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: MEME_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageDataUrl } },
            { type: "text", text: MEME_USER_PROMPT },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter ${res.status}: ${text.slice(0, 400) || res.statusText}`,
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("OpenRouter returned empty content");
  }

  const cleaned = extractJson(content);
  try {
    const parsed = JSON.parse(cleaned) as { concepts?: MemeConcept[] };
    return parsed.concepts ?? [];
  } catch (err) {
    console.error("[openrouter] JSON parse failed", {
      model,
      err: err instanceof Error ? err.message : String(err),
      contentPreview: content.slice(0, 500),
    });
    throw new Error("Model returned invalid JSON");
  }
}

/**
 * Strip markdown code fences and any preamble around the JSON object.
 * Claude (via OpenRouter) sometimes returns:
 *   ```json
 *   { ... }
 *   ```
 * or "Here's the JSON:\n{ ... }" despite response_format requests.
 */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (fenceMatch) return fenceMatch[1].trim();

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}
