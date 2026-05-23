"use client";

import Konva from "konva";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EDITOR_CONFIG } from "@/lib/templates/editor-config";
import { TEMPLATE_BACKGROUNDS } from "@/lib/templates/konva-templates";
import {
  FALLBACK_STROKE_WIDTH_FRACTION,
  type SlotEdit,
} from "@/lib/templates/slot-edit";
import type { MemeTemplate } from "@/lib/meme-schema";

interface EditorCanvasProps {
  template: MemeTemplate;
  userImage: string;
  captions: string[];
  slotEdits: SlotEdit[];
  selectedSlot: number | null;
  onSelectSlot: (i: number | null) => void;
  onPositionChange: (
    slotIndex: number,
    fractionX: number,
    fractionY: number,
  ) => void;
}

export interface EditorCanvasHandle {
  /** Returns a base64-encoded PNG data URL of the current stage, or null if not ready. */
  exportPng: () => string | null;
}

export const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(
  function EditorCanvas(
    {
      template,
      userImage,
      captions,
      slotEdits,
      selectedSlot,
      onSelectSlot,
      onPositionChange,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const backgroundLayerRef = useRef<Konva.Layer | null>(null);
    const textLayerRef = useRef<Konva.Layer | null>(null);
    const textNodesRef = useRef<Konva.Text[]>([]);
    const selectionRectRef = useRef<Konva.Rect | null>(null);
    const [stageSize, setStageSize] = useState(0);

    // Stable callback refs so effects don't re-run when parent re-creates handlers
    const onSelectRef = useRef(onSelectSlot);
    const onPositionChangeRef = useRef(onPositionChange);
    const selectedSlotRef = useRef(selectedSlot);
    useEffect(() => {
      onSelectRef.current = onSelectSlot;
    }, [onSelectSlot]);
    useEffect(() => {
      onPositionChangeRef.current = onPositionChange;
    }, [onPositionChange]);
    useEffect(() => {
      selectedSlotRef.current = selectedSlot;
    }, [selectedSlot]);

    // 1. Observe container width and set stage size (cap at 600px)
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const apply = (w: number) =>
        setStageSize(Math.min(Math.max(0, w), 600));
      apply(el.clientWidth);
      const ro = new ResizeObserver((entries) => {
        apply(entries[0].contentRect.width);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // 2. Create the Konva Stage + layers. Recreates when stage size changes.
    useEffect(() => {
      const el = containerRef.current;
      if (!el || stageSize === 0) return;

      const stage = new Konva.Stage({
        container: el,
        width: stageSize,
        height: stageSize,
      });
      const backgroundLayer = new Konva.Layer({ listening: false });
      const textLayer = new Konva.Layer();
      stage.add(backgroundLayer);
      stage.add(textLayer);

      stage.on("click tap", (e) => {
        if (e.target === stage) onSelectRef.current(null);
      });

      stageRef.current = stage;
      backgroundLayerRef.current = backgroundLayer;
      textLayerRef.current = textLayer;

      return () => {
        stage.destroy();
        stageRef.current = null;
        backgroundLayerRef.current = null;
        textLayerRef.current = null;
        textNodesRef.current = [];
        selectionRectRef.current = null;
      };
    }, [stageSize]);

    // 3. Load the user image and draw the template background (image + decorations)
    useEffect(() => {
      const layer = backgroundLayerRef.current;
      if (!layer || stageSize === 0) return;
      let cancelled = false;
      const img = new window.Image();
      img.onload = () => {
        if (cancelled || !backgroundLayerRef.current) return;
        layer.destroyChildren();
        TEMPLATE_BACKGROUNDS[template]({ layer, img, size: stageSize });
        layer.batchDraw();
      };
      img.src = userImage;
      return () => {
        cancelled = true;
      };
    }, [userImage, template, stageSize]);

    // 4. Build text nodes + selection rect for the current template.
    // Properties set here are placeholders; Effect 5 applies all slot edits.
    useEffect(() => {
      const layer = textLayerRef.current;
      if (!layer || stageSize === 0) return;

      layer.destroyChildren();
      textNodesRef.current = [];
      selectionRectRef.current = null;

      const config = EDITOR_CONFIG[template];
      config.slots.forEach((slot, i) => {
        const text = new Konva.Text({
          x: 0,
          y: 0,
          width: slot.width * stageSize,
          text: "",
          align: slot.align,
          lineHeight: 1.05,
          fontStyle: "bold",
          fillAfterStrokeEnabled: true,
          draggable: true,
        });

        text.on("click tap", (e) => {
          e.cancelBubble = true;
          onSelectRef.current(i);
        });

        text.on("dragstart", (e) => {
          e.cancelBubble = true;
          onSelectRef.current(i);
        });

        text.on("dragmove", () => {
          // Keep the selection rect glued to the text while dragging
          const rect = selectionRectRef.current;
          if (rect && selectedSlotRef.current === i) {
            rect.position({ x: text.x() - 4, y: text.y() - 4 });
            rect.size({ width: text.width() + 8, height: text.height() + 8 });
            textLayerRef.current?.batchDraw();
          }
        });

        text.on("dragend", () => {
          const fractionX = (text.x() + text.width() / 2) / stageSize;
          const fractionY = text.y() / stageSize;
          onPositionChangeRef.current(i, fractionX, fractionY);
        });

        layer.add(text);
        textNodesRef.current.push(text);
      });

      const rect = new Konva.Rect({
        stroke: "#c6f24e",
        strokeWidth: 2,
        dash: [6, 4],
        cornerRadius: 4,
        listening: false,
        visible: false,
      });
      layer.add(rect);
      selectionRectRef.current = rect;

      layer.batchDraw();
    }, [template, stageSize]);

    // 5. Apply slot edits + captions to Konva.Text nodes (text, style, position).
    useEffect(() => {
      const nodes = textNodesRef.current;
      if (nodes.length === 0) return;
      const config = EDITOR_CONFIG[template];

      nodes.forEach((node, i) => {
        const slot = config.slots[i];
        const edit = slotEdits[i];
        if (!slot || !edit) return;

        const boxWidth = slot.width * stageSize;
        const anchorX = edit.fractionX ?? slot.anchorX;
        const anchorY = edit.fractionY ?? slot.anchorY;
        const boxX = anchorX * stageSize - boxWidth / 2;
        const boxY = anchorY * stageSize;
        const fontSize = slot.fontSize * stageSize * edit.fontSizeScale;
        const baseStrokeFraction =
          slot.strokeWidth ?? FALLBACK_STROKE_WIDTH_FRACTION;
        const strokeWidth =
          baseStrokeFraction * stageSize * edit.strokeWidthScale;

        node.setAttrs({
          x: boxX,
          y: boxY,
          width: boxWidth,
          text: captions[i] ?? "",
          fontFamily: edit.fontFamily,
          fontSize,
          fill: edit.fill,
          stroke: edit.stroke ?? undefined,
          strokeWidth: edit.stroke ? strokeWidth : 0,
          shadowColor: edit.shadow ? "black" : undefined,
          shadowBlur: edit.shadow ? fontSize * 0.15 : 0,
          shadowOpacity: edit.shadow ? 0.4 : 0,
        });
      });

      textLayerRef.current?.batchDraw();
    }, [captions, slotEdits, stageSize, template]);

    // 6. Update selection visuals (opacity + dashed rect).
    useEffect(() => {
      const nodes = textNodesRef.current;
      const rect = selectionRectRef.current;
      if (!rect || nodes.length === 0) return;

      nodes.forEach((node, i) => {
        const isSelected = selectedSlot === i;
        node.opacity(selectedSlot === null || isSelected ? 1 : 0.55);
      });

      if (selectedSlot === null) {
        rect.visible(false);
      } else {
        const node = nodes[selectedSlot];
        if (node) {
          rect.position({ x: node.x() - 4, y: node.y() - 4 });
          rect.size({ width: node.width() + 8, height: node.height() + 8 });
          rect.visible(true);
          rect.moveToTop();
        }
      }

      textLayerRef.current?.batchDraw();
    }, [selectedSlot, captions, slotEdits, stageSize, template]);

    // Expose imperative methods (PNG export) to the parent modal
    useImperativeHandle(
      ref,
      () => ({
        exportPng: () => {
          const stage = stageRef.current;
          if (!stage) return null;
          // Hide the selection rect so it doesn't appear in the export
          const rect = selectionRectRef.current;
          const wasVisible = rect?.visible() ?? false;
          rect?.visible(false);
          textLayerRef.current?.batchDraw();
          const dataUrl = stage.toDataURL({
            mimeType: "image/png",
            pixelRatio: 2,
          });
          if (rect && wasVisible) {
            rect.visible(true);
            textLayerRef.current?.batchDraw();
          }
          return dataUrl;
        },
      }),
      [],
    );

    return (
      <div className="mx-auto w-full max-w-[600px]">
        <div
          ref={containerRef}
          className="aspect-square w-full overflow-hidden rounded-2xl bg-black shadow-2xl"
        />
      </div>
    );
  },
);
