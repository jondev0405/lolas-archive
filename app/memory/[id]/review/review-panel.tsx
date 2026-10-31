"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/button";
import { readableError } from "@/lib/errors";

type ListName = "tags" | "foods" | "songs" | "places" | "quotes";
type Lists = Record<ListName, string[]>;

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

function RemoveButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface2 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40"
    >
      <X aria-hidden="true" className="h-3.5 w-3.5" />
    </button>
  );
}

function OfferingsColumn({
  title,
  singular,
  list,
  items,
  removing,
  onRemove,
}: {
  title: string;
  singular: string;
  list: ListName;
  items: string[];
  removing: string | null;
  onRemove: (list: ListName, value: string) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item}>
              <span className="inline-flex min-h-11 items-center rounded-full border border-marigold pl-4 pr-1">
                {item}
                <RemoveButton
                  label={`Remove ${singular} ${item}`}
                  onClick={() => onRemove(list, item)}
                  disabled={removing !== null}
                />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">None mentioned</p>
      )}
    </div>
  );
}

export default function ReviewPanel({
  memoryId,
  personId,
  personName,
  summary,
  tags,
  foods,
  songs,
  places,
  quotes,
}: {
  memoryId: string;
  personId: string;
  personName: string;
  summary: string | null;
  tags: string[];
  foods: string[];
  songs: string[];
  places: string[];
  quotes: string[];
}) {
  const [lists, setLists] = useState<Lists>({ tags, foods, songs, places, quotes });
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(list: ListName, value: string) {
    if (removing) return;
    setRemoving(`${list}:${value}`);
    setError(null);

    try {
      const res = await fetch(`/api/memory/${memoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list, value }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" && data.error ? data.error : "Couldn't remove that item.",
        );
      }
      setLists((current) => ({
        ...current,
        [list]: current[list].filter((item) => item !== value),
      }));
    } catch (err) {
      setError(readableError(err, "Couldn't remove that item. Please try again."));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <section
      aria-labelledby="gathered-heading"
      className="min-w-[min(420px,100%)] flex-1 basis-[420px] rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <h2 id="gathered-heading" className="font-display text-[32px] leading-tight">
        What was gathered
      </h2>
      <p className="mt-2 text-muted">
        Read it over. Remove anything that is not right. To change the transcript, go back.
      </p>

      <div className="mt-6">
        <h3 className="font-semibold">
          Summary <span className="font-normal text-muted">(read-only)</span>
        </h3>
        <p className="mt-2 break-words rounded-2xl border border-line bg-ink p-4 leading-relaxed">
          {summary?.trim() || "No summary yet."}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Tags</h3>
        {lists.tags.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {lists.tags.map((tag) => (
              <li key={tag}>
                <span className="inline-flex min-h-11 items-center rounded-full border border-line bg-chip pl-4 pr-1 text-sm">
                  {tag}
                  <RemoveButton
                    label={`Remove tag ${tag}`}
                    onClick={() => remove("tags", tag)}
                    disabled={removing !== null}
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">None mentioned</p>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <OfferingsColumn
          title="Foods"
          singular="food"
          list="foods"
          items={lists.foods}
          removing={removing}
          onRemove={remove}
        />
        <OfferingsColumn
          title="Songs"
          singular="song"
          list="songs"
          items={lists.songs}
          removing={removing}
          onRemove={remove}
        />
        <OfferingsColumn
          title="Places"
          singular="place"
          list="places"
          items={lists.places}
          removing={removing}
          onRemove={remove}
        />
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Exact words</h3>
        {lists.quotes.length > 0 ? (
          <div className="mt-3 space-y-3">
            {lists.quotes.map((quote) => (
              <figure key={quote} className="rounded-[18px] border border-line bg-ink p-5">
                <div className="flex items-start justify-between gap-2">
                  <blockquote className="min-w-0 break-words font-display text-[22px] italic leading-snug">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <RemoveButton
                    label={`Remove quote: ${quote}`}
                    onClick={() => remove("quotes", quote)}
                    disabled={removing !== null}
                  />
                </div>
                <figcaption className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-marigold" />
                   Matches the transcript after normalizing quotes and spacing
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">None found</p>
        )}
        <p className="mt-4 text-sm text-muted">
          A quote is only kept if it appears in the transcript after normalizing curly
          quotes and spacing. Check that the loved one, not the narrator, said it.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-[#E8684A] bg-[#2B1B16] px-4 py-3 text-[#FFB4A2]"
        >
          {error}
        </p>
      )}

      <Button asChild size="lg" className="mt-6 w-full rounded-2xl">
        <Link href={`/person/${personId}`}>Add to {personName}&apos;s ofrenda</Link>
      </Button>
      <Link
        href={`/memory/${memoryId}/edit`}
        className={`mt-4 inline-flex min-h-11 w-full items-center justify-center text-center font-semibold text-marigold underline underline-offset-4 ${focusRing}`}
      >
        Back to transcript
      </Link>
    </section>
  );
}
