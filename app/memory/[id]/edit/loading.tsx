import { LoadingCandle } from "@/components/loading-candle";

export default function EditMemoryLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <LoadingCandle
        title="Opening the transcript…"
        detail="Loading the voice note and the words kept from it."
      />
    </main>
  );
}
