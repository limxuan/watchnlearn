"use client";

import { Slide } from "@/types/quiz";
import ZoomImage from "@/components/ui/zoom-image";
import { cn } from "@/lib/utils";

interface SlideViewerProps {
  slide: Slide;
  className?: string;
}

export default function SlideViewer({ slide, className }: SlideViewerProps) {
  return (
    <div className={cn("relative bg-background/40", className)}>
      {slide.imageUrl ? (
        <ZoomImage
          src={slide.imageUrl}
          alt={slide.alt}
          aspectRatio="video"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/60">
          No image available
        </div>
      )}
    </div>
  );
}