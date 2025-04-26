"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ZoomImage from "@/components/ui/zoom-image";
import { Question } from "@/stores/useQuizStore";

interface ImageMCQQuestionProps {
  question: Question;
  onAnswer?: (answerId: string) => void;
}

export default function ImageMCQQuestionComponent({
  question,
  onAnswer,
}: ImageMCQQuestionProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const handleSelectAnswer = (answerId: string) => {
    setSelectedAnswerId(answerId);
  };

  const handleConfirm = () => {
    console.log("clicked");
    if (selectedAnswerId) {
      console.log("selectedAnswerId", selectedAnswerId);
      onAnswer?.(selectedAnswerId);
    }
  };

  return (
    <div className="flex w-full flex-col space-y-6">
      <Card className="border border-white/20 bg-background/80 p-4 shadow-2xl md:p-6">
        <h1 className="mb-4 text-lg font-semibold text-white md:mb-6 md:text-2xl">
          {question.question_text}
        </h1>

        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {question.question_options.map((answer) => (
            <Card
              key={answer.option_id}
              className={cn(
                "group relative cursor-pointer overflow-hidden border border-white/20 bg-background/40 transition-all duration-200",
                selectedAnswerId === answer.option_id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "hover:border-white/40",
              )}
              onClick={() => handleSelectAnswer(answer.option_id)}
            >
              {/* Mobile: square aspect */}
              <div className="md:hidden">
                <div className="relative aspect-square">
                  <ZoomImage
                    src={answer.option_url}
                    alt={answer.option_text || "Option"}
                    aspectRatio="square"
                    objectFit="cover"
                  />

                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 transition-opacity",
                      selectedAnswerId === answer.option_id
                        ? "bg-white/20"
                        : "bg-black/40 opacity-0 group-hover:opacity-100",
                    )}
                  />

                  {selectedAnswerId === answer.option_id && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/20">
                      <div className="rounded-full bg-primary/40 p-2">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: video aspect */}
              <div className="hidden md:block">
                <ZoomImage
                  src={answer.option_url}
                  alt={answer.option_text || "Option"}
                  aspectRatio="video"
                  objectFit="cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />

                {selectedAnswerId === answer.option_id && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/20">
                    <div className="rounded-full bg-primary/40 p-2">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Confirm button OUTSIDE the card */}
      <div className="flex justify-center md:justify-end">
        <Button
          disabled={selectedAnswerId === null}
          onClick={handleConfirm}
          className="z-10 gap-3"
        >
          <span>Confirm Answer</span>
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
