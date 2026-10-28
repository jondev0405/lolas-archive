import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/json";

const LISTS = ["tags", "foods", "songs", "places", "quotes"] as const;

const BodySchema = z
  .object({
    list: z.enum(LISTS),
    value: z.string().trim().min(1),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid list or value" }, { status: 400 });
  }

  const memory = await prisma.memory.findUnique({
    where: { id },
    select: {
      tags: true,
      foods: true,
      songs: true,
      places: true,
      quotes: true,
    },
  });
  if (!memory) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  const { list, value } = parsed.data;
  const current = parseList(memory[list]);
  const updated = current.filter((item) => item !== value);

  if (updated.length === current.length) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const data =
    list === "tags"
      ? { tags: JSON.stringify(updated) }
      : list === "foods"
        ? { foods: JSON.stringify(updated) }
        : list === "songs"
          ? { songs: JSON.stringify(updated) }
          : list === "places"
            ? { places: JSON.stringify(updated) }
            : { quotes: JSON.stringify(updated) };

  await prisma.memory.update({ where: { id }, data });

  return NextResponse.json({ ok: true, list, values: updated });
}
