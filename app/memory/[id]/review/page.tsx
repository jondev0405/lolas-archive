import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { parseList } from "@/lib/json";
import ReviewPanel from "./review-panel";

async function Review({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const memory = await prisma.memory.findUnique({
    where: { id },
    include: { person: true },
  });
  if (!memory) notFound();

  const tags = [...new Set(parseList(memory.tags))];
  const foods = [...new Set(parseList(memory.foods))];
  const songs = [...new Set(parseList(memory.songs))];
  const places = [...new Set(parseList(memory.places))];
  const quotes = [...new Set(parseList(memory.quotes))];

  return (
    <>
      <header className="mb-8">
        <p className="text-sm text-muted">{memory.person.name} · New memory</p>
        <h1 className="mt-2 font-display text-[clamp(44px,6vw,64px)] leading-tight">
          Check what was said
        </h1>
        <p className="mt-3 max-w-[680px] text-lg leading-relaxed text-muted">
          Fix any words the transcription got wrong. Only the text you see here is used to
          gather memories.
        </p>
      </header>

      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-[min(460px,100%)] flex-1 basis-[460px] space-y-4">
          {memory.audioPath && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <audio
                controls
                aria-label={`Original recording for ${memory.person.name}`}
                src={`/api/audio/${memory.id}`}
                className="w-full"
                style={{ accentColor: "#F4A62A" }}
              />
            </div>
          )}

          <section
            aria-labelledby="transcript-heading"
            className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
          >
            <h2 id="transcript-heading" className="font-display text-2xl">
              Transcript
            </h2>
            <p className="mt-4 whitespace-pre-wrap break-words rounded-2xl border border-line-strong bg-ink p-5 font-display text-[21px] leading-[1.6] text-cream">
              {memory.transcript}
            </p>
          </section>
        </div>

        <ReviewPanel
          memoryId={memory.id}
          personId={memory.personId}
          personName={memory.person.name}
          summary={memory.summary}
          tags={tags}
          foods={foods}
          songs={songs}
          places={places}
          quotes={quotes}
        />
      </div>
    </>
  );
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="pb-20">
      <div className="mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,48px)] py-10">
        <Suspense
          fallback={<p className="py-20 text-center text-muted">Lighting the ofrenda…</p>}
        >
          <Review params={params} />
        </Suspense>
      </div>
    </main>
  );
}
