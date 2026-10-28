import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deletePhoto, savePhoto } from "@/lib/photos";

export async function POST(req: Request) {
  const form = await req.formData();
  const personId = String(form.get("personId") ?? "");
  const file = form.get("photo");

  if (!personId) {
    return NextResponse.json({ error: "Choose a person" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No photo" }, { status: 400 });
  }

  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { photoPath: true },
  });
  if (!person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  let photoPath: string;
  try {
    photoPath = await savePhoto(file);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't save that photo." },
      { status: 400 },
    );
  }

  await prisma.person.update({ where: { id: personId }, data: { photoPath } });
  if (person.photoPath) await deletePhoto(person.photoPath);

  return NextResponse.json({ ok: true });
}
