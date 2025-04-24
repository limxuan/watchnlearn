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
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 px-2 md:grid-cols-2 md:px-0",
        className,
      )}
    >
      {options.map((option) => (
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
          className={cn(
            "cursor-pointer border border-white/20 bg-gray-500/10 p-4 transition-colors hover:shadow-lg",
            selectedAnswerId === option.option_id
              ? "border-primary/40 bg-primary/20"
              : "hover:border-white/40 hover:bg-background/90",
          )}
          onClick={() => onSelectAnswerAction(option.option_id)}
        >
          <div className="text-base text-white md:text-lg">
            {option.option_text}
          </div>
        </Card>
      ))}
    </div>
  );
}
