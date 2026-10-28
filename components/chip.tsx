import * as React from "react";
import { cn } from "@/lib/utils";

type ChipProps = React.ComponentProps<"span"> & {
  active?: boolean;
};

export function Chip({ children, active = false, className, ...props }: ChipProps) {
  return (
    <span
      data-active={active}
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-sm",
        active
          ? "border-marigold bg-marigold text-[#1A0F0A]"
          : "border-line bg-chip text-cream",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Chip;
