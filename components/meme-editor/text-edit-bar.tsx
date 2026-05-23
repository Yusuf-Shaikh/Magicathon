"use client";

import { useEffect, useRef } from "react";
import { TEMPLATE_SLOT_LABELS, type MemeTemplate } from "@/lib/meme-schema";
import {
  FONT_OPTIONS,
  type SlotEdit,
} from "@/lib/templates/slot-edit";
import { cn } from "@/lib/utils";

interface TextEditBarProps {
  template: MemeTemplate;
  captions: string[];
  slotEdits: SlotEdit[];
  selectedSlot: number | null;
  onCaptionChange: (slotIndex: number, text: string) => void;
  onSlotEditChange: (slotIndex: number, patch: Partial<SlotEdit>) => void;
  onClearSelection: () => void;
}

export function TextEditBar({
  template,
  captions,
  slotEdits,
  selectedSlot,
  onCaptionChange,
  onSlotEditChange,
  onClearSelection,
}: TextEditBarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const slotLabel =
    selectedSlot !== null ? TEMPLATE_SLOT_LABELS[template][selectedSlot] : null;
  const edit = selectedSlot !== null ? slotEdits[selectedSlot] : null;

  useEffect(() => {
    if (selectedSlot !== null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [selectedSlot]);

  if (selectedSlot === null || !slotLabel || !edit) {
    return (
      <div className="rounded-xl border border-acid/30 bg-card/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
          How to edit
        </p>
        <ol className="mt-3 space-y-2">
          <li className="flex items-baseline gap-3 text-sm">
            <span className="font-mono text-base font-bold text-acid">1.</span>
            <span className="font-medium text-foreground">
              Tap a caption on the meme to edit its text.
            </span>
          </li>
          <li className="flex items-baseline gap-3 text-sm">
            <span className="font-mono text-base font-bold text-acid">2.</span>
            <span className="font-medium text-foreground">
              Drag any caption to reposition it.
            </span>
          </li>
          <li className="flex items-baseline gap-3 text-sm">
            <span className="font-mono text-base font-bold text-acid">3.</span>
            <span className="font-medium text-foreground">
              Tweak font, size, color and outline below.
            </span>
          </li>
          <li className="flex items-baseline gap-3 text-sm">
            <span className="font-mono text-base font-bold text-acid">4.</span>
            <span className="font-medium text-foreground">
              Hit{" "}
              <span className="rounded bg-acid px-1 font-mono text-xs text-ink">
                save &amp; share
              </span>{" "}
              when you&rsquo;re done.
            </span>
          </li>
        </ol>
      </div>
    );
  }

  const slot = selectedSlot;

  return (
    <div className="space-y-3 rounded-xl border border-foreground/15 bg-card/40 p-3 backdrop-blur">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Editing{" "}
          <span className="font-medium text-foreground">{slotLabel}</span>
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          done
        </button>
      </div>

      <textarea
        ref={inputRef}
        value={captions[slot] ?? ""}
        onChange={(e) => onCaptionChange(slot, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onClearSelection();
          }
        }}
        rows={2}
        placeholder="Type a caption…"
        className="w-full resize-none rounded-lg border border-foreground/15 bg-background/60 px-3 py-2 text-sm outline-none ring-acid/40 backdrop-blur transition-shadow focus:ring-2"
      />

      <div className="grid grid-cols-2 gap-3">
        <Control label="Font">
          <select
            value={edit.fontFamily}
            onChange={(e) =>
              onSlotEditChange(slot, { fontFamily: e.target.value })
            }
            className="h-8 w-full cursor-pointer rounded-md border border-foreground/15 bg-background/60 px-2 text-xs"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Control>

        <Control label={`Size · ${Math.round(edit.fontSizeScale * 100)}%`}>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={edit.fontSizeScale}
            onChange={(e) =>
              onSlotEditChange(slot, {
                fontSizeScale: parseFloat(e.target.value),
              })
            }
            className="h-8 w-full accent-acid"
          />
        </Control>

        <Control label="Fill color">
          <input
            type="color"
            value={edit.fill}
            onChange={(e) => onSlotEditChange(slot, { fill: e.target.value })}
            className="h-8 w-full cursor-pointer rounded-md border border-foreground/15 bg-transparent"
          />
        </Control>

        <Control label="Shadow">
          <button
            type="button"
            onClick={() => onSlotEditChange(slot, { shadow: !edit.shadow })}
            className={cn(
              "h-8 w-full rounded-md border px-2 text-xs font-medium transition-colors",
              edit.shadow
                ? "border-acid/50 bg-acid/15 text-acid"
                : "border-foreground/15 bg-background/60 text-muted-foreground",
            )}
          >
            {edit.shadow ? "on" : "off"}
          </button>
        </Control>

        <Control label="Outline">
          <button
            type="button"
            onClick={() =>
              onSlotEditChange(slot, {
                stroke: edit.stroke ? null : "#000000",
              })
            }
            className={cn(
              "h-8 w-full rounded-md border px-2 text-xs font-medium transition-colors",
              edit.stroke
                ? "border-acid/50 bg-acid/15 text-acid"
                : "border-foreground/15 bg-background/60 text-muted-foreground",
            )}
          >
            {edit.stroke ? "on" : "off"}
          </button>
        </Control>

        <Control label="Outline color">
          <input
            type="color"
            value={edit.stroke ?? "#000000"}
            disabled={!edit.stroke}
            onChange={(e) =>
              onSlotEditChange(slot, { stroke: e.target.value })
            }
            className="h-8 w-full cursor-pointer rounded-md border border-foreground/15 bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
          />
        </Control>

        {edit.stroke && (
          <Control
            label={`Outline width · ${Math.round(edit.strokeWidthScale * 100)}%`}
          >
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.05"
              value={edit.strokeWidthScale}
              onChange={(e) =>
                onSlotEditChange(slot, {
                  strokeWidthScale: parseFloat(e.target.value),
                })
              }
              className="h-8 w-full accent-acid"
            />
          </Control>
        )}

        {(edit.fractionX !== null || edit.fractionY !== null) && (
          <Control label="Position">
            <button
              type="button"
              onClick={() =>
                onSlotEditChange(slot, { fractionX: null, fractionY: null })
              }
              className="h-8 w-full rounded-md border border-foreground/15 bg-background/60 px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              reset
            </button>
          </Control>
        )}
      </div>
    </div>
  );
}

function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
