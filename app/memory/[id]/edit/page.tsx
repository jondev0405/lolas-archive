import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";
import EditMemoryForm from "./edit-memory-form";

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const memory = await prisma.memory.findUnique({
    where: { id },
    include: { person: true },
  });
  if (!memory) notFound();

  return (
    <EditMemoryForm
      memoryId={memory.id}
      personName={memory.person.name}
      initialTranscript={memory.transcript}
      hasAudio={!!memory.audioPath}
    />
  );
}

export default function EditMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Editor params={params} />
      </Suspense>
    </main>
  );
}