"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useQuizStore, { Question } from "@/stores/useQuizStore";
import ResetButton from "@/components/question/ResetButton";

const HOTSPOT_COLORS = [
  "oklch(80.8% 0.114 19.571)",
  "oklch(88.2% 0.059 254.128)",
  "oklch(92.5% 0.084 155.995)", // Gray
];

const HOTSPOT_BG_CLASSES = ["bg-red-500", "bg-blue-400", "bg-green-300"];
const HOTSPOT_TEXT_CLASSES = [
  "text-red-500",
  "text-blue-400",
  "text-green-300",
];

export default function LabelHotspotQuestionComponent({
  question,
}: {
  question: Question;
}) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { answerQuestion, nextQuestion } = useQuizStore();
  const [mistakeCount, setMistakeCount] = useState(0);

  const handleLabelClick = (optionId: string) => {
    if (showResults) return;
    setSelectedLabel((prev) => (prev === optionId ? null : optionId));
  };

  const handleHotspotClick = (hotspotId: string) => {
    if (showResults) return;
    if (!selectedLabel) return;

    setMatches((prev) => {
      const newMatches = { ...prev };

      // Remove any existing matches for this hotspot
      const existingLabelForHotspot = Object.entries(newMatches).find(
        ([_, value]) => value === hotspotId,
      );
      if (existingLabelForHotspot) {
        delete newMatches[existingLabelForHotspot[0]];
      }

      // If this label was already matched somewhere else, remove that match
      if (newMatches[selectedLabel]) {
        delete newMatches[selectedLabel];
      }

      // Add new match
      return {
        ...newMatches,
        [selectedLabel]: hotspotId,
      };
    });

    setSelectedLabel(null);
  };

  const handleSubmit = () => {
    setShowResults(true);

    const correctQuestions = Object.entries(matches).filter(
      ([k, v]) => k === v,
    ).length;
    console.log({ correctQuestions });
    setTimeout(() => {
      if (correctQuestions != question.question_options.length) {
        setMistakeCount((prev) => prev + 1);
        handleReset();
      } else {
        console.log({ mistakeCount });
        answerQuestion({
          questionId: question.question_id,
          questionType: question.question_type,
          questionText: question.question_text,
          isCorrect: true,
          selectedOption: "",
          correctOption: "",
          mistakeCount: mistakeCount,
        });
        nextQuestion();
      }
    }, 1500);
  };

  const handleReset = () => {
    setMatches({});
    setSelectedLabel(null);
    setShowResults(false);
  };

  const isHotspotMatched = (hotspotId: string) => {
    return Object.values(matches).includes(hotspotId);
  };

  const getHotspotColor = (hotspotId: string) => {
    const matchedLabel = Object.entries(matches).find(
      ([_, value]) => value === hotspotId,
    );
    if (!matchedLabel) return "transparent";
    const hotspotIndex = question.question_options.findIndex(
      (h) => h.option_id === matchedLabel[0],
    );
    return HOTSPOT_COLORS[hotspotIndex % HOTSPOT_COLORS.length];
  };

  const isCorrectMatch = (hotspotId: string) => {
    if (!showResults) return false;
    const matchedLabel = Object.entries(matches).find(
      ([_, value]) => value === hotspotId,
    );
    if (!matchedLabel) return false;

    return matchedLabel[0] === hotspotId;
  };

  return (
    <div className="flex max-h-dvh w-full flex-col gap-4 md:gap-6">
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
            className="w-full bg-blue-300 object-contain"
          />

          {question.question_options.map(
            ({ option_id, pos_x, pos_y, option_text }) => (
              <button
                key={option_id}
                onClick={() => handleHotspotClick(option_id)}
                className={cn(
                  `absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 md:h-10 md:w-10 ${getHotspotColor}`,
                  isHotspotMatched(option_id)
                    ? "ring-2"
                    : selectedLabel
                      ? "animate-pulse cursor-pointer ring-2 ring-white"
                      : "cursor-pointer ring-2 ring-white/50 hover:ring-white",
                  showResults && isCorrectMatch(option_id)
                    ? "ring-green-500"
                    : showResults && isHotspotMatched(option_id)
                      ? "ring-red-500"
                      : "",
                )}
                style={{
                  left: `${pos_x}%`,
                  top: `${pos_y}%`,
                  backgroundColor: getHotspotColor(option_id),
                }}
              >
                <span className="sr-only">Hotspot for {option_text}</span>
              </button>
            ),
          )}
        </div>

        {/* Helper text */}
        <p className="mt-4 text-center text-white/70">
          {showResults
            ? "Review your answers above"
            : selectedLabel
              ? "Now click a spot on the image"
              : "Select a label below"}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {question.question_options.map(({ option_id, option_text }, index) => (
          <Button
            key={option_id}
            onClick={() => handleLabelClick(option_id)}
            className={cn(
              "relative h-12 rounded-md border-primary bg-gray-500/30 px-4 py-2 transition-all duration-200 hover:text-black md:h-14",
              selectedLabel === option_id
                ? [
                    HOTSPOT_BG_CLASSES[index % HOTSPOT_BG_CLASSES.length],
                    "text-white",
                    "ring-2 ring-offset-2",
                  ]
                : matches[option_id] && !showResults
                  ? [
                      "opacity-75",
                      HOTSPOT_TEXT_CLASSES[index % HOTSPOT_TEXT_CLASSES.length],
                    ]
                  : HOTSPOT_TEXT_CLASSES[index % HOTSPOT_TEXT_CLASSES.length],
              showResults && matches[option_id] === option_id
                ? "ring-2 ring-green-500"
                : showResults && matches[option_id]
                  ? "ring-2 ring-red-500"
                  : "",
            )}
            disabled={showResults}
          >
            {option_text}
          </Button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        className="mt-2 w-full"
        disabled={
          Object.keys(matches).length !== question.question_options.length ||
          showResults
        }
      >
        Check Answers
      </Button>
    </div>
  );
}
