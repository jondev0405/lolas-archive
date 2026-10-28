import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractMemories } from "@/lib/extract";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { memoryId, transcript } = await req.json();
  if (typeof memoryId !== "string" || !memoryId) {
    return NextResponse.json({ error: "Memory is required" }, { status: 400 });
  }
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    include: { person: true },
  });
  if (!memory) return NextResponse.json({ error: "Memory not found" }, { status: 404 });

  const text = String(transcript ?? memory.transcript).trim();
  if (!text) return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });

  const relationship = memory.person.relationship?.trim();
  const personLabel = relationship
    ? `${memory.person.name} (${relationship})`
    : memory.person.name;

  let r;
  try {
    r = await extractMemories(text, personLabel);
  } catch {
    return NextResponse.json(
      { error: "Couldn't gather memories. Is Ollama running?" },
      { status: 502 },
    );
  }

  await prisma.memory.update({
    where: { id: memoryId },
    data: {
      transcript: text,
      summary: r.summary,
      tags: JSON.stringify(r.tags),
      foods: JSON.stringify(r.foods),
      songs: JSON.stringify(r.songs),
      places: JSON.stringify(r.places),
      quotes: JSON.stringify(r.quotes),
    },
  });
  return NextResponse.json({ memoryId, personId: memory.personId });
}