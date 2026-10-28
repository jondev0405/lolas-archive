import { LoadingCandle } from "@/components/loading-candle";

export default function PersonLoading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,48px)] py-14">
      <LoadingCandle
        title="Lighting the ofrenda…"
        detail="Gathering the offerings and memories kept on this device."
      />
    </main>
  );
}
