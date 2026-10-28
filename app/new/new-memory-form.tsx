"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCandle } from "@/components/loading-candle";

type Person = { id: string; name: string };

const AUDIO_EXT = /\.(m4a|mp3|wav|webm|ogg|aac|flac)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
const MAX_MB = 30;
const MAX_PHOTO_MB = 10;

export default function NewMemoryForm({ people }: { people: Person[] }) {
  const router = useRouter();
  const [personId, setPersonId] = useState(people[0]?.id ?? "__new");
  const [newName, setNewName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = personId === "__new";
  const canSubmit = !!file && !busy && (!isNew || newName.trim().length > 0);

  function pick(f: File | undefined | null) {
    if (!f) return;
    if (!f.type.startsWith("audio/") && !AUDIO_EXT.test(f.name)) {
      setError("Please choose an audio file (MP3, M4A, WAV or WebM).");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`That file is over ${MAX_MB} MB. A minute or two of audio is plenty.`);
      return;
    }
    setError(null);
    setFile(f);
  }

  function pickPhoto(f: File | undefined | null) {
    if (!f) return;
    if (!f.type.startsWith("image/") && !IMAGE_EXT.test(f.name)) {
      setError("Please choose an image (JPG, PNG, WebP, GIF or AVIF).");
      return;
    }
    if (f.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`That photo is over ${MAX_PHOTO_MB} MB. Please choose a smaller one.`);
      return;
    }
    setError(null);
    setPhoto(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    if (isNew) {
      fd.append("newName", newName.trim());
      fd.append("relationship", relationship.trim());
      if (photo) fd.append("photo", photo);
    } else {
      fd.append("personId", personId);
    }

    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push(`/memory/${data.memoryId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (busy) {
    return (
      <LoadingCandle
        title="Listening to the story…"
        detail="Turning your voice note into text, here on this device."
      />
    );
  }

  const field =
    "w-full min-h-12 rounded-xl border border-[#6B4A36] bg-ink px-4 text-lg text-cream outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

  return (
    <form onSubmit={onSubmit} className="space-y-8 rounded-3xl border border-line bg-surface p-8">
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-marigold">
          Step 1 · Who are you remembering?
        </h2>
        <div>
          <label htmlFor="person" className="sr-only">
            Who are you remembering?
          </label>
          <select
            id="person"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className={field}
          >
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="__new">Someone new…</option>
          </select>
        </div>

        {isNew && (
          <div className="flex flex-wrap gap-4">
            <div className="min-w-48 flex-1">
              <label htmlFor="newName" className="mb-2 block font-medium">Name</label>
              <input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={field}
              />
            </div>
            <div className="min-w-48 flex-1">
              <label htmlFor="relationship" className="mb-2 block font-medium">Relationship</label>
              <input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Grandfather"
                className={field}
              />
            </div>
          </div>
        )}

        {isNew && (
          <div>
            <label htmlFor="photo" className="mb-2 block font-medium">
              Photo <span className="font-normal text-muted">(optional)</span>
            </label>
            <label
              htmlFor="photo"
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-[#6B4A36] px-4 py-3 text-muted focus-within:ring-2 focus-within:ring-marigold"
            >
              <span className="min-w-0 truncate">
                {photo ? photo.name : "Choose a photo for the ofrenda"}
              </span>
              <span className="shrink-0 text-sm font-semibold text-marigold">
                {photo ? "Change" : "Browse"}
              </span>
              <input
                id="photo"
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.avif"
                className="sr-only"
                onChange={(e) => pickPhoto(e.target.files?.[0])}
              />
            </label>
            <p className="mt-2 text-sm text-muted">
              Without a photo, the ofrenda shows their initials.
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-marigold">
          Step 2 · Add the voice note
        </h2>
        <label
          htmlFor="audio"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center focus-within:ring-2 focus-within:ring-marigold ${
            dragging ? "border-marigold bg-[#2B1B16]" : "border-[#6B4A36]"
          }`}
        >
          <input
            id="audio"
            type="file"
            accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {file ? (
            <>
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-muted">
                {(file.size / 1024 / 1024).toFixed(1)} MB · click to choose a different file
              </span>
            </>
          ) : (
            <>
              <span className="font-medium">Drop an audio file here, or click to choose one</span>
              <span className="text-sm text-muted">MP3, M4A, WAV or WebM. A minute or two is plenty.</span>
            </>
          )}
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-[#E8684A] bg-[#2B1B16] px-4 py-3 text-[#FFB4A2]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="min-h-14 w-full rounded-2xl bg-marigold text-lg font-semibold text-ink outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        Transcribe and gather memories
      </button>
    </form>
  );
}