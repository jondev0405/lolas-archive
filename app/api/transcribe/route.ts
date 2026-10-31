import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../../../lib/db";
import { deletePhoto, savePhoto } from "../../../lib/photos";

export const maxDuration = 300;

const TRANSCRIBE_URL = process.env.TRANSCRIBE_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  let personId = String(form.get("personId") ?? "");
  const newName = String(form.get("newName") ?? "").trim();
  if (!personId && !newName) {
    return NextResponse.json({ error: "Choose or name a person" }, { status: 400 });
  }

  const photo = form.get("photo");
  let photoPath: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await savePhoto(photo);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Couldn't save that photo." },
        { status: 400 },
      );
    }
  }

  if (!personId) {
    const p = await prisma.person.create({
      data: {
        name: newName,
        relationship: String(form.get("relationship") ?? "") || null,
        photoPath,
      },
    });
    personId = p.id;
  } else if (photoPath) {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { photoPath: true },
    });
    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }
    await prisma.person.update({ where: { id: personId }, data: { photoPath } });
    if (person.photoPath) await deletePhoto(person.photoPath);
  }

  // Keep a copy of the audio on this machine
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  const audioName = `${randomUUID()}${path.extname(file.name) || ".webm"}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, audioName), buf);

  // Send to the local Whisper service
  const fd = new FormData();
  fd.append("file", new Blob([buf]), audioName);
  const lang = process.env.WHISPER_LANGUAGE;
  const url = `${TRANSCRIBE_URL}/transcribe${lang ? `?language=${lang}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, { method: "POST", body: fd });
  } catch {
    return NextResponse.json(
      { error: "The transcription service isn't running (port 8000)." },
      { status: 503 },
    );
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Whisper service error", res.status, detail);
    return NextResponse.json(
        { error: `Transcription failed (${res.status}): ${detail.slice(0, 200)}` },
        { status: 502 },
    );
  }
  const { text } = await res.json();

  const memory = await prisma.memory.create({
    data: { personId, transcript: text, audioPath: `uploads/${audioName}` },
  });
  return NextResponse.json({ memoryId: memory.id });
}