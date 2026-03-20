import { z } from "zod";

/** Allowed image MIME types in data URLs (must match FilePond `acceptedFileTypes`). */
export const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
] as const;

/** Max decoded image size (bytes) — same limit on client (FilePond) and server (Zod). */
export const MAX_UPLOAD_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Max width/height after resize (contain) before sending to the server. */
export const UPLOAD_MAX_DIMENSION = 2048;

/** Data URL prefix check (jpeg + jpg + png + webp + gif). */
export const IMAGE_DATA_URL_REGEX = /^data:image\/(png|jpe?g|webp|gif);base64,/i;

export function approxDecodedBytesFromDataUrl(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const b64 = dataUrl.slice(comma + 1).replace(/\s/g, "");
  if (!b64) return 0;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

export const imageDataUrlSchema = z
  .string()
  .min(1, "Obrázok je povinný")
  .refine((s) => IMAGE_DATA_URL_REGEX.test(s), {
    message: "Povolené formáty: PNG, JPEG, WebP, GIF",
  })
  .refine((s) => approxDecodedBytesFromDataUrl(s) > 0, {
    message: "Neplatné dáta obrázka",
  })
  .refine((s) => approxDecodedBytesFromDataUrl(s) <= MAX_UPLOAD_IMAGE_BYTES, {
    message: `Maximálna veľkosť súboru je ${MAX_UPLOAD_IMAGE_BYTES / 1024 / 1024} MB`,
  });
