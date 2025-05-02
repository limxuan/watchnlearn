"use client";

import { useState } from "react";
import QuestionHeader from "../QuestionHeader";
import AnswerOptions from "../AnswerOptions";
import { Card } from "@/components/ui/card";
import useQuizStore, { Question } from "@/stores/useQuizStore";

export default function VideoQuestionComponent({
  question,
}: {
  question: Question;
}) {
  const timeoutToNextQuestion = 1500;
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const { answerQuestion, nextQuestion } = useQuizStore();

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
      mistakeCount: 0,
    });
    setTimeout(() => {
      nextQuestion();
    }, timeoutToNextQuestion);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Card className="overflow-hidden border border-white/20 bg-black/30 shadow-2xl backdrop-blur-md">
        <QuestionHeader question={question.question_text} />

        <div className="relative">
          <video controls autoPlay key={question.video_url}>
            <source src={question.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
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
