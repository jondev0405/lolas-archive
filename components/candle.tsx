export function Candle({ height = 120 }: { height?: number }) {
  return (
    <div aria-hidden="true" className="relative flex flex-col items-center">
      <div
        className="pointer-events-none absolute left-1/2 -top-[37px] h-24 w-24 -translate-x-1/2 rounded-full print:hidden"
        style={{
          background:
            "radial-gradient(circle, rgba(244,166,42,0.5) 0%, rgba(244,166,42,0) 70%)",
        }}
      />
      <div
        className="flame relative z-10 h-[22px] w-[10px]"
        style={{
          borderRadius: "50% 50% 50% 50% / 65% 65% 35% 35%",
          background: "linear-gradient(#FFF3C4,#F4A62A 70%,#E8684A)",
        }}
      />
      <div
        className="relative z-10 w-[18px] rounded-[3px]"
        style={{
          height: `${height}px`,
          background: "linear-gradient(90deg,#E9D8C0,#FFF6E6 45%,#D9C3A6)",
        }}
      />
    </div>
  );
}

export default Candle;
