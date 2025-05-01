"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useCursorGlowStore from "@/stores/useCursorGlowStore";
import useQuizStore, { QuestionOption } from "@/stores/useQuizStore";

interface AnswerOptionsProps {
  options: QuestionOption[];
  selectedAnswerId: string | null;
  onSelectAnswerAction: (answerId: string) => void;
  className?: string;
}

export default function AnswerOptions({
  options,
  selectedAnswerId,
  onSelectAnswerAction,
  className,
}: AnswerOptionsProps) {
  const { setGlowColor, resetGlow, setHeight } = useCursorGlowStore();
  const { currentIndex, answers } = useQuizStore();
  const isAnswerSelected = selectedAnswerId != null;

  return (
    <div
      className={cn("grid grid-cols-2 gap-2 px-2 md:gap-3 md:px-0", className)}
    >
      {options.map((option) => {
        const optionClasses = cn(
          "border border-white/20 bg-gray-500/10 p-4 transition-colors hover:shadow-lg backdrop-blur-lg",
          {
            "cursor-pointer": !isAnswerSelected, // Only show the pointer when the option is clickable
            "border-primary/40 bg-green-200/50":
              isAnswerSelected &&
              option.is_correct &&
              selectedAnswerId !== null,
            "border-primary/40 bg-red-200/50":
              isAnswerSelected &&
              selectedAnswerId === option.option_id &&
              !option.is_correct,
            "hover:border-white/40 hover:bg-background/90": !isAnswerSelected,
            "opacity-50 pointer-events-none cursor-default":
              isAnswerSelected && selectedAnswerId !== option.option_id, // Disable cursor when disabled
          },
        );
        return (
          <Card
            key={option.option_id}
            onMouseOver={() => {
              if (currentIndex === answers.length) {
                setGlowColor("bg-yellow-100");
              }
            }}
            onMouseLeave={() => {
              if (currentIndex === answers.length) resetGlow();
            }}
            className={optionClasses}
            onClick={() => onSelectAnswerAction(option.option_id)}
          >
            <div className="text-sm text-white md:text-lg">
              {option.option_text}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
