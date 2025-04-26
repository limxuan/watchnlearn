import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

function PrevButton({ onClick, disabled, className }: NavigationButtonProps) {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "rounded-full border border-white/20 bg-white/10 text-white shadow-lg hover:bg-white/20",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label="Previous slide"
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  );
}

function NextButton({ onClick, disabled, className }: NavigationButtonProps) {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "rounded-full border border-white/20 bg-white/10 text-white shadow-lg hover:bg-white/20",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label="Next slide"
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  );
}

interface DotsProps {
  currentSlide: number;
  totalSlides: number;
  onSelectSlide: (index: number) => void;
  className?: string;
}

function Dots({
  currentSlide,
  totalSlides,
  onSelectSlide,
  className,
}: DotsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 bg-gray-500/10 py-4",
        className,
      )}
    >
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",
            index === currentSlide
              ? "w-4 bg-white"
              : "bg-white/20 hover:bg-white/40",
          )}
          onClick={() => onSelectSlide(index)}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === currentSlide ? "true" : "false"}
        />
      ))}
    </div>
  );
}

const SlideNavigation = {
  PrevButton,
  NextButton,
  Dots,
};

export default SlideNavigation;
