export function LoadingCandle({ title, detail }: { title: string; detail: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center rounded-3xl border border-line bg-surface px-8 py-16 text-center"
    >
      <div
        className="flex h-16 w-16 items-end justify-center rounded-full bg-[#2B1B16] pb-3"
        style={{ boxShadow: "0 0 0 2px #F4A62A, 0 0 36px rgba(244,166,42,0.55)" }}
      >
        <div
          className="flame h-8 w-4"
          style={{
            borderRadius: "50% 50% 50% 50% / 65% 65% 35% 35%",
            background: "linear-gradient(#FFF3C4, #F4A62A 70%, #E8684A)",
          }}
        />
      </div>
      <h2 className="mt-6 font-display text-3xl">{title}</h2>
      <p className="mt-2 text-muted">{detail}</p>
    </div>
  );
}

export default LoadingCandle;
