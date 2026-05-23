"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorCanvas, type EditorCanvasHandle } from "./editor-canvas";
import { TextEditBar } from "./text-edit-bar";
import {
  normalizeCaptions,
  type MemeConcept,
} from "@/lib/meme-schema";
import {
  makeDefaultSlots,
  type SlotEdit,
} from "@/lib/templates/slot-edit";

const EXIT_DURATION_MS = 180;

interface EditorModalProps {
  concept: MemeConcept;
  userImage: string;
  onCaptionsChange: (captions: string[]) => void;
  onClose: () => void;
}

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "error"; message: string };

export default function EditorModal({
  concept,
  userImage,
  onCaptionsChange,
  onClose,
}: EditorModalProps) {
  const router = useRouter();
  const canvasRef = useRef<EditorCanvasHandle>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isExiting, setIsExiting] = useState(false);
  const [slotEdits, setSlotEdits] = useState<SlotEdit[]>(() =>
    makeDefaultSlots(concept.template),
  );

  const requestClose = useCallback(() => {
    if (saveState.status === "saving") return;
    setIsExiting(true);
    window.setTimeout(onClose, EXIT_DURATION_MS);
  }, [onClose, saveState.status]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedSlot !== null) setSelectedSlot(null);
        else requestClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [requestClose, selectedSlot]);

  const captions = normalizeCaptions(concept.template, concept.captions);

  const handleCaptionChange = (slotIndex: number, text: string) => {
    const next = [...captions];
    next[slotIndex] = text;
    onCaptionsChange(next);
  };

  const handleSlotEditChange = (
    slotIndex: number,
    patch: Partial<SlotEdit>,
  ) => {
    setSlotEdits((prev) =>
      prev.map((s, i) => (i === slotIndex ? { ...s, ...patch } : s)),
    );
  };

  const handlePositionChange = useCallback(
    (slotIndex: number, fractionX: number, fractionY: number) => {
      setSlotEdits((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, fractionX, fractionY } : s,
        ),
      );
    },
    [],
  );

  const handleSave = async () => {
    // Clear selection so the dashed rect isn't included in the export
    setSelectedSlot(null);
    // Wait a frame so React commits the state and Konva redraws without the rect
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const dataUrl = canvasRef.current?.exportPng();
    if (!dataUrl) {
      setSaveState({ status: "error", message: "Couldn't capture canvas" });
      return;
    }

    setSaveState({ status: "saving" });
    try {
      const res = await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: concept.template,
          title: concept.title,
          captions,
          imageDataUrl: dataUrl,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || `Save failed (${res.status})`);
      }
      const { id } = (await res.json()) as { id: string };
      // Stamp the saved meme id onto persisted studio state so the share
      // page can identify the creator and offer back-to-editor.
      try {
        const raw = window.sessionStorage.getItem("cursed-studio-state");
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          parsed.lastSavedMemeId = id;
          window.sessionStorage.setItem(
            "cursed-studio-state",
            JSON.stringify(parsed),
          );
        }
      } catch {
        // sessionStorage unavailable — non-fatal
      }
      router.push(`/m/${id}`);
    } catch (e) {
      setSaveState({
        status: "error",
        message: e instanceof Error ? e.message : "Save failed",
      });
    }
  };

  const saving = saveState.status === "saving";

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Edit meme"
      className={cn(
        "dark-section fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm",
        isExiting
          ? "animate-out fade-out duration-200"
          : "animate-in fade-in duration-200",
      )}
      onClick={saving ? undefined : requestClose}
    >
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden bg-card sm:h-auto sm:max-h-[92dvh] sm:max-w-xl sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl lg:max-w-5xl",
          isExiting
            ? "animate-out fade-out slide-out-to-bottom-8 duration-200 sm:slide-out-to-bottom-0 sm:zoom-out-95"
            : "animate-in fade-in slide-in-from-bottom-8 duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-sm font-semibold">Edit meme</h2>
            <span className="truncate rounded-full bg-acid px-2 py-0.5 font-mono text-xs lowercase text-ink">
              {concept.title || concept.template}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner /> saving…
                </>
              ) : (
                "save & share"
              )}
            </Button>
            <button
              type="button"
              onClick={requestClose}
              disabled={saving}
              aria-label="Close editor"
              className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:flex-row lg:gap-6 lg:overflow-hidden">
          <div className="w-full lg:w-[600px] lg:flex-shrink-0">
            <EditorCanvas
              ref={canvasRef}
              template={concept.template}
              userImage={userImage}
              captions={captions}
              slotEdits={slotEdits}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onPositionChange={handlePositionChange}
            />
          </div>
          <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <TextEditBar
              template={concept.template}
              captions={captions}
              slotEdits={slotEdits}
              selectedSlot={selectedSlot}
              onCaptionChange={handleCaptionChange}
              onSlotEditChange={handleSlotEditChange}
              onClearSelection={() => setSelectedSlot(null)}
            />
            {saveState.status === "error" && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {saveState.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5 animate-spin"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

