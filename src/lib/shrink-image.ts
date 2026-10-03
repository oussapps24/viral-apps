/**
 * Browser-side: resizes a photo to fit `maxSide` and re-encodes as JPEG, so a
 * 6 MB phone photo becomes ~250 KB. Images with transparency keep it (PNG out). Keeps 5 photos well under Vercel's 4.5 MB
 * body limit. Falls back to the original file if the browser can't decode it.
 */
export async function shrinkImage(file: File, maxSide = 1400, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (file.type === "image/webp" && (await isAnimatedWebp(file))) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    // Transparent PNG/WebP stays transparent (re-encoded as PNG); opaque images go to JPEG.
    const alpha = file.type !== "image/jpeg" && hasAlpha(ctx, w, h);
    const outType = alpha ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, outType, quality));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.\w+$/, "") + (alpha ? ".png" : ".jpg");
    return new File([blob], name, { type: outType });
  } catch {
    return file;
  }
}

function hasAlpha(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 3; i < data.length; i += 16) if (data[i] < 255) return true;
  return false;
}

/** Animated WebP has a VP8X header with the animation flag (bit 1 of byte 20). Re-encoding would flatten it. */
async function isAnimatedWebp(file: File): Promise<boolean> {
  const b = new Uint8Array(await file.slice(0, 21).arrayBuffer());
  const tag = (o: number) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  return b.length === 21 && tag(0) === "RIFF" && tag(8) === "WEBP" && tag(12) === "VP8X" && (b[20] & 0x02) !== 0;
}
