"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Maximize2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import ZoomImage from "@/components/ui/zoom-image";
import { Question } from "@/stores/useQuizStore";
import { ArrowRight } from "lucide-react";

interface PictureMatchingQuestionProps {
  question: Question;
  onSubmit?: (matches: PictureMatchingPair[]) => void;
}

interface PictureMatchingPair {
  source_option_id: string;
  target_option_id: string;
}

export default function PictureMatchingQuestionComponent({
  question,
}: PictureMatchingQuestionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [userMatches, setUserMatches] = useState<PictureMatchingPair[]>([]);
  const [allCorrect, setAllCorrect] = useState(false);
  const [incorrectSelection, setIncorrectSelection] = useState<string | null>(
    null,
  );

  const sourceOptions = question.matches?.map((match) => match[0]) ?? [];
  const targetOptions = question.matches?.map((match) => match[1]) ?? [];

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
      setAllCorrect(true);
      console.log("All correct!");
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
    setAllCorrect(false);
    setIncorrectSelection(null);
  };

  if (allCorrect) {
    return (
      <Card className="flex items-center justify-center border border-green-500/20 bg-green-500/10 p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-fit rounded-full bg-green-500/20 p-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-green-500">
            Well done! All matches are correct!
          </h3>
        </div>
      </Card>
    );
  }

  const renderOption = (optionId: string) => (
    <div key={optionId} className="space-y-2">
      <Card
        className={cn(
          "group relative aspect-video cursor-pointer overflow-hidden border transition-all duration-200 md:aspect-square",
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
      <div className="relative flex items-center justify-between rounded-lg border border-b border-white/20 bg-gray-500/30 p-1 backdrop-blur-lg lg:p-6">
        <h1 className="pl-1 text-sm font-semibold text-white lg:pr-16 lg:text-2xl">
          {question.question_text}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="bg-transparent text-white/60 hover:text-white"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Reset</span>
        </Button>
      </div>

      {/* Status */}
      <div className="rounded-lg bg-white/5 py-1 text-center text-white/80 lg:px-4 lg:py-2">
        {selectedOptionId
          ? "Now select a matching image"
          : "Select an image to start matching"}
      </div>

      {/* Options */}
      <div className="flex flex-row gap-4 md:gap-6">
        {[sourceOptions, "arrow", targetOptions].map((opt, idx) => {
          if (opt !== "arrow")
            return (
              <Card key={idx} className="flex-1 bg-transparent">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
