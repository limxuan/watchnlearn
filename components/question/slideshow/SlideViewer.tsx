"use client";

import ZoomImage from "@/components/ui/zoom-image";
import { cn } from "@/lib/utils";

export default function SlideViewer({ slide, className }: any) {
  return (
    <div className={cn("relative bg-background/40", className)}>
      {slide.imageUrl ? (
        <ZoomImage src={slide.imageUrl} alt={slide.alt} aspectRatio="video" />
      ) : (
        <div className="flex h-full items-center justify-center text-white/60">
          No image available
        </div>
      )}
    </div>
  );
}
