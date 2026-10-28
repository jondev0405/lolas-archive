import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/db";

const CONTENT_TYPES: Record<string, string> = {
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
  ".ogg": "audio/ogg",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();
  const { id } = await params;
  const memory = await prisma.memory.findUnique({
    where: { id },
    select: { audioPath: true },
  });
  if (!memory?.audioPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fileName = path.basename(memory.audioPath);
  if (!fileName) {
    return new NextResponse("Not found", { status: 404 });
  }
  const filePath = path.join(process.cwd(), "uploads", fileName);

  try {
    const file = await readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
