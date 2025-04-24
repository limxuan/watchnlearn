"use client";

import { useState } from "react";
import { ImageMCQQuestion } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ZoomImage from "@/components/ui/zoom-image";

interface ImageMCQQuestionProps {
  question: ImageMCQQuestion;
  onAnswer?: (answerId: string) => void;
}

export default function ImageMCQQuestionComponent({
  question,
  onAnswer,
}: ImageMCQQuestionProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const handleSelectAnswer = (answerId: string) => {
    setSelectedAnswerId(answerId);
    onAnswer?.(answerId);
  };

  return (
    <div className="flex w-full flex-col">
      <Card className="border border-white/20 bg-background/80 p-6 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl">
          {question.question}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {question.answers.map((answer) => (
            <Card
              key={answer.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden border border-white/20 bg-background/40 transition-all duration-200",
                selectedAnswerId === answer.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "hover:border-white/40",
              )}
            >
              <ZoomImage
                src={answer.imageUrl}
                alt={answer.alt}
                aspectRatio="video"
                objectFit="cover"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />

              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-white/10 text-white shadow-lg hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAnswer(answer.id);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>

              {selectedAnswerId === answer.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <div className="rounded-full bg-primary/40 p-2">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
