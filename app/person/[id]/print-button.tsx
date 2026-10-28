"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/button";

export default function PrintButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      className="rounded-full"
      onClick={() => window.print()}
    >
      <Printer aria-hidden="true" className="h-[18px] w-[18px]" />
      Print this ofrenda
    </Button>
  );
}
