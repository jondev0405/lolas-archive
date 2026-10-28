import { NextResponse, connection } from "next/server";

const TIMEOUT_MS = 2000;
const MODEL = process.env.OLLAMA_MODEL ?? "gemma3:4b-it-qat";

type OllamaTags = {
  models?: { name?: string; model?: string }[];
};

async function check(url: string): Promise<Response | null> {
  try {
    return await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return null;
  }
}

export async function GET() {
  await connection();

  const transcribeUrl = process.env.TRANSCRIBE_URL ?? "http://localhost:8000";
  const ollamaUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";

  const [whisperRes, ollamaRes] = await Promise.all([
    check(`${transcribeUrl}/health`),
    check(`${ollamaUrl}/api/tags`),
  ]);

  const whisper = Boolean(whisperRes?.ok);
  const ollama = Boolean(ollamaRes?.ok);

  let modelInstalled = false;
  if (ollamaRes?.ok) {
    try {
      const data = (await ollamaRes.json()) as OllamaTags;
      modelInstalled = (data.models ?? []).some(
        (entry) => entry.name === MODEL || entry.model === MODEL,
      );
    } catch {
      modelInstalled = false;
    }
  }

  return NextResponse.json(
    { whisper, ollama, model: MODEL, modelInstalled },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
