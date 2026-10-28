"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCandle } from "@/components/loading-candle";
import { readableError } from "@/lib/errors";

type Stage = "idle" | "gathering" | "lighting";

const STAGE_COPY: Record<Exclude<Stage, "idle">, { title: string; detail: string }> = {
  gathering: {
    title: "Gathering memories…",
    detail: "Finding the foods, songs, places and exact words people said.",
  },
  lighting: {
    title: "Lighting the ofrenda…",
    detail: "Arranging the offerings and setting the candles.",
  },
};

export default function EditMemoryForm({
  memoryId,
  personName,
  initialTranscript,
  hasAudio,
}: {
  memoryId: string;
  personName: string;
  initialTranscript: string;
  hasAudio: boolean;
}) {
  const router = useRouter();
  const [transcript, setTranscript] = useState(initialTranscript);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  async function gather() {
    setError(null);
    setStage("gathering");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId, transcript }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" && data.error
            ? data.error
            : "The gathering step did not respond. Please try again.",
        );
      }
      setStage("lighting");
      router.push(`/memory/${memoryId}/review`);
    } catch (err) {
      setError(readableError(err, "Something went wrong while gathering memories. Please try again."));
      setStage("idle");
    }
  }

  if (stage !== "idle") {
    const copy = STAGE_COPY[stage];
    return <LoadingCandle title={copy.title} detail={copy.detail} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted">{personName} · New memory</p>
        <h1 className="mt-2 font-display text-5xl">Check what was said</h1>
        <p className="mt-3 text-lg text-muted">
          Fix any words the transcription got wrong. Only the text below is used to gather memories.
        </p>
      </header>

      {hasAudio && (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <audio
            controls
            aria-label={`Original recording for ${personName}`}
            src={`/api/audio/${memoryId}`}
            className="w-full"
            style={{ accentColor: "#F4A62A" }}
          />
        </div>
      )}

      <div className="rounded-3xl border border-line bg-surface p-8">
        <label htmlFor="transcript" className="mb-3 block font-semibold">
          Transcript
        </label>
        <textarea
          id="transcript"
          rows={10}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full resize-y rounded-2xl border border-[#6B4A36] bg-ink p-4 font-display text-[21px] leading-[1.6] text-cream outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        />
        <p className="mt-3 text-sm text-muted">
          Edited words are kept. The audio is not changed.
        </p>
        {transcript.trim().length === 0 && (
          <p className="mt-3 text-sm text-muted">
            The transcript is empty. If the recording was quiet, try a clearer one.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-[#E8684A] bg-[#2B1B16] px-4 py-3 text-[#FFB4A2]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={gather}
        disabled={transcript.trim().length === 0}
        className="min-h-14 w-full rounded-2xl bg-marigold text-lg font-semibold text-ink outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        Gather memories and light the ofrenda
      </button>
    </div>
  );
}