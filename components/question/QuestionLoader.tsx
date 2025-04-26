"use client";
import useQuizStore, { Question, Quiz } from "@/stores/useQuizStore";
import { useEffect, useState } from "react";
import SlideShowQuestionComponent from "./slideshow/SlideShowQuestion";
import QuestionLoaderHeader from "./QuestionLoaderHeader";
import { AuroraBackground } from "@/components/background/aurora-background";
import ImageMCQQuestionComponent from "@/components/question/image-mcq/ImageMCQQuestion";
import { AnimatePresence, motion } from "framer-motion";

export default function QuestionLoader({
  questionsData,
  quizData,
}: {
  questionsData: Question[];
  quizData: Quiz;
}) {
  const { setQuiz, loadQuestions, questions, currentIndex, setStartTimestamp } =
    useQuizStore();

  // Track direction for animation
  const [direction, setDirection] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);

  useEffect(() => {
    setQuiz(quizData);
    setStartTimestamp(Date.now());
    loadQuestions(questionsData);
    console.log("client", questionsData, quizData);
  }, [loadQuestions, questionsData, quizData, setQuiz, setStartTimestamp]);

  // Determine animation direction when current index changes
  useEffect(() => {
    setDirection(currentIndex > prevIndex ? 1 : -1);
    setPrevIndex(currentIndex);
  }, [currentIndex, prevIndex]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <AuroraBackground>
      <div className="max-h-dvh w-full max-w-3xl space-y-5 overflow-hidden rounded-xl p-4 px-4 lg:space-y-8">
        <QuestionLoaderHeader />

        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {questions.map(
            (q, index) =>
              index === currentIndex && (
                <motion.div
                  key={index}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="w-full space-y-5 rounded-xl lg:space-y-8"
                >
                  <div className="max-w-xl lg:max-w-5xl">
                    <QuestionComponent question={q} />
                  </div>
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}

function QuestionComponent({ question }: { question: Question }) {
  switch (question.question_type) {
    case "slideshow":
      return <SlideShowQuestionComponent question={question} />;
    case "image-mcq":
      return <ImageMCQQuestionComponent question={question} />;
    default:
      return <div>❌ Unknown question type: {question.question_type}</div>;
  }
}
