"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { readableError } from "@/lib/errors";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
const MAX_PHOTO_MB = 10;

export default function PhotoUploadButton({
  personId,
  hasPhoto,
}: {
  personId: string;
  hasPhoto: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !IMAGE_EXT.test(file.name)) {
      setError("Please choose an image (JPG, PNG, WebP, GIF or AVIF).");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`That photo is over ${MAX_PHOTO_MB} MB. Please choose a smaller one.`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("personId", personId);
      fd.append("photo", file);
      const res = await fetch("/api/photo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" && data.error ? data.error : "Couldn't save that photo.",
        );
      }
      router.refresh();
    } catch (err) {
      setError(readableError(err, "Couldn't save that photo. Please try again."));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/photo/${personId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Couldn't remove that photo.");
      router.refresh();
    } catch (err) {
      setError(readableError(err, "Couldn't remove that photo. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-busy={busy}
        >
          <ImagePlus aria-hidden="true" className="h-[18px] w-[18px]" />
          {busy ? "Saving…" : hasPhoto ? "Change photo" : "Add photo"}
        </Button>
        {hasPhoto && (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={remove}
            disabled={busy}
          >
            <Trash2 aria-hidden="true" className="h-[18px] w-[18px]" />
            Remove photo
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.avif"
        aria-label="Choose a photo"
        tabIndex={-1}
        className="sr-only"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="max-w-xs text-center text-sm text-[#FFB4A2]">
          {error}
        </p>
      )}
    </div>
  );
}
