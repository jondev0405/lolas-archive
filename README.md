# Lola's Archive

**Keep the stories your family tells.**

Lola's Archive is a local-first family oral-history ofrenda for Undas and Día de los
Muertos. A family member uploads a voice note about someone they love. The app
transcribes it on the same computer, organizes the foods, songs, places, tags and exact
quotes that were mentioned, and turns them into an ofrenda page that can be searched,
printed and saved as an image. It is built for Filipino families and anyone keeping
memories across generations, with one rule at the center: the app organizes what people
said, and never writes in their voice.

## Demo

> Demo media is not committed in this checkout. Add the video link and the screenshots
> under `docs/` before submitting, then restore the embeds here.

- Demo video: not added yet.
- Animated walkthrough and screenshots: to be added in `docs/demo.gif` and
  `docs/screens/`.

Planned screenshots: Home (service status and remembered people), New memory (name,
optional photo and voice note), Review (transcript plus gathered items), and Ofrenda
(portrait or initials, offerings, quotes and audio).

## The exact-quote guarantee

The app is designed so the model cannot add a quote that does not appear in the
transcript.

1. **The model returns a constrained shape.** Ollama is asked for JSON that matches a
   fixed schema containing only a summary, tags, foods, songs, places and quotes. The
   request uses temperature `0` and the schema is passed as Ollama's `format`.
2. **The server checks the result against the transcript.** Foods, songs and places are
   kept only when they match a whole word or phrase in the transcript, compared
   case-insensitively after normalizing curly quotes and whitespace. Quotes have
   surrounding quote marks removed and are kept only when the normalized text appears as
   a whole phrase in the transcript. Empty values, fragments inside longer words and
   duplicates are dropped. The check runs in `lib/extract.ts` (`guard()`).
3. **You review everything before treating the page as finished.** The transcript is
   editable. The review screen shows the gathered summary, tags, offerings and quotes. You
   can remove tags, foods, songs, places and quotes, and each removal is saved. The
   summary is read-only. The ofrenda reads the same saved data, so remove anything you do
   not want before sharing it.

The guard checks the transcript, not the audio and not who spoke the sentence. A sentence
the narrator said can still be selected as a quote, and a transcript can contain words
the recording did not. Correct the transcript before extraction and remove any quote that
is not the loved one's own words. The summary is an organizing aid, not a quote; it is not
checked word for word and you should read it before sharing.

## Features

- Upload a voice note (M4A, MP3, WAV, WebM, OGG, AAC or FLAC).
- Transcribe locally with faster-whisper through a FastAPI service.
- Edit the transcript before extracting anything.
- Extract a summary, tags, foods, songs, places and exact quotes with a local Ollama
  model.
- Review the results and remove individual tags, offerings or quotes.
- Create a person with a name, relationship and optional portrait.
- Change or remove the portrait later from the ofrenda page.
- Show a portrait, or fall back to the person's initials when there is no photo.
- Read an ofrenda with offerings, memory cards, quoted words and audio playback.
- Search people by name.
- Search memories by text and filter memories by tag.
- Print an ofrenda or save it as a PNG with `html-to-image`.
- Check whether the local transcription service and Ollama are ready from the Home page.
- Keep audio, photos, transcripts and the SQLite database on the local machine.

## Architecture

```text
Browser
  |  upload voice note / photo, edit transcript, review, search
  v
Next.js App Router  (localhost:3000)
  |-- /api/transcribe ------> FastAPI + faster-whisper  (localhost:8000) -> transcript
  |-- /api/extract ---------> Ollama                    (localhost:11434) -> constrained JSON
  |-- Prisma ---------------> dev.db (SQLite)
  |-- /api/audio, /api/photo -> uploads/ (local files)
  |-- /api/health ----------> checks both local services
```

Everything that contains a family's words or voice stays on the computer running the
app. There are no accounts, cloud storage, analytics, sync or external AI APIs. At
runtime, the only services the app calls are the local Python transcription service and
the local Ollama server.

## Tech stack

