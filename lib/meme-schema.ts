export const MEME_TEMPLATES = [
  "top-bottom",
  "drake",
  "two-button",
  "expanding-brain",
  "this-is-fine",
  "distracted-boyfriend",
] as const;

export type MemeTemplate = (typeof MEME_TEMPLATES)[number];

// humorStyle is free-form now — the AI picks a phrase that fits the concept
// ("delusional confidence speedrun", "cursed wholesome", etc.) instead of
// being constrained to a fixed enum. This list is kept only as suggestions
// for the prompt, not enforced.
export const HUMOR_STYLE_HINTS = [
  "absurd",
  "self-deprecating",
  "chaotic",
  "painfully relatable",
  "delusional confidence",
  "existential",
  "cursed wholesome",
  "dry irony",
  "hyper-online",
] as const;

// Per-template caption slot labels (for editor UI).
// Order matches the renderer's expected captions array.
export const TEMPLATE_SLOT_LABELS: Record<MemeTemplate, readonly string[]> = {
  "top-bottom": ["top", "bottom"],
  drake: ["reject", "approve"],
  "two-button": ["button A", "button B", "context"],
  "expanding-brain": ["level 1", "level 2", "level 3", "level 4"],
  "this-is-fine": ["fire", "cope"],
  "distracted-boyfriend": ["me", "what i want", "what i had"],
};

export const TEMPLATE_SLOT_COUNT: Record<MemeTemplate, number> = {
  "top-bottom": TEMPLATE_SLOT_LABELS["top-bottom"].length,
  drake: TEMPLATE_SLOT_LABELS["drake"].length,
  "two-button": TEMPLATE_SLOT_LABELS["two-button"].length,
  "expanding-brain": TEMPLATE_SLOT_LABELS["expanding-brain"].length,
  "this-is-fine": TEMPLATE_SLOT_LABELS["this-is-fine"].length,
  "distracted-boyfriend": TEMPLATE_SLOT_LABELS["distracted-boyfriend"].length,
};

export interface MemeConcept {
  template: MemeTemplate; // one of 6 — drives the rendering structure
  title: string; // creative chip label, image-specific (e.g. "trade offer: i give you cringe")
  captions: string[];
  humorStyle: string; // free-form descriptor of the joke's vibe
  reasoning?: string; // one-sentence "why this image fits this meme"
  confidence: number; // 0..1
}

export interface GenerateResponse {
  concepts: MemeConcept[];
}

export function normalizeCaptions(
  template: MemeTemplate,
  captions: string[],
): string[] {
  const expected = TEMPLATE_SLOT_COUNT[template];
  const out = (captions ?? []).slice(0, expected);
  while (out.length < expected) out.push("");
  return out;
}
