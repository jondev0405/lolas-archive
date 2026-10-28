import Link from "next/link";
import { Button } from "@/components/button";

function FlameIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-marigold"
      fill="currentColor"
    >
      <path d="M12 2c.6 3.4-1 5.1-2.4 6.8C8.2 10.6 7 12.1 7 14.2a5 5 0 0 0 10 0c0-1.7-.7-3.1-1.6-4.4 0 1.4-.8 2.3-1.7 2.3-1 0-1.7-.8-1.7-2 0-2.3 1-3.6 1-5.1 0-1.1-.4-2.1-1-3Z" />
    </svg>
  );
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background print:hidden">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4"
      >
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-sm text-cream outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <FlameIcon />
          <span className="font-display text-2xl font-semibold">Lola&apos;s Archive</span>
        </Link>

        <Button asChild className="rounded-full">
          <Link href="/new">Preserve a memory</Link>
        </Button>
      </nav>
    </header>
  );
}

export default SiteNav;
