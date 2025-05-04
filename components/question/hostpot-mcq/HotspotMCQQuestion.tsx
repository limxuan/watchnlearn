"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useQuizStore, { Question } from "@/stores/useQuizStore";
import ResetButton from "@/components/question/ResetButton";

// Constants for visual styling
const HOTSPOT_ACTIVE_BG = "bg-blue-500/80";
const HOTSPOT_HOVER_BG = "bg-white/30";
const HOTSPOT_INCORRECT_BG = "bg-red-500/80";
const HOTSPOT_CORRECT_BG = "bg-green-500/80";

export default function HotspotMCQQuestionComponent({
  question,
}: {
  question: Question;
}) {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { answerQuestion, nextQuestion } = useQuizStore();

  // Get the correct hotspot ids from the question options
  const correctHotspotIds = question.question_options
    .filter((option) => option.is_correct)
    .map((option) => option.option_id);

  const handleHotspotClick = (hotspotId: string) => {
    if (showResults) return;

    // Set the selected hotspot to the clicked one, or null if clicking the same one again
    setSelectedHotspot((prev) => (prev === hotspotId ? null : hotspotId));
  };

  const handleSubmit = () => {
    setShowResults(true);

    // Check if the selected hotspot is correct
    const isCorrect =
      selectedHotspot !== null && correctHotspotIds.includes(selectedHotspot);

    setTimeout(() => {
      nextQuestion();
      answerQuestion({
        questionId: question.question_id,
        questionType: question.question_type,
        questionText: question.question_text,
        isCorrect,
        selectedOption: selectedHotspot || "",
        correctOption: correctHotspotIds[0],
      });
    }, 1500);
  };

  const handleReset = () => {
    setSelectedHotspot(null);
    setShowResults(false);
  };

  const getHotspotStyles = (hotspotId: string, isCorrect: boolean) => {
    if (!showResults) {
      return selectedHotspot === hotspotId
        ? HOTSPOT_ACTIVE_BG
        : HOTSPOT_HOVER_BG;
    }

    // When showing results
    if (isCorrect) {
      return HOTSPOT_CORRECT_BG;
    } else {
      return selectedHotspot === hotspotId
        ? HOTSPOT_INCORRECT_BG
        : HOTSPOT_HOVER_BG;
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      <Card className="flex flex-col items-center border border-white/20 bg-gray-500/10 p-4 md:p-7">
        <div className="mb-4 flex w-full items-center justify-between md:mb-6">
          <h2 className="pl-1 text-sm font-semibold text-white lg:pr-16 lg:text-2xl">
            {question.question_text}
          </h2>
          <ResetButton onClick={handleReset} />
        </div>

        <div className="relative w-full max-w-xl">
          <img
            src={question.image_urls![0]}
            alt={question.question_text}
            className="w-full rounded-md object-contain"
          />

          {question.question_options.map((option) => (
            <button
              key={option.option_id}
              onClick={() => handleHotspotClick(option.option_id)}
              className={cn(
                "absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition-all duration-200 md:h-10 md:w-10",
                getHotspotStyles(option.option_id, option.is_correct),
                !showResults &&
                  "hover:ring-2 hover:ring-white hover:ring-offset-2",
                selectedHotspot === option.option_id &&
                  !showResults &&
                  "ring-2 ring-white ring-offset-2",
                showResults &&
                  option.is_correct &&
                  "ring-2 ring-green-500 ring-offset-2",
                showResults &&
                  selectedHotspot === option.option_id &&
                  !option.is_correct &&
                  "ring-2 ring-red-500 ring-offset-2",
                "shadow-lg", // Add shadow for better visibility
              )}
              disabled={showResults}
              style={{
                left: `${option.pos_x}%`,
                top: `${option.pos_y}%`,
              }}
            >
              <span className="sr-only">
                Hotspot {option.option_text || option.option_id}
              </span>
            </button>
          ))}
        </div>

        {/* Helper text */}
        <p className="mt-4 text-center text-white/70">
          {showResults
            ? "Review your answer above"
            : "Select the correct hotspot on the image"}
        </p>
      </Card>

      <div className="mt-2">
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={selectedHotspot === null || showResults}
        >
          Check Answers
        </Button>
      </div>
    </div>
  );
}
