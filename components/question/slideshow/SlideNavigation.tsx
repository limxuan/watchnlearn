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
        "rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg border border-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
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
        "rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg border border-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
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

function Dots({ currentSlide, totalSlides, onSelectSlide, className }: DotsProps) {
  return (
    <div className={cn("flex justify-center items-center py-4 gap-2", className)}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            index === currentSlide 
              ? "bg-white w-4" 
              : "bg-white/20 hover:bg-white/40"
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