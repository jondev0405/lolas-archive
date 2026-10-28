import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/db";
import NewMemoryForm from "./new-memory-form";

async function Form() {
  await connection();
  const people = await prisma.person.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return <NewMemoryForm people={people} />;
}

export default function NewPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-5xl">Preserve a memory</h1>
      <p className="mt-3 mb-10 text-lg text-muted">
        One voice note at a time. Everything stays on this device.
      </p>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Form />
      </Suspense>
    </main>
  );
}