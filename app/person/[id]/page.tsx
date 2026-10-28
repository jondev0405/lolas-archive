import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Search } from "lucide-react";
import { prisma } from "../../../lib/db";
import { Candle } from "@/components/candle";
import { Chip } from "@/components/chip";
import { Garland } from "@/components/garland";
import PhotoUploadButton from "./photo-upload-button";
import PrintButton from "./print-button";
import SaveImageButton from "./save-image-button";

type OfferingKind = "food" | "song" | "place";
type PersonSearchParams = { q?: string | string[]; tag?: string | string[] };

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
const focusRingPill =
  "outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

function firstParam(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function personHref(id: string, q: string, tag?: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  const search = params.toString();
  return `/person/${id}${search ? `?${search}` : ""}`;
}

function tagChipClass(active: boolean): string {
  return `inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition ${focusRingPill} ${
    active
      ? "border-marigold bg-marigold text-[#1A0F0A]"
      : "border-line bg-chip text-cream hover:bg-surface2"
  }`;
}

function parseList(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function OfferingIcon({ kind }: { kind: OfferingKind }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      {kind === "food" && (
        <>
          <path d="M3 11h18" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M9 4c0 1.4.9 2 .9 3.4" />
          <path d="M14 4c0 1.4.9 2 .9 3.4" />
        </>
      )}
      {kind === "song" && (
        <>
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </>
      )}
      {kind === "place" && (
        <>
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      )}
    </svg>
  );
}

async function Ofrenda({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<PersonSearchParams>;
}) {
  await connection();
  const { id } = await params;
  const { q, tag } = await searchParams;
  const query = firstParam(q).trim();
  const activeTag = firstParam(tag).trim();
  const normalizedQuery = query.toLowerCase();

  const person = await prisma.person.findUnique({
    where: { id },
    include: { memories: { orderBy: { createdAt: "desc" } } },
  });
  if (!person) notFound();

  const allMemories = person.memories.map((m) => ({
    ...m,
    tags: parseList(m.tags),
    quotes: parseList(m.quotes),
    foods: parseList(m.foods),
    songs: parseList(m.songs),
    places: parseList(m.places),
  }));

  const memories = allMemories.filter((memory) => {
    if (activeTag && !memory.tags.includes(activeTag)) return false;
    if (!normalizedQuery) return true;

    const text = [
      memory.summary ?? "",
      memory.transcript,
      ...memory.tags,
      ...memory.foods,
      ...memory.songs,
      ...memory.places,
      ...memory.quotes,
    ]
      .join("\n")
      .toLowerCase();

    return text.includes(normalizedQuery);
  });

  const allTags = unique(allMemories.flatMap((m) => m.tags));
  const foods = unique(allMemories.flatMap((m) => m.foods));
  const songs = unique(allMemories.flatMap((m) => m.songs));
  const places = unique(allMemories.flatMap((m) => m.places));

  const offerings = [
    ...foods.map((item) => ({
      kind: "food" as const,
      label: "Favorite food",
      item,
      count: allMemories.filter((m) => m.foods.includes(item)).length,
    })),
    ...songs.map((item) => ({
      kind: "song" as const,
      label: "A song remembered",
      item,
      count: allMemories.filter((m) => m.songs.includes(item)).length,
    })),
    ...places.map((item) => ({
      kind: "place" as const,
      label: "A place remembered",
      item,
      count: allMemories.filter((m) => m.places.includes(item)).length,
    })),
  ];

  const countParts = [
    allMemories.length > 0 ? plural(allMemories.length, "memory", "memories") : null,
    foods.length > 0 ? plural(foods.length, "food", "foods") : null,
    songs.length > 0 ? plural(songs.length, "song", "songs") : null,
    places.length > 0 ? plural(places.length, "place", "places") : null,
  ].filter((part): part is string => part !== null);
  const hasFilters = query.length > 0 || activeTag.length > 0;

  return (
    <>
      <div id="ofrenda-export">
        <section className="relative pb-8 pt-14 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[min(1000px,100%)] -translate-x-1/2 print:hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(244,166,42,0.22) 0%, rgba(244,166,42,0) 70%)",
          }}
        />

        <div className="relative flex flex-col items-center">
          <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-6 sm:gap-x-6">
            <Candle height={64} />
            <Candle height={92} />
            <div
              role="img"
              aria-label={
                person.photoPath
                  ? `Portrait of ${person.name}`
                  : `Portrait placeholder for ${person.name}`
              }
              className="relative flex h-[188px] w-[188px] items-center justify-center overflow-hidden rounded-full border-[3px] border-marigold bg-surface2 print:shadow-none"
              style={{ boxShadow: "0 0 70px rgba(244,166,42,0.35)" }}
            >
              {person.photoPath ? (
                <Image
                  src={`/api/photo/${person.id}`}
                  alt=""
                  fill
                  unoptimized
                  sizes="188px"
                  className="object-cover"
                />
              ) : (
                <span aria-hidden="true" className="font-display text-[64px] leading-none text-cream">
                  {initialsOf(person.name)}
                </span>
              )}
            </div>
            <Candle height={88} />
            <Candle height={60} />
          </div>

          <div className="mt-6 flex w-full justify-center">
            <Garland width="min(360px, 80%)" />
          </div>

          <h1 className="mt-7 font-display text-[clamp(48px,8vw,88px)] leading-[1.05]">
            {person.name}
          </h1>

          <p className="mt-3 text-lg text-muted">
            {person.relationship ? `${person.relationship} · ` : ""}
            Remembered by their family
          </p>

          {countParts.length > 0 && (
            <p className="mt-3 text-sm text-muted-dim">{countParts.join(" · ")}</p>
          )}

          <div
            className="mt-8 flex flex-wrap justify-center gap-3 print:hidden"
            data-export-hide="true"
          >
            <PhotoUploadButton personId={person.id} hasPhoto={!!person.photoPath} />
            <PrintButton />
            <SaveImageButton personName={person.name} targetId="ofrenda-export" />
          </div>
        </div>
      </section>

      <section aria-labelledby="ofrenda-heading" className="mt-12">
        <h2 id="ofrenda-heading" className="font-display text-[36px] leading-tight">
          On the ofrenda
        </h2>
        <p className="mt-2 text-muted">
          Everything placed here came from something their family said.
        </p>

        {offerings.length > 0 ? (
          <>
            <div className="mt-8 flex flex-wrap gap-5">
              {offerings.map((offering) => (
                <article
                  key={`${offering.kind}-${offering.item}`}
                  className="flex min-w-[280px] flex-1 basis-[280px] flex-col rounded-3xl border border-line bg-surface p-7"
                >
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line bg-surface2 text-marigold">
                    <OfferingIcon kind={offering.kind} />
                  </div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {offering.label}
                  </p>
                  <h3 className="mt-1 font-display text-[32px] leading-tight">{offering.item}</h3>
                  <p className="mt-4 text-sm text-muted-dim">
                    Mentioned in {plural(offering.count, "memory", "memories")}
                  </p>
                </article>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="mt-6 h-2 rounded-full print:hidden"
              style={{
                background:
                  "linear-gradient(90deg, rgba(107,74,54,0) 0%, #6B4A36 12%, #6B4A36 88%, rgba(107,74,54,0) 100%)",
              }}
            />
          </>
        ) : (
          <p className="mt-8 rounded-3xl border border-line bg-surface px-7 py-10 text-center text-muted">
            No offerings have been gathered yet. Preserve a memory to begin.
          </p>
        )}
      </section>

      <section aria-labelledby="memories-heading" className="mt-16">
        <h2 id="memories-heading" className="font-display text-[36px] leading-tight">
          Memories
        </h2>

        <form
          method="get"
          role="search"
          aria-label="Search memories"
          className="mt-6 flex flex-wrap items-center gap-3 print:hidden"
          data-export-hide="true"
        >
          <div className="relative min-w-[240px] flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              aria-label="Search memories by tag or name"
              placeholder="Search tags or names"
              className={`min-h-11 w-full rounded-full border border-line-strong bg-surface pl-11 pr-4 text-cream placeholder:text-muted-dim ${focusRingPill}`}
            />
          </div>
          {activeTag && <input type="hidden" name="tag" value={activeTag} />}
        </form>

        <div className="mb-8 mt-3 flex flex-wrap gap-2 print:hidden" data-export-hide="true">
          <Link
            href={personHref(person.id, query)}
            aria-current={activeTag ? undefined : "true"}
            className={tagChipClass(!activeTag)}
          >
            All
          </Link>
          {allTags.map((tagItem) => (
            <Link
              key={tagItem}
              href={personHref(person.id, query, tagItem)}
              aria-current={activeTag === tagItem ? "true" : undefined}
              className={tagChipClass(activeTag === tagItem)}
            >
              {tagItem}
            </Link>
          ))}
        </div>

        {memories.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {memories.map((memory) => (
              <article
                key={memory.id}
                className="flex min-w-[min(480px,100%)] flex-1 basis-[480px] flex-col gap-6 rounded-3xl border border-line bg-surface p-6 break-inside-avoid sm:p-8"
              >
                {memory.summary ? (
                  <h3 className="font-display text-[28px] leading-tight">{memory.summary}</h3>
                ) : (
                  <div>
                    <p className="leading-relaxed text-muted">
                      {memory.transcript.slice(0, 140)}
                      {memory.transcript.length > 140 ? "…" : ""}
                    </p>
                    <Link
                      href={`/memory/${memory.id}/edit`}
                      className={`mt-3 inline-block font-semibold text-marigold underline underline-offset-4 print:hidden ${focusRing}`}
                      data-export-hide="true"
                    >
                      Gather memories
                    </Link>
                  </div>
                )}

                {memory.quotes.length > 0 && (
                  <div className="space-y-4">
                    {memory.quotes.map((quote) => (
                      <figure key={quote} className="rounded-[18px] border border-line bg-ink p-6">
                        <span
                          aria-hidden="true"
                          className="block font-display text-5xl leading-[0.7] text-marigold"
                        >
                          &ldquo;
                        </span>
                        <blockquote className="mt-3 font-display text-[clamp(24px,4.5vw,30px)] italic leading-snug">
                          {quote}
                        </blockquote>
                        <figcaption className="mt-4 flex items-center gap-2 text-sm text-muted">
                          <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-marigold" />
                          Their exact words, from the recording
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}

                {memory.audioPath && (
                  <div className="print:hidden" data-export-hide="true">
                    <audio
                      controls
                      src={`/api/audio/${memory.id}`}
                      className="w-full"
                      style={{ accentColor: "#F4A62A" }}
                    />
                  </div>
                )}

                {memory.tags.length > 0 && (
                  <ul aria-label="Tags" className="flex flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <li key={tag}>
                        <Chip>{tag}</Chip>
                      </li>
                    ))}
                  </ul>
                )}

                <details className="mt-auto print:hidden" data-export-hide="true">
                  <summary
                    className={`w-fit cursor-pointer text-sm font-semibold text-marigold underline underline-offset-4 ${focusRing}`}
                  >
                    Read the full transcript
                  </summary>
                  <div className="mt-4 space-y-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                      {memory.transcript}
                    </p>
                    <Link
                      href={`/memory/${memory.id}/edit`}
                      className={`inline-block text-sm font-semibold text-marigold underline underline-offset-4 ${focusRing}`}
                    >
                      Edit transcript
                    </Link>
                  </div>
                </details>
              </article>
            ))}
          </div>
        ) : hasFilters ? (
          <p className="rounded-3xl border border-line bg-surface px-7 py-10 text-center text-muted">
            No memories match that search.{" "}
            <Link
              href={`/person/${person.id}`}
              className={`font-semibold text-marigold underline underline-offset-4 ${focusRing}`}
            >
              Clear filters
            </Link>
          </p>
        ) : (
          <p className="rounded-3xl border border-line bg-surface px-7 py-10 text-center text-muted">
            No memories have been preserved yet.
          </p>
        )}
        </section>
      </div>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted">
        <p>
          Lola&apos;s Archive organized what their family said. It did not write anything in
          anyone&apos;s voice. Stored on this device only.
        </p>
        <Link
          href="/"
          className={`font-semibold text-marigold underline underline-offset-4 ${focusRing}`}
        >
          Back to all people
        </Link>
      </footer>
    </>
  );
}

export default function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<PersonSearchParams>;
}) {
  return (
    <main className="pb-20">
      <div className="mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,48px)]">
        <Suspense
          fallback={<p className="py-20 text-center text-muted">Lighting the ofrenda…</p>}
        >
          <Ofrenda params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
