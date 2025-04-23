"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <Loader2 className={cn("h-10 w-10 animate-spin text-muted-foreground")} />
    </div>
  );
}
