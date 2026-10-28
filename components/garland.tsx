export function Garland({ width = 240 }: { width?: number | string }) {
  return (
    <div
      aria-hidden="true"
      className="h-3.5 opacity-[0.85]"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        backgroundImage: "radial-gradient(circle, #F4A62A 0 5px, transparent 6px)",
        backgroundSize: "28px 14px",
      }}
    />
  );
}

export default Garland;
