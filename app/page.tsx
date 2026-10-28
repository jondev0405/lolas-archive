import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { Check, Mic, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/button";
import { Candle } from "@/components/candle";
import { Garland } from "@/components/garland";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

type HomeSearchParams = { q?: string | string[] };

function firstParam(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const STEPS = [
  {
    title: "Listen",
    text: "Upload a voice note about someone you love. Whisper turns it into text on your computer, so the audio never leaves it.",
  },
  {
    title: "Gather",
    text: "A local model pulls out foods, songs, places, tags and exact quotes. You read it all and fix anything before it is saved.",
  },
  {
    title: "Light",
    text: "Your memories become an ofrenda page you can search and print.",
  },
] as const;

const PRIVACY_POINTS = [
  "Transcribed locally with faster-whisper",
  "Organized by a local Ollama model",
  "Quotes kept only if they appear word for word",
] as const;

const TIER_CIRCLES = {
  middle: ["#6B4A36", "#8E5BD6", "#6B4A36", "#2FB5A8"],
  bottom: ["#E0457B", "#6B4A36", "#F4A62A", "#6B4A36", "#E0457B"],
} as const;

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function Altar() {
  return (
    <div aria-hidden="true" className="relative flex flex-col items-center justify-center">
      <div
        className="pointer-events-none absolute left-1/2 top-6 h-[440px] w-[min(620px,100%)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(244,166,42,0.22) 0%, rgba(244,166,42,0) 70%)",
        }}
      />

      <div className="relative flex items-end justify-center gap-[22px]">
        {[64, 88, 72, 96, 60].map((height, index) => (
          <Candle key={index} height={height} />
        ))}
      </div>

      <div className="relative mt-2 flex w-full flex-col items-center gap-1">
        <div className="flex flex-col items-center" style={{ width: 210, maxWidth: "100%" }}>
          <Garland width="100%" />
          <div className="flex h-14 w-full items-center justify-center rounded-xl border border-line bg-surface2">
            <div className="h-8 w-10 rounded-[6px] border-2 border-marigold" />
          </div>
        </div>

        <div className="flex flex-col items-center" style={{ width: 320, maxWidth: "100%" }}>
          <Garland width="100%" />
          <div className="flex w-full items-center justify-center gap-4 rounded-xl border border-line bg-surface2 px-4 py-5">
            {TIER_CIRCLES.middle.map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-[30px] w-[30px] rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center" style={{ width: 420, maxWidth: "100%" }}>
          <Garland width="100%" />
          <div className="flex w-full items-center justify-center gap-4 rounded-xl border border-line bg-surface2 px-4 py-5">
            {TIER_CIRCLES.bottom.map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-9 w-9 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function HomeContent({ searchParams }: { searchParams: Promise<HomeSearchParams> }) {
  await connection();
  const { q } = await searchParams;
  const query = firstParam(q).trim();
  const normalizedQuery = query.toLowerCase();

  const allPeople = await prisma.person.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memories: true } } },
  });

  const people = normalizedQuery
    ? allPeople.filter((person) => person.name.toLowerCase().includes(normalizedQuery))
    : allPeople;

  return (
    <>
      <section className="flex flex-wrap items-center gap-12 py-12 lg:py-16">
        <div className="min-w-[min(460px,100%)] flex-1 basis-[460px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-marigold">
            For Undas and Día de los Muertos
          </p>
          <h1 className="mt-4 font-display text-[clamp(44px,6vw,76px)] leading-[1.05]">
            Keep the <em className="italic text-marigold">stories</em> your family tells.
          </h1>
          <p className="mt-5 max-w-[540px] text-lg leading-relaxed text-muted">
            Upload a voice note about someone you love. Lola&apos;s Archive writes it down on
            your own computer, finds the foods, songs, places and exact words, and lights an
            ofrenda in their memory.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/new">
                <Mic aria-hidden="true" className="h-5 w-5" />
                Preserve a memory
              </Link>
            </Button>
            {allPeople.length > 0 && (
              <Button asChild variant="ghost" size="lg" className="rounded-full">
                <Link href={`/person/${allPeople[0].id}`}>See a sample ofrenda</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="min-w-[min(380px,100%)] flex-1 basis-[380px]">
          <Altar />
        </div>
      </section>

      <section aria-labelledby="how-heading" className="mt-16">
        <h2 id="how-heading" className="font-display text-[36px] leading-tight">
          How it works
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-line bg-surface p-7">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-marigold font-display text-2xl font-semibold text-ink">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-2xl">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="remembered-heading" className="mt-16">
        <h2 id="remembered-heading" className="font-display text-[36px] leading-tight">
          Remembered here
        </h2>

        <form method="get" role="search" aria-label="Search people" className="mt-6 max-w-md">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              aria-label="Search people by name"
              placeholder="Search people by name"
              className={`min-h-11 w-full rounded-full border border-line-strong bg-surface pl-11 pr-4 text-cream placeholder:text-muted-dim ${focusRing}`}
            />
          </div>
        </form>

        {query && people.length === 0 && allPeople.length > 0 && (
          <p className="mt-5 rounded-3xl border border-line bg-surface px-7 py-6 text-center text-muted">
            No one matches that search.{" "}
            <Link
              href="/"
              className={`font-semibold text-marigold underline underline-offset-4 ${focusRing}`}
            >
              Clear search
            </Link>
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-5">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/person/${person.id}`}
              className={`flex min-w-[min(380px,100%)] flex-1 basis-[380px] items-center gap-5 rounded-3xl border border-line bg-surface p-6 transition hover:bg-surface2 ${focusRing}`}
            >
              <span className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-marigold bg-surface2 font-display text-2xl">
                {person.photoPath ? (
                  <Image
                    src={`/api/photo/${person.id}`}
                    alt=""
                    fill
                    unoptimized
                    sizes="72px"
                    className="object-cover"
                  />
                ) : (
                  initialsOf(person.name)
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-[26px] leading-tight">
                  {person.name}
                </span>
                <span className="mt-1 block text-muted">
                  {person.relationship ? `${person.relationship} · ` : ""}
                  {plural(person._count.memories, "memory", "memories")}
                </span>
              </span>
            </Link>
          ))}

          <Link
            href="/new"
            className={`flex min-w-[min(380px,100%)] flex-1 basis-[380px] items-center gap-5 rounded-3xl border border-dashed border-line-strong p-6 transition hover:bg-surface ${focusRing}`}
          >
            <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-line-strong text-marigold">
              <Plus aria-hidden="true" className="h-7 w-7" />
            </span>
            <span>
              <span className="block font-display text-[26px] leading-tight">
                Remember someone
              </span>
              <span className="mt-1 block text-muted">Start with one voice note</span>
            </span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="private-heading" className="mt-16">
        <div className="rounded-3xl border border-line bg-surface p-7 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 id="private-heading" className="font-display text-[32px] leading-tight sm:text-[36px]">
                Private by design
              </h2>
              <p className="mt-3 max-w-[520px] leading-relaxed text-muted">
                No account and no cloud upload. Your recordings, transcripts and memories are
                stored on this computer.
              </p>
            </div>
            <ul className="space-y-3">
              {PRIVACY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-marigold" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mt-16 text-sm text-muted">
        <p>
          Lola&apos;s Archive organizes what your family said. It never writes in anyone&apos;s
          voice.
        </p>
      </footer>
    </>
  );
}

export default function Home({ searchParams }: { searchParams: Promise<HomeSearchParams> }) {
  return (
    <main className="pb-20">
      <div className="mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,48px)]">
        <Suspense fallback={<p className="py-20 text-center text-muted">Loading…</p>}>
          <HomeContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
