"use client";

import Link from "next/link";
import { Button } from "@/components/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-marigold">
        Something went wrong
      </p>
      <h1 className="mt-4 font-display text-[clamp(36px,6vw,56px)] leading-tight">
        The ofrenda could not be lit.
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
        A local service may be offline, or this page could not be loaded. Your saved memories
        are still on this device.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" size="lg" className="rounded-full" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="ghost" size="lg" className="rounded-full">
          <Link href="/">Back to all people</Link>
        </Button>
      </div>
    </main>
  );
}