| Layer | Technology |
| --- | --- |
| Web app | Next.js 16 (App Router), React 19, TypeScript |
| Styling and UI | Tailwind CSS v4, shadcn/ui base, Radix UI, Lucide icons |
| Data | Prisma 7, SQLite via the `better-sqlite3` adapter |
| Transcription | FastAPI, faster-whisper, PyAV (pinned to `14.4.0`) |
| Extraction | Ollama with `gemma3:4b-it-qat` by default |
| Validation | Zod |
| Export | `html-to-image` |
| Dev orchestration | `concurrently` |

## Setup on Windows (PowerShell)

### Prerequisites

- Node.js 20.9 or newer
- Python 3.11 or newer
- [Ollama](https://ollama.com) installed
- Git

### 1. Clone the repository

```powershell
git clone <your-repo-url>
cd lolas-archive
```

### 2. Install JavaScript dependencies

```powershell
npm install
```

### 3. Create the environment file

```powershell
Copy-Item .env.example .env
```

### 4. Create the SQLite database and sample data

```powershell
npx prisma migrate dev
npm run db:seed
```

The seed adds one sample person, Lolo Ben, if no person called Lolo Ben already exists,
so the Home page has something to show without deleting anyone. `npm run db:reset` wipes
and recreates only the local SQLite development database, then reseeds it. It does not
touch uploaded files or the Python service.

### 5. Install the local transcription service

```powershell
python -m venv python/.venv
python/.venv/Scripts/python -m pip install -r python/requirements.txt
```

### 6. Pull the local model

```powershell
ollama pull gemma3:4b-it-qat
```

Ollama runs separately in the background. Keep it open while using the app.

### 7. Start the app

```powershell
npm run dev:all
```

This starts Next.js at http://localhost:3000 and the FastAPI service at
http://localhost:8000. The Home page status strip shows whether both local services are
ready.

To run the pieces separately:

```powershell
npm run dev
python/.venv/Scripts/python -m uvicorn main:app --app-dir python --port 8000
```

## Try it

1. Open http://localhost:3000 and check that "Transcription" and "Local model" both say
   "ready".
2. Choose "Preserve a memory".
3. Select "Someone new..." and enter a name (and an optional photo).
4. Drop in `samples/sample-memory.wav`. It is a short synthetic test recording, not a real
   family memory, so the flow can be tried without using private audio.
5. Read and correct the transcript, then choose "Gather memories and light the ofrenda".
6. On the review screen, remove anything the model gathered incorrectly, then open the
   person's ofrenda. The gathered data is already saved, so the review is about removing
   what should not be shown.
7. Try searching, filtering by tag, playing the recording, printing and saving the
   ofrenda as an image.

## Configuration

| Variable | Required | Default | Read by | Notes |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `file:./dev.db` in `lib/db.ts` | Prisma, seed | SQLite database used by the app. |
| `OLLAMA_URL` | Yes | `http://localhost:11434` in `.env.example` | `lib/extract.ts`, health check | Local Ollama server. |
| `OLLAMA_MODEL` | Yes | `gemma3:4b-it-qat` in `.env.example` | `lib/extract.ts`, health check | Model used to extract offerings and quotes. Pull this exact tag in Ollama. Other Ollama chat models with structured JSON output can be used; see Extraction quality below. |
| `TRANSCRIBE_URL` | Yes | `http://localhost:8000` in `.env.example` | `/api/transcribe`, health check | Local FastAPI + faster-whisper service. |
| `WHISPER_LANGUAGE` | No | Unset (auto-detect) | `/api/transcribe` | Optional language code such as `en` or `tl`, passed to Whisper as a query parameter. |
| `WHISPER_MODEL` | No | `base` | `python/main.py` | Optional faster-whisper model size. Set it in the PowerShell session before starting the Python service; uvicorn does not load `.env` for Python. |

## Troubleshooting

- **Ollama says "address already in use".** Ollama is already running. Use the running
  instance instead of starting another one.
- **`TypeError` mentioning `metadata_errors` or PyAV.** `python/requirements.txt` pins
  `av==14.4.0` because newer PyAV releases changed `av.open()` in a way that breaks
  faster-whisper. Reinstall the Python dependencies into the venv.
- **Cache Components errors while editing pages.** `next.config.ts` enables
  `cacheComponents`. Pages that read Prisma or route parameters follow the existing
  pattern: a synchronous default export with `<Suspense>`, and an async inner component
  that starts with `await connection()` before awaiting params. Do not export `dynamic`,
  `runtime`, `revalidate` or `fetchCache` from pages or routes.
- **A `502` from `/api/transcribe`.** The Next.js route reached the Python service but the
  service returned an error. Check the terminal running uvicorn for the underlying
  message.
- **The first extraction is slow.** Ollama loads the model on the first request. Starting
  the Python service also has to load Whisper. Later requests are faster while the model
  stays warm.

## Limitations

### Transcription accuracy

Speech recognition makes mistakes, especially with accents, background noise, quiet or
distant recordings, overlapping speakers, names, place names and song titles. The app
uses faster-whisper's `base` model by default, which favors speed and a small download
over accuracy. It is weaker on less widely supported languages, regional dialects and
code-switching (mixing languages mid-sentence). By default `WHISPER_LANGUAGE` is unset,
so Whisper auto-detects the language; setting it can help when the language is known.

### Extraction quality

A small local language model can miss details, over-summarize, or phrase a summary
differently than the speaker would. It can also skip a real quote it should have kept.
The quote guard prevents invented quotes, but it cannot make the model find every
meaningful one. The summary is not checked against the transcript word for word.

The app is not locked to the 4B default. If the computer has enough memory, you can pull a
larger Ollama model and set `OLLAMA_MODEL` to its tag, for example:

```powershell
ollama pull gemma3:12b
# then set OLLAMA_MODEL="gemma3:12b" in .env
```

A larger model may recall more details and phrase the summary better, but it will use more
memory and may be slower. The project has only been tested with the default
`gemma3:4b-it-qat`; other models should support Ollama's structured JSON output.

### Human review is part of the design

Transcripts and gathered results are editable and reviewable on purpose. Nothing should
be treated as a faithful record until a person has read it. Correcting a transcript
before extraction gives the model better material to work with.

### Scope

One speaker per recording works best. There is no speaker identification. The app stores
audio and text locally with no sync or backup between devices. It is built for
single-user use on one computer, without accounts or permissions.

### Performance

Transcription and extraction speed depends on the computer's CPU and memory. The first
extraction after starting Ollama is slower while the model loads, and long recordings
take longer to transcribe. Audio is processed on the CPU with int8 quantization.

### Privacy limits

Data stays on the device, but anyone with access to that computer or its project folder
can read it. The user is responsible for backing up and protecting their own files.
Uploaded audio, photos and the SQLite database are not encrypted.

### Respect and consent

The app organizes what people said; it does not verify it. Get consent from living
speakers, and be thoughtful about private or sensitive family stories before sharing or
printing an ofrenda.

There is no committed roadmap yet; in-browser recording and an optional larger
transcription model are the obvious next candidates.

## Prize category

Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine.

The project treats the voice that survives in a recording as the thing worth keeping: the
foods, songs, places and turns of phrase a person left behind. It organizes those details
with local models, holds every quote to the transcript, and hands the decision about what
to keep back to the family.

## Project structure

```text
app/                  Next.js pages, client forms and API routes
components/           Shared UI (candles, garland, nav, status strip)
lib/                  Prisma client, extraction guard, photo storage, errors
prisma/               Schema, migrations and seed data
python/               FastAPI + faster-whisper service
samples/              Synthetic sample recording for testing
scripts/              Local extraction test script
uploads/              Uploaded audio and photos (gitignored, created at runtime)
docs/                 Demo media (add the GIF and screenshots before submitting)
dev.db                Local SQLite database (gitignored)
```

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgements

Built with [faster-whisper](https://github.com/SYSTRAN/faster-whisper),
[FastAPI](https://fastapi.tiangolo.com), [Ollama](https://ollama.com), and the
[Gemma 3](https://ollama.com/library/gemma3) model. The web app uses
[Next.js](https://nextjs.org), [React](https://react.dev),
[Prisma](https://www.prisma.io), [Tailwind CSS](https://tailwindcss.com),
[Radix UI](https://www.radix-ui.com), and [Lucide](https://lucide.dev). PNG export is
handled by [html-to-image](https://github.com/bubkoo/html-to-image).