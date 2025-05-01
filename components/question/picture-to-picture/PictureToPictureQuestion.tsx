"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import ZoomImage from "@/components/ui/zoom-image";
import useQuizStore, { Question } from "@/stores/useQuizStore";
import { ArrowRight } from "lucide-react";
import ResetButton from "@/components/question/ResetButton";

interface PictureMatchingPair {
  source_option_id: string;
  target_option_id: string;
}

export default function PictureMatchingQuestionComponent({
  question,
}: {
  question: Question;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [userMatches, setUserMatches] = useState<PictureMatchingPair[]>([]);
  const [incorrectSelection, setIncorrectSelection] = useState<string | null>(
    null,
  );
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [targetOptions, setTargetOptions] = useState<string[]>([]);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const { answerQuestion, nextQuestion } = useQuizStore();

  useEffect(() => {
    setSourceOptions(
      shuffleArray(question.matches?.map((match) => match[0]) ?? []),
    );
    setTargetOptions(
      shuffleArray(question.matches?.map((match) => match[1]) ?? []),
    );
  }, []);

  const handleOptionClick = (optionId: string) => {
    if (isMatchCorrect(optionId)) return;

    if (!selectedOptionId) {
      setSelectedOptionId(optionId);
      setIncorrectSelection(null);
      return;
    }

    if (selectedOptionId === optionId) {
      setSelectedOptionId(null);
      return;
    }

    const newMatch = {
      source_option_id: selectedOptionId,
      target_option_id: optionId,
    };

    const isCorrect = question.matches?.some(
      ([source, target]) =>
        (source === newMatch.source_option_id &&
          target === newMatch.target_option_id) ||
        (source === newMatch.target_option_id &&
          target === newMatch.source_option_id),
    );

    if (!isCorrect) {
      setIncorrectSelection(optionId);
      setMistakeCount((mistakeCount) => mistakeCount + 1);
      setTimeout(() => {
        setIncorrectSelection(null);
        setSelectedOptionId(null);
      }, 1000);
      return;
    }

    const filteredMatches = userMatches.filter(
      (match) =>
        ![optionId, selectedOptionId].includes(match.source_option_id) &&
        ![optionId, selectedOptionId].includes(match.target_option_id),
    );

    const updatedMatches = [...filteredMatches, newMatch];
    setUserMatches(updatedMatches);
    setSelectedOptionId(null);

    if (updatedMatches.length === question.matches?.length) {
      nextQuestion();
      answerQuestion({
        questionId: question.question_id,
        questionType: question.question_type,
        questionText: question.question_text,
        selectedOption: "",
        correctOption: "",
        isCorrect: true,
        mistakeCount: mistakeCount,
      });
    }
  };

  const isOptionMatched = (optionId: string) =>
    userMatches.some(
      (match) =>
        match.source_option_id === optionId ||
        match.target_option_id === optionId,
    );

  const isOptionSelected = (optionId: string) => selectedOptionId === optionId;

  const isMatchCorrect = (optionId: string) => {
    const match = userMatches.find(
      (m) => m.source_option_id === optionId || m.target_option_id === optionId,
    );
    if (!match) return false;
    return question.matches?.some(
      ([source, target]) =>
        (source === match.source_option_id &&
          target === match.target_option_id) ||
        (source === match.target_option_id &&
          target === match.source_option_id),
    );
  };

  const handleReset = () => {
    setUserMatches([]);
    setSelectedOptionId(null);
    setIncorrectSelection(null);
  };

  const renderOption = (optionId: string) => (
    <div key={optionId} className="space-y-2">
      <Card
        className={cn(
          "group relative aspect-video h-20 cursor-pointer overflow-hidden border-4 transition-all duration-200 md:aspect-square md:h-full",
          isOptionSelected(optionId)
            ? "border-primary bg-primary/20"
            : isMatchCorrect(optionId)
              ? "cursor-not-allowed border-green-500/50 bg-green-500/10 opacity-75"
              : incorrectSelection === optionId
                ? "border-red-500 bg-red-500/20"
                : isOptionMatched(optionId)
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-white/20 bg-background/40 hover:border-white/40",
        )}
        onClick={() => handleOptionClick(optionId)}
      >
        <div className="relative aspect-video md:aspect-square">
          <ZoomImage
            src={
              question.question_options?.find(
                (opt) => opt.option_id === optionId,
              )?.option_url ?? ""
            }
            alt={
              question.question_options?.find(
                (opt) => opt.option_id === optionId,
              )?.option_text ?? "Option"
            }
            objectFit="cover"
            className="aspect-video md:aspect-square"
          />
          {isMatchCorrect(optionId) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Check className="h-6 w-6 text-green-500" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <div className="relative flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-1 text-card-foreground shadow-xl backdrop-blur-xl lg:p-6">
        <h1 className="pl-1 text-sm font-semibold text-white lg:pr-16 lg:text-2xl">
          {question.question_text}
        </h1>
        <ResetButton onClick={handleReset} />
      </div>

      {/* Options */}
      <div className="flex flex-row gap-4 md:gap-6">
        {[sourceOptions, "arrow", targetOptions].map((opt, idx) => {
          if (opt !== "arrow")
            return (
              <Card key={idx} className="flex-1 border-0 bg-transparent">
                <div className="grid grid-cols-1 gap-3 border-0 border-transparent md:grid-cols-2">
                  {(opt as string[]).map((optionId) => renderOption(optionId))}
                </div>
              </Card>
            );

          return (
            <div className="flex items-center" key={idx}>
              <ArrowRight />
            </div>
          );
        })}
      </div>
    </div>
  );
}
