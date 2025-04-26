"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, ZoomIn, ZoomOut } from "lucide-react";

interface ZoomImageProps {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square";
  objectFit?: "contain" | "cover";
  className?: string;
}

export default function ZoomImage({
  src,
  alt,
  aspectRatio = "video",
  objectFit = "contain",
  className,
}: ZoomImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragStart],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    },
    [position],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragStart],
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className={`relative ${aspectRatio === "video" ? "aspect-video" : "aspect-square"} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-${objectFit}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
      />

      <div
        className="absolute bottom-4 right-4 z-10"
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(true);
        }}
      >
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full border border-white/20 bg-white/10 text-white shadow-lg hover:bg-white/20"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Dialog
        open={isZoomed}
        onOpenChange={(open) => {
          setIsZoomed(open);
          if (!open) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }
        }}
      >
        <DialogContent className="h-[90vh] w-[95vw] max-w-[95vw] bg-background/95 p-0 backdrop-blur-xl">
          <DialogTitle className="sr-only">Zoomed Image View</DialogTitle>
          <div
            ref={containerRef}
            className="relative h-full w-full cursor-move overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEnd}
          >
            <div
              className="relative h-full w-full transition-transform duration-100"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                willChange: "transform",
              }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                sizes="95vw"
                priority
              />
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 transform gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={handleZoomOut}
              disabled={scale <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={handleZoomIn}
              disabled={scale >= 4}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
