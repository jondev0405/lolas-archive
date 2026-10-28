"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/button";

function slugify(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "ofrenda"
  );
}

export default function SaveImageButton({
  personName,
  targetId,
}: {
  personName: string;
  targetId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveImage() {
    const node = document.getElementById(targetId);
    if (!node) {
      setError("Couldn't find the ofrenda to save.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await document.fonts.ready;

      const dataUrl = await toPng(node, {
        backgroundColor: "#150D0B",
        pixelRatio: 2,
        cacheBust: true,
        filter: (domNode) => (domNode as HTMLElement).dataset?.exportHide !== "true",
      });

      const link = document.createElement("a");
      link.download = `${slugify(personName)}-ofrenda.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Couldn't save the image. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        className="rounded-full"
        onClick={saveImage}
        disabled={busy}
        aria-busy={busy}
      >
        <ImageDown aria-hidden="true" className="h-[18px] w-[18px]" />
        {busy ? "Saving image…" : "Save as image"}
      </Button>
      {error && (
        <p role="alert" className="max-w-xs text-center text-sm text-[#FFB4A2]">
          {error}
        </p>
      )}
    </div>
  );
}
