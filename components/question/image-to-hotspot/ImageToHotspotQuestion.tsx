"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question, QuestionOption } from "@/stores/useQuizStore";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export default function ImageHotspotQuestionComponent({
  question,
}: {
  question: Question;
}) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const validOptions = question.question_options.filter(
    (opt) =>
      opt.is_active && opt.pos_x !== undefined && opt.pos_y !== undefined,
  );

  const handleLabelClick = (option: QuestionOption) => {
    if (showResults) return;
    setSelectedLabel((prev) =>
      prev === option.option_id ? null : option.option_id,
    );
  };

  const handleHotspotClick = (optionId: string) => {
    if (showResults) return;
    if (!selectedLabel) return;

    setMatches((prev) => {
      const newMatches = { ...prev };

      // Remove previous match for this hotspot
      const existing = Object.entries(newMatches).find(
        ([_, value]) => value === optionId,
      );
      if (existing) {
        delete newMatches[existing[0]];
      }

      // Remove old match for this label
      if (newMatches[selectedLabel]) {
        delete newMatches[selectedLabel];
      }

      // Set new match
      return {
        ...newMatches,
        [selectedLabel]: optionId,
      };
    });

    setSelectedLabel(null);
  };

  const handleSubmit = () => {
    setShowResults(true);
    console.log("ANSWERS SUBMITTEDD!!!");
  };

  const handleReset = () => {
    setMatches({});
    setSelectedLabel(null);
    setShowResults(false);
  };

  const isHotspotMatched = (optionId: string) => {
    return Object.values(matches).includes(optionId);
  };

  const getHotspotColor = (optionId: string) => {
    const matched = Object.entries(matches).find(
      ([_, value]) => value === optionId,
    );
    if (!matched) return "transparent";

    const option = validOptions.find((o) => o.option_id === matched[0]);
    return option?.is_correct ? "#22c55e" : "#ef4444"; // green if correct, red if wrong
  };

  const isCorrectMatch = (optionId: string) => {
    if (!showResults) return false;
    const matched = Object.entries(matches).find(
      ([_, value]) => value === optionId,
    );
    if (!matched) return false;

    const selected = validOptions.find((opt) => opt.option_id === matched[0]);
    const target = validOptions.find((opt) => opt.option_id === optionId);
    return selected?.option_id === target?.option_id;
  };

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      <Card className="border border-white/20 bg-background/80 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            {question.question_text}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl">
          {question.image_urls?.[0] && (
            <img
              src={question.image_urls[0]}
              alt={question.question_text}
              className="h-full w-full object-contain"
            />
          )}

          {validOptions.map((option) => (
            <button
              key={option.option_id}
              onClick={() => handleHotspotClick(option.option_id)}
              className={cn(
                "absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 md:h-10 md:w-10",
                isHotspotMatched(option.option_id)
                  ? "ring-2"
                  : selectedLabel
                    ? "animate-pulse cursor-pointer ring-2 ring-white"
                    : "cursor-pointer ring-2 ring-white/50 hover:ring-white",
                showResults && isCorrectMatch(option.option_id)
                  ? "ring-green-500"
                  : showResults && isHotspotMatched(option.option_id)
                    ? "ring-red-500"
                    : "",
              )}
              style={{
                left: `${option.pos_x}%`,
                top: `${option.pos_y}%`,
                backgroundColor: getHotspotColor(option.option_id),
              }}
            >
              <span className="sr-only">Hotspot for {option.option_text}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-white/70">
          {showResults
            ? "Review your answers above"
            : selectedLabel
              ? "Now click a spot on the image"
              : "Select a label below"}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {validOptions.map((option) => (
          <Button
            key={option.option_id}
            onClick={() => handleLabelClick(option)}
            className={cn(
              "relative h-12 transition-all duration-200 md:h-14",
              selectedLabel === option.option_id
                ? "ring-2 ring-offset-2"
                : matches[option.option_id] && !showResults
                  ? "opacity-75"
                  : "",
              showResults && matches[option.option_id] === option.option_id
                ? "ring-2 ring-green-500"
                : showResults && matches[option.option_id]
                  ? "ring-2 ring-red-500"
                  : "",
            )}
            style={{
              backgroundColor:
                selectedLabel === option.option_id ? "#0ea5e9" : "transparent",
              borderColor: "#0ea5e9",
              color: selectedLabel === option.option_id ? "white" : "#0ea5e9",
            }}
            disabled={showResults}
          >
            {option.option_text}
          </Button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        className="mt-2 w-full"
        disabled={
          Object.keys(matches).length !== validOptions.length || showResults
        }
      >
        Check Answers
      </Button>
    </div>
  );
}
