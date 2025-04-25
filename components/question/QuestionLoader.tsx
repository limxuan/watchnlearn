"use client";
import useQuizStore, { Question, Quiz } from "@/stores/useQuizStore";
import { useEffect } from "react";
import SlideShowQuestionComponent from "./slideshow/SlideShowQuestion";
import GlowingQuestionWrapper from "./GlowingCursorWrapper";
import QuestionLoaderHeader from "./QuestionLoaderHeader";
import { AuroraBackground } from "@/components/background/aurora-background";
import { unstable_ViewTransition as ViewTransition } from "react";

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
      {questions.map(
        (q, index) =>
          index === currentIndex && (
            <div
              className="max-h-screen w-full max-w-3xl space-y-5 rounded-xl lg:space-y-8"
              key={index}
            >
              <QuestionLoaderHeader />
              <div className="max-w-xl lg:max-w-3xl">
                <QuestionComponent question={q} />
              </div>
            </div>
          ),
      )}
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
