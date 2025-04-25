"use client";
import useQuizStore, { Question } from "@/stores/useQuizStore";
import { useEffect } from "react";
import SlideShowQuestionComponent from "./slideshow/SlideShowQuestion";
import GlowingQuestionWrapper from "./GlowingCursorWrapper";

export default function QuestionLoader({
  questionsData,
}: {
  questionsData: Question[];
}) {
  const { loadQuestions, questions, currentIndex } = useQuizStore();

  useEffect(() => {
    loadQuestions(questionsData);
    console.log("client", questionsData);
  }, [loadQuestions, questionsData]);

  return (
    <>
      {questions.map((q, index) => (
        <GlowingQuestionWrapper
          key={q.question_id}
          style={{ display: index === currentIndex ? "relative" : "none" }}
        >
          <div className="max-h-screen w-full max-w-3xl space-y-5 rounded-xl lg:space-y-8">
            <div className="bg-purple-900">headers</div>
            <div className="max-w-xl lg:max-w-3xl">
              <QuestionComponent question={q} />
            </div>
          </div>
        </GlowingQuestionWrapper>
      ))}
    </>
  );
}

function QuestionComponent({ question }: { question: Question }) {
  switch (question.question_type) {
    case "slideshow":
      return <SlideShowQuestionComponent question={question} />;
    default:
      return <div>❌ Unknown question type: {question.question_type}</div>;
  }
}
