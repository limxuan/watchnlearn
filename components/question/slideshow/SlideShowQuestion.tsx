"use client";

import { useState } from "react";
import QuestionHeader from "./QuestionHeader";
import SlideViewer from "./SlideViewer";
import SlideNavigation from "./SlideNavigation";
import AnswerOptions from "./AnswerOptions";
import { Card } from "@/components/ui/card";
import useQuizStore, { Question } from "@/stores/useQuizStore";

interface SlideShowQuestionProps {
  question: Question;
  onAnswer?: (answerId: string) => void;
}

export default function SlideShowQuestionComponent({
  question,
}: SlideShowQuestionProps) {
  const timeoutToNextQuestion = 3000;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const { answerQuestion, nextQuestion } = useQuizStore();
  const mappedSlides: any[] = question.image_urls!.map((url, idx) => ({
    id: idx.toString(),
    imageUrl: url,
    alt: url,
  }));
  const currentSlide = mappedSlides[currentSlideIndex];

  const handlePrevious = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) =>
      prev < mappedSlides.length - 1 ? prev + 1 : prev,
    );
  };

  const handleGoToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const handleSelectAnswer = (answerId: string) => {
    const correctOption = question.question_options.find(
      (option) => option.is_correct,
    );
    const isCorrect = answerId === correctOption?.option_id;

    setSelectedAnswerId(answerId);
    answerQuestion({
      questionId: question.question_id,
      questionType: question.question_type,
      questionText: question.question_text,
      selectedOption: answerId,
      correctOption: correctOption?.option_id!,
      isCorrect,
    });
    setTimeout(() => {
      nextQuestion();
    }, timeoutToNextQuestion);
  };

  return (
    <div className="flex w-full flex-col">
      <Card className="overflow-hidden border border-white/20 bg-black/30 shadow-2xl backdrop-blur-md">
        <QuestionHeader
          question={question.question_text}
          currentSlide={currentSlideIndex + 1}
          totalSlides={mappedSlides.length}
        />

        <div className="relative">
          <SlideViewer slide={currentSlide} />

          <div className="absolute left-2 top-1/2 -translate-y-1/2 transform md:left-4">
            <SlideNavigation.PrevButton
              onClick={handlePrevious}
              disabled={currentSlideIndex === 0}
            />
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 transform md:right-4">
            <SlideNavigation.NextButton
              onClick={handleNext}
              disabled={currentSlideIndex === mappedSlides.length - 1}
            />
          </div>
        </div>

        <SlideNavigation.Dots
          currentSlide={currentSlideIndex}
          totalSlides={mappedSlides.length}
          onSelectSlide={handleGoToSlide}
        />
      </Card>

      <div className="mt-4 md:mt-6">
        <AnswerOptions
          options={question.question_options}
          selectedAnswerId={selectedAnswerId}
          onSelectAnswerAction={handleSelectAnswer}
        />
      </div>
    </div>
  );
}
