const FLAG_COLORS = ["#E0457B", "#F4A62A", "#2FB5A8", "#8E5BD6", "#F7EBDD"] as const;

const CLIP_PATH =
  "polygon(0 0,100% 0,100% 100%,87.5% 78%,75% 100%,62.5% 78%,50% 100%,37.5% 78%,25% 100%,12.5% 78%,0 100%)";

export function PapelPicado() {
  return (
    <div aria-hidden="true" className="w-full print:hidden">
      <div className="h-[2px] w-full" style={{ backgroundColor: "#6B4A36" }} />
      <div className="flex gap-1.5 overflow-hidden px-1.5">
        {Array.from({ length: 22 }, (_, index) => (
          <div
            key={index}
            className="h-[54px] min-w-[44px] flex-1 basis-0"
            style={{
              backgroundColor: FLAG_COLORS[index % FLAG_COLORS.length],
              clipPath: CLIP_PATH,
              opacity: 0.92,
            }}
          >
            <span className="mx-auto mt-[14px] block h-3.5 w-3.5 rounded-full bg-ink" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PapelPicado;
