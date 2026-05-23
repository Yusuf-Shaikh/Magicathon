import type { MemeTemplate } from "@/lib/meme-schema";

// Per-template text slot positions for the Konva editor.
// Coordinates are fractions of stage size (0..1) so they scale with viewport.
// Slot labels live in `TEMPLATE_SLOT_LABELS` in lib/meme-schema.ts.

export interface TextSlot {
  anchorX: number; // box center X as fraction of stage width
  anchorY: number; // box top Y as fraction of stage height
  width: number; // box width as fraction of stage width
  fontSize: number; // as fraction of stage height
  fill: string;
  stroke?: string;
  strokeWidth?: number; // as fraction of stage height
  align: "left" | "center" | "right";
}

export interface EditorTemplateConfig {
  slots: TextSlot[];
}

const IMPACT_STROKE = { stroke: "#000", strokeWidth: 0.004 } as const;

export const EDITOR_CONFIG: Record<MemeTemplate, EditorTemplateConfig> = {
  "top-bottom": {
    slots: [
      {
        anchorX: 0.5,
        anchorY: 0.05,
        width: 0.92,
        fontSize: 0.085,
        fill: "#fff",
        align: "center",
        ...IMPACT_STROKE,
      },
      {
        anchorX: 0.5,
        anchorY: 0.82,
        width: 0.92,
        fontSize: 0.085,
        fill: "#fff",
        align: "center",
        ...IMPACT_STROKE,
      },
    ],
  },
  drake: {
    slots: [
      {
        anchorX: 0.25,
        anchorY: 0.2,
        width: 0.4,
        fontSize: 0.045,
        fill: "#b91c1c",
        align: "center",
      },
      {
        anchorX: 0.25,
        anchorY: 0.7,
        width: 0.4,
        fontSize: 0.045,
        fill: "#15803d",
        align: "center",
      },
    ],
  },
  "two-button": {
    slots: [
      {
        anchorX: 0.28,
        anchorY: 0.79,
        width: 0.4,
        fontSize: 0.035,
        fill: "#fff",
        align: "center",
      },
      {
        anchorX: 0.72,
        anchorY: 0.79,
        width: 0.4,
        fontSize: 0.035,
        fill: "#fff",
        align: "center",
      },
      {
        anchorX: 0.5,
        anchorY: 0.06,
        width: 0.9,
        fontSize: 0.055,
        fill: "#fff",
        align: "center",
        ...IMPACT_STROKE,
      },
    ],
  },
  "expanding-brain": {
    slots: [
      {
        anchorX: 0.71,
        anchorY: 0.1,
        width: 0.54,
        fontSize: 0.035,
        fill: "#000",
        align: "left",
      },
      {
        anchorX: 0.71,
        anchorY: 0.35,
        width: 0.54,
        fontSize: 0.035,
        fill: "#000",
        align: "left",
      },
      {
        anchorX: 0.71,
        anchorY: 0.6,
        width: 0.54,
        fontSize: 0.035,
        fill: "#000",
        align: "left",
      },
      {
        anchorX: 0.71,
        anchorY: 0.85,
        width: 0.54,
        fontSize: 0.035,
        fill: "#000",
        align: "left",
      },
    ],
  },
  "this-is-fine": {
    slots: [
      {
        anchorX: 0.5,
        anchorY: 0.1,
        width: 0.9,
        fontSize: 0.055,
        fill: "#fff",
        align: "center",
        ...IMPACT_STROKE,
      },
      {
        anchorX: 0.5,
        anchorY: 0.83,
        width: 0.9,
        fontSize: 0.045,
        fill: "#000",
        align: "center",
      },
    ],
  },
  "distracted-boyfriend": {
    slots: [
      {
        anchorX: 0.5,
        anchorY: 0.675,
        width: 0.85,
        fontSize: 0.03,
        fill: "#000",
        align: "center",
      },
      {
        anchorX: 0.5,
        anchorY: 0.775,
        width: 0.85,
        fontSize: 0.03,
        fill: "#fff",
        align: "center",
      },
      {
        anchorX: 0.5,
        anchorY: 0.875,
        width: 0.85,
        fontSize: 0.03,
        fill: "#fff",
        align: "center",
      },
    ],
  },
};
