import type { MemeTemplate } from "@/lib/meme-schema";
import { EDITOR_CONFIG } from "./editor-config";

// Per-slot styling and position overrides on top of the template defaults.
// Values stored as SCALES and FRACTIONS so they stay correct at any stage size.

export interface SlotEdit {
  fontFamily: string;
  fontSizeScale: number; // 1.0 = template default
  fill: string; // hex color
  stroke: string | null; // hex or null for no outline
  strokeWidthScale: number; // 1.0 = template default
  shadow: boolean;
  fractionX: number | null; // null = use template anchor
  fractionY: number | null;
}

export const FONT_OPTIONS = [
  { value: "Impact, Anton, 'Arial Black', sans-serif", label: "Impact" },
  { value: "'Comic Sans MS', 'Comic Neue', cursive", label: "Comic Sans" },
  { value: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { value: "'Courier New', monospace", label: "Mono" },
] as const;

export const DEFAULT_FONT = FONT_OPTIONS[0].value;
// Used when a slot has no template default stroke but user enables one
export const FALLBACK_STROKE_WIDTH_FRACTION = 0.004;

export function makeDefaultSlot(
  template: MemeTemplate,
  slotIndex: number,
): SlotEdit {
  const slot = EDITOR_CONFIG[template].slots[slotIndex];
  return {
    fontFamily: DEFAULT_FONT,
    fontSizeScale: 1,
    fill: slot?.fill ?? "#ffffff",
    stroke: slot?.stroke ?? null,
    strokeWidthScale: 1,
    shadow: true,
    fractionX: null,
    fractionY: null,
  };
}

export function makeDefaultSlots(template: MemeTemplate): SlotEdit[] {
  return EDITOR_CONFIG[template].slots.map((_, i) =>
    makeDefaultSlot(template, i),
  );
}
