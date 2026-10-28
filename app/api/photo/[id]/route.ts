import { readFile } from "node:fs/promises";
import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { deletePhoto, photoContentType, photoFilePath } from "@/lib/photos";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();
  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    select: { photoPath: true },
  });
  if (!person?.photoPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(photoFilePath(person.photoPath));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": photoContentType(person.photoPath),
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    select: { photoPath: true },
  });
  if (!person) {
    return new NextResponse("Not found", { status: 404 });
  }

  await prisma.person.update({ where: { id }, data: { photoPath: null } });
  if (person.photoPath) await deletePhoto(person.photoPath);

  return NextResponse.json({ ok: true });
}
