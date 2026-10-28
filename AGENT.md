**Project:** Lola's Archive, a local-first family oral-history "ofrenda" for Día de los Muertos and Undas.
 
**Flow:** the user uploads a voice note about a loved one, which is transcribed locally (faster-whisper behind a FastAPI service in `python/`). The user edits the transcript. A local Ollama model extracts a summary, tags, foods, songs, places and exact quotes. These are saved to SQLite via Prisma and shown as a respectful ofrenda page.
 
**Principles (never violate):**
1. The AI organizes real words. It never invents a person's voice. Every extracted quote must be a literal substring of the transcript. Foods, songs and places must also appear in the transcript. This guard lives in `lib/extract.ts` (`guard()`). Never weaken it.
2. Local only. No cloud APIs, analytics or runtime network calls, except fonts loaded through `next/font`.
3. Tone is warm, plain and respectful. No jokes, no emoji in the UI, and no gendered pronouns in UI copy (use "their").
**Stack:** Next.js (App Router, TypeScript), Tailwind v4 with theme tokens in `app/globals.css`, Prisma + SQLite, Python FastAPI + faster-whisper (`python/main.py`), Ollama (`gemma3:4b-it-qat` by default, set by `OLLAMA_MODEL`).
 
**Data model (prisma/schema.prisma):**
- `Person(id, name, relationship?, createdAt, memories[])`
- `Memory(id, personId, transcript, summary?, tags, quotes, foods, songs, places, audioPath?, createdAt)`
- List fields are JSON strings. Always read them with `parseList` from `lib/json.ts` and write them with `JSON.stringify`.
**Env vars (.env):** `DATABASE_URL`, `OLLAMA_URL`, `OLLAMA_MODEL`, `TRANSCRIBE_URL`, `WHISPER_LANGUAGE` (optional).
 
**Existing files (read them before changing anything):**
- `lib/db.ts` (Prisma singleton), `lib/json.ts` (`parseList`), `lib/extract.ts` (Ollama extraction + guard)
- `app/api/transcribe/route.ts`, `app/api/extract/route.ts`, `app/api/audio/[id]/route.ts`
- `app/new/` (upload page + client form), `app/memory/[id]/edit/` (transcript editor + client form)
- `python/main.py`, `python/requirements.txt`, `prisma/seed.ts`, `scripts/test-extract.ts`
**Hard rules for code changes:**
- Cache Components may be enabled in `next.config`. Never export `dynamic`, `runtime`, `revalidate` or `fetchCache` from pages or routes. `maxDuration` is fine. For any page that reads Prisma or `params`: the default export is a sync component that renders `<Suspense>` around an async inner component whose first line is `await connection()` (from `next/server`), followed by `await params`.
- Check `tsconfig.json` for the `@/*` alias and match the import style of neighboring files (some files use relative imports).
- Do not add dependencies without telling me why. Allowed if needed: `concurrently`, `html-to-image`.
- Do not install Docker, Postgres, extra Ollama models or extra Whisper models.
- I use Windows + PowerShell. Give PowerShell-compatible commands only.
- Do not run `git commit` or `git push`. Do not edit already-applied Prisma migrations. Do not delete my data.
- After each task: run `npx tsc --noEmit` and `npm run lint`, fix errors, then summarize in 5 lines or fewer what changed and exactly how I should test it.
- Prefer small, readable components. No clever abstractions.
**Design tokens Make sure to use Shadcn UI (already or to be added in `app/globals.css` `@theme`):**
- ink `#150D0B` (page bg), surface `#211512` (cards), surface2 `#2B1B16`, line `#4A3226` (card borders), line-strong `#6B4A36` (inputs, dashed borders), chip `#3A2720`
- cream `#F7EBDD` (text), muted `#CDB9A5`, muted-dim `#B9A593`, marigold `#F4A62A` (accent), error border `#E8684A`, error text `#FFB4A2`
- papel picado colors: `#E0457B`, `#F4A62A`, `#2FB5A8`, `#8E5BD6`, `#F7EBDD`
- Fonts: Fraunces (display, via `--font-fraunces`) and DM Sans (body, via `--font-dm-sans`)
- Shapes: cards `rounded-[20px]` or `rounded-3xl` with a 1px `line` border on all sides. CTAs and nav buttons are full pills. Form buttons are about `rounded-2xl`. Every interactive target is at least 44px tall.
- Flame animation class `.flame` (flicker keyframes, disabled under `prefers-reduced-motion`).
- Contrast: body text is cream or muted on ink or surface. Dark text (`#1A0F0A`) on marigold buttons.
---