"use client";
import useQuizStore, { Question, Quiz } from "@/stores/useQuizStore";
import { useEffect } from "react";
import SlideShowQuestionComponent from "./slideshow/SlideShowQuestion";
import GlowingQuestionWrapper from "./GlowingCursorWrapper";
import QuestionLoaderHeader from "./QuestionLoaderHeader";
import { AuroraBackground } from "@/components/background/aurora-background";

export default function QuestionLoader({
  questionsData,
  quizData,
}: {
  questionsData: Question[];
  quizData: Quiz;
}) {
  const { setQuiz, loadQuestions, questions, currentIndex, setStartTimestamp } =
    useQuizStore();

  useEffect(() => {
    setQuiz(quizData);
    setStartTimestamp(Date.now());
    loadQuestions(questionsData);
    console.log("client", questionsData, quizData);
  }, [loadQuestions, questionsData]);

  return (
    <AuroraBackground>
      {questions.map((q, index) => (
        <GlowingQuestionWrapper
          key={q.question_id}
          style={{ display: index === currentIndex ? "relative" : "none" }}
        >
          <div className="max-h-screen w-full max-w-3xl space-y-5 rounded-xl lg:space-y-8">
            <QuestionLoaderHeader />
            <div className="max-w-xl lg:max-w-3xl">
              <QuestionComponent question={q} />
            </div>
          </div>
        </GlowingQuestionWrapper>
      ))}
    </AuroraBackground>
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
