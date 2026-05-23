const MAX_DIM = 1024;
const JPEG_QUALITY = 0.85;

/**
 * Compress and downscale a File to a 1024px-max JPEG File.
 * Used right after upload so the rest of the pipeline (preview, AI, editor)
 * operates on a small, normalized image.
 */
export async function compressFile(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const { width, height } = scaleDown(img.width, img.height, MAX_DIM);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported on this device");
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) throw new Error("Failed to compress image");

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Read a File as a base64 data URL. No compression — assumes the file has
 * already been compressed (e.g. by compressFile on upload).
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unexpected reader result"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress AND return a data URL in one shot.
 * Kept for legacy callers; new code should use compressFile + fileToDataUrl
 * separately so the compression step doesn't run twice.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const compressed = await compressFile(file);
  return fileToDataUrl(compressed);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to read image"));
    img.src = src;
  });
}

function scaleDown(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}
