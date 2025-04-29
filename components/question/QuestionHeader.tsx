import { cn } from "@/lib/utils";

interface QuestionHeaderProps {
  question: string;
  currentSlide?: number;
  totalSlides?: number;
  className?: string;
}

export default function QuestionHeader({
  question,
  currentSlide,
  totalSlides,
  className,
}: QuestionHeaderProps) {
  return (
    <div
      className={cn(
        "relative border-b border-white/20 bg-gray-500/10 p-4 lg:p-6",
        className,
      )}
    >
      {totalSlides && (
        <div className="absolute right-4 top-4 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-white">
          {currentSlide}/{totalSlides}
        </div>
      )}
      <h2 className="pr-16 text-lg font-semibold text-white md:text-2xl">
        {question}
      </h2>
    </div>
  );
}
