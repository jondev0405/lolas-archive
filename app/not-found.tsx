import Link from "next/link";
import { Button } from "@/components/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-marigold">
        Not found
      </p>
      <h1 className="mt-4 font-display text-[clamp(36px,6vw,56px)] leading-tight">
        This ofrenda could not be found.
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
        The page may have moved, or the memory may never have been saved. Everything already
        kept is still on this device.
      </p>
      <Button asChild size="lg" className="mt-8 rounded-full">
        <Link href="/">Back to all people</Link>
      </Button>
    </main>
  );
}
