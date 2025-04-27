"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ZoomImage from "@/components/ui/zoom-image";
import useQuizStore, { Question } from "@/stores/useQuizStore";

interface ImageMCQQuestionProps {
  question: Question;
  onAnswer?: (answerId: string) => void;
}

export default function ImageMCQQuestionComponent({
  question,
}: ImageMCQQuestionProps) {
  const { answerQuestion, nextQuestion } = useQuizStore();
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const correctOptionId = question.question_options.find(
    (opt) => opt.is_correct,
  )?.option_id;

  const handleSelectAnswer = (answerId: string) => {
    if (!isSubmitted) {
      setSelectedAnswerId(answerId);
    }
  };

  const handleConfirm = () => {
    if (selectedAnswerId && !isSubmitted) {
      const isCorrect = selectedAnswerId === correctOptionId;

      answerQuestion({
        questionId: question.question_id,
        questionType: question.question_type,
        questionText: question.question_text,
        selectedOption: selectedAnswerId,
        correctOption: correctOptionId!,
        isCorrect,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  return (
    <div className="flex w-full flex-col space-y-6">
      <Card className="overflow-hidden border border-white/20 bg-black/30 shadow-2xl backdrop-blur-md">
        <div className="bg-gray-500/10 p-4 lg:p-6">
          <h1 className="text-lg font-semibold text-white md:text-2xl">
            {question.question_text}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-gray-500/10 p-4 pt-0 md:gap-4">
          {question.question_options.map((answer) => {
            const isSelected = selectedAnswerId === answer.option_id;
            const isCorrect = answer.option_id === correctOptionId;

            return (
              <Card
                key={answer.option_id}
                onClick={() => handleSelectAnswer(answer.option_id)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden border bg-background/40 transition-all duration-200",
                  !isSubmitted &&
                  isSelected &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  !isSubmitted && "hover:border-white/40",
                  isSubmitted &&
                  isCorrect &&
                  "border-green-500 ring-2 ring-green-500",
                  isSubmitted &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-500 ring-2 ring-red-500",
                )}
              >
                {/* Mobile square aspect */}
                <div className="relative aspect-square md:hidden">
                  <ZoomImage
                    src={answer.option_url}
                    alt={answer.option_text || "Option"}
                    aspectRatio="square"
                    objectFit="cover"
                  />
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 transition-opacity",
                      isSubmitted
                        ? isCorrect
                          ? "bg-green-500/20"
                          : isSelected
                            ? "bg-red-500/30"
                            : "bg-black/40"
                        : isSelected
                          ? "bg-white/20"
                          : "bg-black/40 opacity-0 group-hover:opacity-100",
                    )}
                  />
                </div>

                {/* Desktop video aspect */}
                <div className="relative hidden md:block">
                  <ZoomImage
                    src={answer.option_url}
                    alt={answer.option_text || "Option"}
                    aspectRatio="video"
                    objectFit="cover"
                  />
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 transition-opacity",
                      isSubmitted
                        ? isCorrect
                          ? "bg-green-500/20"
                          : isSelected
                            ? "bg-red-500/30"
                            : "bg-black/40"
                        : isSelected
                          ? "bg-white/20"
                          : "bg-black/40 opacity-0 group-hover:opacity-100",
                    )}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Confirm button */}
      <div className="flex justify-center md:justify-end">
        <Button
          disabled={selectedAnswerId === null || isSubmitted}
          onClick={handleConfirm}
          className={cn(
            "z-10 gap-3 transition-colors",
            selectedAnswerId !== null && !isSubmitted
              ? "hover:bg-primary/80"
              : "cursor-not-allowed opacity-50",
          )}
        >
          <span>Confirm Answer</span>
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
