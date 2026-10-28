import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_PHOTO_MB = 10;

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const EXTENSIONS_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function uploadsDir(): string {
  return path.join(process.cwd(), "uploads");
}

export function photoContentType(fileName: string): string {
  return CONTENT_TYPES[path.extname(fileName).toLowerCase()] ?? "application/octet-stream";
}

function photoExtension(file: File): string | null {
  const fromName = path.extname(file.name).toLowerCase();
  if (CONTENT_TYPES[fromName]) return fromName;
  return EXTENSIONS_BY_TYPE[file.type.toLowerCase()] ?? null;
}

export async function savePhoto(file: File): Promise<string> {
  if (file.size === 0) {
    throw new Error("That photo is empty. Please choose another one.");
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    throw new Error(`That photo is over ${MAX_PHOTO_MB} MB. Please choose a smaller one.`);
  }

  const extension = photoExtension(file);
  if (!extension) {
    throw new Error("Please choose a JPG, PNG, WebP, GIF or AVIF image.");
  }

  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  const fileName = `${randomUUID()}${extension}`;
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  return `uploads/${fileName}`;
}

export function photoFilePath(photoPath: string): string {
  return path.join(uploadsDir(), path.basename(photoPath));
}

export async function deletePhoto(photoPath: string): Promise<void> {
  try {
    await unlink(photoFilePath(photoPath));
  } catch {
    // The old photo may already be gone; losing it is not an error.
  }
}
