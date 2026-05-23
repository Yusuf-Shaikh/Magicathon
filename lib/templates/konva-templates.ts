import Konva from "konva";
import type { MemeTemplate } from "@/lib/meme-schema";

// Draws the template's background (image + decorations) into a Konva layer.
// Captions live on a separate text layer and are NOT drawn here.

interface DrawArgs {
  layer: Konva.Layer;
  img: HTMLImageElement;
  size: number;
}

function centerCrop(img: HTMLImageElement) {
  const s = Math.min(img.width, img.height);
  return {
    x: (img.width - s) / 2,
    y: (img.height - s) / 2,
    width: s,
    height: s,
  };
}

function drawTopBottom({ layer, img, size }: DrawArgs) {
  layer.add(
    new Konva.Image({
      image: img,
      x: 0,
      y: 0,
      width: size,
      height: size,
      crop: centerCrop(img),
    }),
  );
}

function drawDrake({ layer, img, size }: DrawArgs) {
  const half = size / 2;
  const crop = centerCrop(img);

  // White background (acts as cell separator)
  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: size, height: size, fill: "#fff" }),
  );

  // Top-right cell: grayscale image
  const topImg = new Konva.Image({
    image: img,
    x: half,
    y: 0,
    width: half,
    height: half,
    crop,
    filters: [Konva.Filters.Grayscale],
  });
  topImg.cache();
  layer.add(topImg);
  // Rose tint overlay
  layer.add(
    new Konva.Rect({
      x: half,
      y: 0,
      width: half,
      height: half,
      fill: "rgba(244, 63, 94, 0.2)",
    }),
  );

  // Bottom-right cell: saturated + brightened image
  const bottomImg = new Konva.Image({
    image: img,
    x: half,
    y: half,
    width: half,
    height: half,
    crop,
    filters: [Konva.Filters.HSL, Konva.Filters.Brighten],
  });
  bottomImg.saturation(0.5);
  bottomImg.brightness(0.08);
  bottomImg.cache();
  layer.add(bottomImg);
  // Emerald tint overlay
  layer.add(
    new Konva.Rect({
      x: half,
      y: half,
      width: half,
      height: half,
      fill: "rgba(16, 185, 129, 0.12)",
    }),
  );

  // Top-left cell: rose panel
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: half,
      height: half,
      fill: "#fff1f2",
    }),
  );
  layer.add(
    new Konva.Text({
      x: size * 0.015,
      y: size * 0.015,
      text: "❌",
      fontSize: size * 0.045,
    }),
  );

  // Bottom-left cell: emerald panel
  layer.add(
    new Konva.Rect({
      x: 0,
      y: half,
      width: half,
      height: half,
      fill: "#ecfdf5",
    }),
  );
  layer.add(
    new Konva.Text({
      x: size * 0.015,
      y: half + size * 0.015,
      text: "✅",
      fontSize: size * 0.045,
    }),
  );
}

function drawTwoButton({ layer, img, size }: DrawArgs) {
  // Darkened image
  const imgNode = new Konva.Image({
    image: img,
    x: 0,
    y: 0,
    width: size,
    height: size,
    crop: centerCrop(img),
    filters: [Konva.Filters.Brighten],
  });
  imgNode.brightness(-0.1);
  imgNode.cache();
  layer.add(imgNode);

  // Top-and-bottom black gradient
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: size,
      height: size,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: size },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.45)",
        0.5,
        "rgba(0,0,0,0)",
        1,
        "rgba(0,0,0,0.65)",
      ],
    }),
  );

  // Sweat drop emoji
  layer.add(
    new Konva.Text({
      x: size - size * 0.07,
      y: size * 0.015,
      text: "💧",
      fontSize: size * 0.05,
    }),
  );

  // Two buttons at bottom
  const buttonH = size * 0.085;
  const buttonY = size * 0.77;
  const gap = size * 0.02;
  const buttonW = size * 0.42;

  // Button A (rose-500)
  const buttonAX = size / 2 - buttonW - gap / 2;
  layer.add(
    new Konva.Rect({
      x: buttonAX,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      fill: "#f43f5e",
      cornerRadius: 6,
      stroke: "rgba(253, 164, 175, 0.8)",
      strokeWidth: 2,
      shadowColor: "black",
      shadowBlur: 10,
      shadowOpacity: 0.35,
      shadowOffsetY: 4,
    }),
  );

  // Button B (sky-500)
  const buttonBX = size / 2 + gap / 2;
  layer.add(
    new Konva.Rect({
      x: buttonBX,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      fill: "#0ea5e9",
      cornerRadius: 6,
      stroke: "rgba(125, 211, 252, 0.8)",
      strokeWidth: 2,
      shadowColor: "black",
      shadowBlur: 10,
      shadowOpacity: 0.35,
      shadowOffsetY: 4,
    }),
  );
}

