*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

## What I Built

Lola's Archive is a local-first family oral-history ofrenda for Undas and Día de los Muertos. A family member uploads a voice note about someone they love. The app transcribes it on the same computer, gathers the foods, songs, places, tags and exact quotes mentioned, and turns them into an ofrenda page that can be searched, printed and saved as an image.

I read "Ghost in the Machine" as the voice that survives in a recording: the small details a person leaves behind in how they talk. The app organizes those details without putting words in someone's mouth. It lays out what they actually said and lets the family decide what to keep.

No accounts, cloud storage, analytics or external AI APIs: the audio, transcripts, photos and database stay on the computer running it.

## Demo

- Demo video: [TODO: add demo video link]
- Animated walkthrough: `docs/demo.gif`
- Screenshots: to be added under `docs/screens/` before submission

## Code

GitHub: [\[Lola's Archive Repo Link\]](https://github.com/Fidel-Jr/lolas-archive)

The app is Next.js with a FastAPI transcription service in `python/`, Prisma and SQLite for local data, and a local Ollama model for extraction.

## How I Built It

1. **Transcription.** The browser uploads a voice note to `/api/transcribe`, which saves a copy in `uploads/` and forwards the audio to a FastAPI service running faster-whisper at `localhost:8000`. I used the `base` model because it is fast, small enough for a CPU, and good enough for a first pass a person will edit anyway. The transcript is shown for correction before extraction.
2. **Extraction.** The edited transcript goes to Ollama at `localhost:11434` using the model set in `.env`, `gemma3:4b-it-qat` by default. The request asks for a fixed JSON shape: summary, tags, foods, songs, places and quotes. Temperature is `0`, and the schema is passed as Ollama's `format` to leave less room for drift.
3. **The exact-quote guarantee.** A model can produce a sentence that sounds right and attribute it to someone who never said it. For a family archive, that is the failure I could not accept. The server checks the output against the transcript in `guard()`. Foods, songs and places must match a whole word or phrase in the transcript, compared case-insensitively after normalizing curly quotes and whitespace. Quotes have surrounding quote marks removed and must match a whole phrase in the normalized transcript. Empty values, fragments inside longer words and duplicates are dropped.
4. **Review.** The transcript is editable. The review screen shows every gathered item, and each tag, offering or quote can be removed and saved. The summary is read-only. The ofrenda reads the same saved data, so anything unwanted should be removed before sharing.
5. **The ofrenda.** It shows a portrait or initials, offerings, exact words and the original recording. You can search, filter by tag, print, or save the page as a PNG.

The summary is an organizing aid, not a quote. The guard protects the transcript from invented strings; it does not check the audio, and it cannot tell whether a sentence was spoken by the loved one or by the narrator. That is why review is part of the design.

Three things were hard:

- **JSON reliability on a small model.** Even with a schema passed as `format` and temperature `0`, a 4B model can put a field in the wrong place, add an empty string, or paraphrase something it should have copied. The guard makes that tolerable: I stopped treating the model as authoritative and started treating it as a suggestion that gets checked.
- **A PyAV version mismatch.** A PyAV version mismatch broke faster-whisper’s audio decoding. faster-whisper 1.2.1 and earlier pass `metadata_errors="ignore"` to `av.open()`, but PyAV 19.0.0 removed that argument, causing a TypeError when decoding audio files or bytes. I pinned `av>=11,<19` (resolving to av==18.1.0) and added a temporary compatibility shim in `python/main.py` to strip metadata_errors when PyAV 19+ is installed. The shim can be removed once faster-whisper releases its upstream PyAV 19 compatibility fix.
- **Windows setup.** The pieces work separately but are fiddly together: a Python venv with Windows script paths, uvicorn pointed at `--app-dir python`, Ollama running separately, and Prisma migrations. `npm run dev:all` covers startup, but the first run still needs the venv, the model pull and a working `.env`.

## Why Does Open Innovation Matter?

This app only works because the models run on the user's own machine. A family recording may contain a name, a place, an illness, a grief, or a story never meant to leave the room. Sending that audio to a hosted API would ask a family to trust a company's retention policy with something deeply personal. For many, that is not a trade they want to make.

Open-weight models and local inference change the question. The data stays where it was recorded, and the user can choose another model or run a larger one. Open models made a private, consent-aware tool possible where a closed API would have made it a request for trust.

## The Spirit of It

It brought a memory back.

The sample recording is almost nothing: a lola making pandesal before the sun came up, a kettle, a song hummed while she waited. The model did its job and returned a tidy summary. But the summary is not what made me stop. The line **"Food is how we say I love you."** came through untouched, in her own words, with the app confirming it had been found word for word in the recording.

For a second the page was not a demo. It was a Sunday morning in a kitchen I could almost smell. That is the moment the project landed for me: not when the machine sounded smart, but when it got out of the way and let a real sentence do the work.

That is the ghost in the machine I wanted to build around. Not a generated imitation of someone, but the trace of how they actually said it. If the model had rewritten that line into something cleaner, the memory would have been gone. Keeping it exact is the whole point.

Try the synthetic sample in `samples/` first, then use a recording you have permission to keep.

## Prize Categories

- Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine
- Best Use of Gemma — Gemma 3 (`gemma3:4b-it-qat`) runs locally with Ollama, extracting summaries, tags, foods, songs, places, and quotes from family transcripts.

<!-- Thanks for participating! -->
