"use client";

import { useEffect, useState } from "react";

type Health = {
  whisper: boolean;
  ollama: boolean;
  model: string;
  modelInstalled: boolean;
};

function isHealth(value: unknown): value is Health {
  if (!value || typeof value !== "object") return false;
  const health = value as Record<string, unknown>;
  return (
    typeof health.whisper === "boolean" &&
    typeof health.ollama === "boolean" &&
    typeof health.model === "string" &&
    typeof health.modelInstalled === "boolean"
  );
}

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full ${ok ? "bg-marigold" : "bg-[#E8684A]"}`}
    />
  );
}

function StatusItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Dot ok={ok} />
      {label} {ok ? "ready" : "not running"}
    </span>
  );
}

export default function ServiceStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/health", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      })
      .then((data: unknown) => {
        if (!isHealth(data)) throw new Error("Unexpected health response");
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const modelReady = Boolean(health?.ollama && health?.modelInstalled);
  const needsModelHint = health !== null && (!health.ollama || !health.modelInstalled);

  return (
    <section
      aria-label="Local service status"
      aria-live="polite"
      className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted"
    >
      {failed ? (
        <span>
          Couldn&apos;t check local services. Reload the page to try again.
        </span>
      ) : health === null ? (
        <span>Checking local services…</span>
      ) : (
        <>
          <StatusItem ok={health.whisper} label="Transcription" />
          <StatusItem ok={modelReady} label="Local model" />
          {!health.whisper && (
            <span className="text-muted-dim">Start the Python service.</span>
          )}
          {needsModelHint && (
            <span className="text-muted-dim">
              Open Ollama and run:{" "}
              <code className="rounded bg-ink px-1.5 py-0.5 text-cream">
                ollama pull {health.model}
              </code>
            </span>
          )}
        </>
      )}
    </section>
  );
}