function drawExpandingBrain({ layer, img, size }: DrawArgs) {
  const imgWidth = size * 0.42;
  const rowHeight = size / 4;
  const crop = centerCrop(img);

  // White background (caption area on right of each row)
  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: size, height: size, fill: "#fff" }),
  );

  // Row 1: grayscale + dim
  const r1 = new Konva.Image({
    image: img,
    x: 0,
    y: 0,
    width: imgWidth,
    height: rowHeight,
    crop,
    filters: [
      Konva.Filters.Grayscale,
      Konva.Filters.Brighten,
      Konva.Filters.Contrast,
    ],
  });
  r1.brightness(-0.1);
  r1.contrast(-15);
  r1.cache();
  layer.add(r1);

  // Row 2: normal
  const r2 = new Konva.Image({
    image: img,
    x: 0,
    y: rowHeight,
    width: imgWidth,
    height: rowHeight,
    crop,
  });
  layer.add(r2);

  // Row 3: saturated + bright
  const r3 = new Konva.Image({
    image: img,
    x: 0,
    y: rowHeight * 2,
    width: imgWidth,
    height: rowHeight,
    crop,
    filters: [Konva.Filters.HSL, Konva.Filters.Brighten, Konva.Filters.Contrast],
  });
  r3.saturation(0.5);
  r3.brightness(0.1);
  r3.contrast(15);
  r3.cache();
  layer.add(r3);

  // Row 4: cosmic
  const r4 = new Konva.Image({
    image: img,
    x: 0,
    y: rowHeight * 3,
    width: imgWidth,
    height: rowHeight,
    crop,
    filters: [Konva.Filters.HSL, Konva.Filters.Brighten, Konva.Filters.Contrast],
  });
  r4.saturation(1);
  r4.brightness(0.25);
  r4.contrast(25);
  r4.hue(30);
  r4.cache();
  layer.add(r4);

  // Cosmic gradient overlay on row 4
  layer.add(
    new Konva.Rect({
      x: 0,
      y: rowHeight * 3,
      width: imgWidth,
      height: rowHeight,
      fillLinearGradientStartPoint: { x: 0, y: rowHeight * 4 },
      fillLinearGradientEndPoint: { x: imgWidth, y: rowHeight * 3 },
      fillLinearGradientColorStops: [
        0,
        "rgba(217, 70, 239, 0.25)",
        0.5,
        "rgba(0,0,0,0)",
        1,
        "rgba(34, 211, 238, 0.3)",
      ],
    }),
  );

  // Horizontal row borders
  for (let i = 1; i < 4; i++) {
    layer.add(
      new Konva.Line({
        points: [0, i * rowHeight, size, i * rowHeight],
        stroke: "rgba(0,0,0,0.15)",
        strokeWidth: 1,
      }),
    );
  }
  // Vertical divider between image and caption area
  layer.add(
    new Konva.Line({
      points: [imgWidth, 0, imgWidth, size],
      stroke: "rgba(0,0,0,0.15)",
      strokeWidth: 1,
    }),
  );
}

function drawThisIsFine({ layer, img, size }: DrawArgs) {
  // Image with saturation boost
  const imgNode = new Konva.Image({
    image: img,
    x: 0,
    y: 0,
    width: size,
    height: size,
    crop: centerCrop(img),
    filters: [Konva.Filters.HSL],
  });
  imgNode.saturation(0.5);
  imgNode.cache();
  layer.add(imgNode);

  // Warm gradient overlay (bottom-orange to top-rose, with amber midtones)
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: size,
      height: size,
      fillLinearGradientStartPoint: { x: 0, y: size },
      fillLinearGradientEndPoint: { x: 0, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(154, 52, 18, 0.55)",
        0.5,
        "rgba(245, 158, 11, 0.1)",
        1,
        "rgba(190, 18, 60, 0.35)",
      ],
    }),
  );

  // 🔥 emojis (top corners)
  layer.add(
    new Konva.Text({
      x: size * 0.015,
      y: size * 0.015,
      text: "🔥",
      fontSize: size * 0.05,
    }),
  );
  layer.add(
    new Konva.Text({
      x: size - size * 0.07,
      y: size * 0.015,
      text: "🔥",
      fontSize: size * 0.05,
    }),
  );

  // White speech bubble at bottom (for cope text)
  const bubbleX = size * 0.05;
  const bubbleY = size * 0.78;
  const bubbleW = size * 0.9;
  const bubbleH = size * 0.16;
  layer.add(
    new Konva.Rect({
      x: bubbleX,
      y: bubbleY,
      width: bubbleW,
      height: bubbleH,
      fill: "#fff",
      cornerRadius: size * 0.04,
      shadowColor: "black",
      shadowBlur: 10,
      shadowOpacity: 0.35,
      shadowOffsetY: 4,
    }),
  );
}

function drawDistractedBoyfriend({ layer, img, size }: DrawArgs) {
  // Base image
  layer.add(
    new Konva.Image({
      image: img,
      x: 0,
      y: 0,
      width: size,
      height: size,
      crop: centerCrop(img),
    }),
  );

  // Dark gradient (subtle top, stronger bottom for pill readability)
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: size,
      height: size,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: size },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.3)",
        0.5,
        "rgba(0,0,0,0)",
        1,
        "rgba(0,0,0,0.65)",
      ],
    }),
  );

  // 3 colored pills at bottom (amber / rose / sky)
  const pillH = size * 0.075;
  const pillX = size * 0.05;
  const pillW = size * 0.9;
  const pillRadius = pillH / 2;

  const pills = [
    { y: size * 0.66, fill: "rgba(251, 191, 36, 0.95)" },
    { y: size * 0.76, fill: "rgba(244, 63, 94, 0.95)" },
    { y: size * 0.86, fill: "rgba(14, 165, 233, 0.95)" },
  ];

  pills.forEach((p) => {
    layer.add(
      new Konva.Rect({
        x: pillX,
        y: p.y,
        width: pillW,
        height: pillH,
        fill: p.fill,
        cornerRadius: pillRadius,
        shadowColor: "black",
        shadowBlur: 8,
        shadowOpacity: 0.3,
        shadowOffsetY: 2,
      }),
    );
  });
}

export const TEMPLATE_BACKGROUNDS: Record<
  MemeTemplate,
  (args: DrawArgs) => void
> = {
  "top-bottom": drawTopBottom,
  drake: drawDrake,
  "two-button": drawTwoButton,
  "expanding-brain": drawExpandingBrain,
  "this-is-fine": drawThisIsFine,
  "distracted-boyfriend": drawDistractedBoyfriend,
};
