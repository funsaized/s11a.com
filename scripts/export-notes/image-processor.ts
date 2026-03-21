import { writeFileSync, mkdirSync, statSync } from "fs";
import sharp from "sharp";
import type { ProcessedImage } from "./types";

/**
 * Detect HEIC/HEIF format from file signature bytes.
 * HEIC: bytes 4-7 = "ftyp", bytes 8-11 = brand identifier.
 */
function isHeic(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const ftyp = buffer.slice(4, 8).toString("ascii");
  const brand = buffer.slice(8, 12).toString("ascii");
  return (
    ftyp === "ftyp" && /^(heic|heif|mif1|heis|hevx|heim|heix)$/i.test(brand)
  );
}

/**
 * Detect image format from buffer magic bytes, with MIME type fallback.
 */
function detectFormat(
  buffer: Buffer,
  mimeFromUrl?: string,
): "jpeg" | "png" | "webp" {
  // JPEG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpeg";
  }
  // PNG: 89 50 4E 47
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  // Fallback to MIME type hint
  if (mimeFromUrl?.includes("png")) return "png";
  if (mimeFromUrl?.includes("webp")) return "webp";
  return "jpeg";
}

/**
 * Extract images from Apple Notes HTML body.
 *
 * - Decodes base64 data URL images to Buffer
 * - Downloads remote images via fetch
 * - Detects HEIC and converts to JPEG via sharp
 * - Replaces <img> tags with markdown image syntax
 *
 * NOTE: This function is ASYNC (downloads images via fetch).
 * The orchestrator must `await extractImages(...)`.
 */
export async function extractImages(
  htmlBody: string,
  noteSlug: string,
): Promise<{ images: ProcessedImage[]; updatedHtml: string }> {
  const images: ProcessedImage[] = [];
  let updatedHtml = htmlBody;
  let imageIndex = 0;

  // Match all <img> tags — collect from ORIGINAL html
  const imgTagRegex = /<img[^>]*src=["']?([^"'>\s]+)["']?[^>]*>/gi;
  const matches = [...htmlBody.matchAll(imgTagRegex)];

  for (const match of matches) {
    const fullImgTag = match[0];
    const src = match[1];
    const indexStr = String(imageIndex).padStart(3, "0");

    try {
      let rawBuffer: Buffer | null = null;
      let mimeHint: string | undefined;

      if (src.startsWith("data:image/")) {
        // Base64 data URL: data:image/{type};base64,{data}
        const commaIdx = src.indexOf(",");
        if (commaIdx === -1) {
          console.warn(`Skipping malformed data URL in note: ${noteSlug}`);
          continue;
        }
        const header = src.slice(5, commaIdx); // e.g. "image/png;base64"
        mimeHint = header.split(";")[0]; // e.g. "image/png"
        const b64 = src.slice(commaIdx + 1);
        rawBuffer = Buffer.from(b64, "base64");
      } else if (src.startsWith("http://") || src.startsWith("https://")) {
        // Web URL — download with fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        try {
          const resp = await fetch(src, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!resp.ok) {
            console.warn(`Failed to download image (${resp.status}): ${src}`);
            continue;
          }
          const contentLength = resp.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
            console.warn(`Image too large (>50MB), skipping: ${src}`);
            continue;
          }
          rawBuffer = Buffer.from(await resp.arrayBuffer());
          mimeHint = resp.headers.get("content-type") || undefined;
        } finally {
          clearTimeout(timeoutId);
        }
      } else {
        // Apple internal ref or unrecognized — skip
        console.warn(
          `Skipping unrecognized image src in note ${noteSlug}: ${src.slice(0, 80)}`,
        );
        continue;
      }

      if (!rawBuffer || rawBuffer.length === 0) continue;

      // Convert HEIC to JPEG via sharp
      let finalBuffer = rawBuffer;
      let format: "jpeg" | "png" | "webp" = detectFormat(rawBuffer, mimeHint);

      if (isHeic(rawBuffer)) {
        finalBuffer = await sharp(rawBuffer).jpeg({ quality: 85 }).toBuffer();
        format = "jpeg";
      }

      const ext = format === "jpeg" ? "jpg" : format;
      const filename = `${noteSlug}-${indexStr}.${ext}`;
      images.push({ filename, data: finalBuffer, format });

      // Replace <img> tag with markdown image syntax
      // Uses .replace (not .replaceAll) so each duplicate tag is replaced once in order
      const altText = `${noteSlug} ${indexStr}`;
      const mdImage = `![${altText}](/images/articles/${filename})`;
      updatedHtml = updatedHtml.replace(fullImgTag, mdImage);
      imageIndex++;
    } catch (err) {
      console.warn(
        `Failed to process image in note ${noteSlug}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return { images, updatedHtml };
}

/**
 * Write processed images to disk.
 * Creates the target directory if it doesn't exist.
 * All images are written flat (no subdirectories).
 */
export function writeImages(images: ProcessedImage[], imageDir: string): void {
  mkdirSync(imageDir, { recursive: true });

  for (const img of images) {
    const destPath = `${imageDir}/${img.filename}`;
    writeFileSync(destPath, img.data);
    const stats = statSync(destPath);
    if (stats.size === 0) {
      console.warn(`Warning: Written image is empty: ${destPath}`);
    }
  }

  if (images.length > 0) {
    console.log(`Wrote ${images.length} images to ${imageDir}`);
  }
}
