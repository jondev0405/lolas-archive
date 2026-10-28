import { z } from "zod";

export const ExtractionSchema = z.object({
  summary: z.string(),
  tags: z.array(z.string()),
  foods: z.array(z.string()),
  songs: z.array(z.string()),
  places: z.array(z.string()),
  quotes: z.array(z.string()),
});
export type Extraction = z.infer<typeof ExtractionSchema>;

const list = { type: "array", items: { type: "string" } };
const jsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    tags: list, foods: list, songs: list, places: list, quotes: list,
  },
  required: ["summary", "tags", "foods", "songs", "places", "quotes"],
};

const SYSTEM = `You organize a family member's spoken memory of a loved one.
Use ONLY what is stated in the transcript. Never invent or guess anything.
- summary: one or two plain sentences, third person, facts from the transcript only.
- tags: 2 to 5 short lowercase topics (e.g. "christmas", "cooking").
- foods, songs, places: names exactly as spoken. Empty array if none.
- quotes: words the loved one said, copied EXACTLY, character for character, from the transcript. Only include words the transcript attributes to them. Empty array if none.
Return JSON only.`;

async function callOllama(transcript: string, personLabel?: string): Promise<string> {
  const res = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      stream: false,
      format: jsonSchema, // constrains output to the schema
      keep_alive: "10m",
      options: { temperature: 0 },
      // If you switch to a Qwen3 thinking model, also add: think: false
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: personLabel
            ? `Loved one: ${personLabel}\nUse this only to name them. Do not add facts that are not in the transcript.\n\nTranscript:\n"""\n${transcript}\n"""`
            : `Transcript:\n"""\n${transcript}\n"""`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
  const data = await res.json();
  return data.message.content as string;
}

// The "never invents a voice" guarantee lives here.
const norm = (s: string) =>
  s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
   .replace(/\s+/g, " ").trim();

function guard(x: Extraction, transcript: string): Extraction {
  const t = norm(transcript);
  const tl = t.toLowerCase();
  const stripQuotes = (q: string) => norm(q).replace(/^["']+|["']+$/g, "").trim();
  const appears = (s: string) => tl.includes(norm(s).toLowerCase());
  return {
    summary: x.summary.trim(),
    tags: [...new Set(x.tags.map((s) => s.toLowerCase().trim()).filter(Boolean))].slice(0, 6),
    foods: x.foods.filter(appears),
    songs: x.songs.filter(appears),
    places: x.places.filter(appears),
    quotes: [...new Set(x.quotes.map(stripQuotes))].filter((q) => q.length > 3 && t.includes(q)),
  };
}

export async function extractMemories(
  transcript: string,
  personLabel?: string,
): Promise<Extraction> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callOllama(transcript, personLabel);
      return guard(ExtractionSchema.parse(JSON.parse(raw)), transcript);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}