"use client";
import useQuizStore, { Question, Quiz } from "@/stores/useQuizStore";
import { useEffect, useState } from "react";
import SlideShowQuestionComponent from "./slideshow/SlideShowQuestion";
import QuestionLoaderHeader from "./QuestionLoaderHeader";
import ImageMCQQuestionComponent from "@/components/question/image-mcq/ImageMCQQuestion";
import { AnimatePresence, motion } from "framer-motion";
import VideoQuestionComponent from "./video/VideoQuestion";
import HotspotMCQQuestionComponent from "@/components/question/hostpot-mcq/HotspotMCQQuestion";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import PictureToPictureQuestionComponent from "./picture-to-picture/PictureToPictureQuestion";
import ImageHotspotQuestionComponent from "./image-to-hotspot/ImageToHotspotQuestion";

export default function QuestionLoader({
  questionsData,
  quizData,
}: {
  questionsData: Question[];
  quizData: Quiz;
}) {
  const {
    setQuiz,
    loadQuestions,
    questions,
    currentIndex,
    setStartTimestamp,
    completedTimestamp: endTimestamp,
  } = useQuizStore();
  const router = useRouter();
  const supabase = createClient();

  // Track direction for animation
  const [direction, setDirection] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);

  useEffect(() => {
    if (questions.length === 0) {
      setQuiz(quizData);
      setStartTimestamp(Date.now());

      Promise.all(
        questionsData.map((question) => {
          if (question.question_type !== "picture-to-picture") return question;
          return supabase
            .from("question_matches")
            .select("source_option_id, target_option_id")
            .eq("question_id", question.question_id)
            .then(({ data }) => {
              return {
                ...question,
                matches: data!.map(({ source_option_id, target_option_id }) => [
                  source_option_id,
                  target_option_id,
                ]),
              };
            });
        }),
      ).then((q) => {
        loadQuestions(q as Question[]);
      });
    }
    console.log("client", questionsData, quizData);
  }, [
    loadQuestions,
    questionsData,
    quizData,
    setQuiz,
    setStartTimestamp,
    questions,
  ]);

  useEffect(() => {
    setDirection(currentIndex > prevIndex ? 1 : -1);
    setPrevIndex(currentIndex);
  }, [currentIndex, prevIndex]);

  useEffect(() => {
    if (endTimestamp) {
      router.push(`/quiz/${quizData.quiz_id}/feedback`);
    }
  }, [endTimestamp, router]);

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-h-dvh w-full max-w-3xl space-y-5 rounded-xl p-4 px-4 lg:space-y-8">
        <QuestionLoaderHeader />

        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {questions.toReversed().map(
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
    </div>
  );
}

function QuestionComponent({ question }: { question: Question }) {
  switch (question.question_type) {
    case "slideshow":
      return <SlideShowQuestionComponent question={question} />;
    case "image-mcq":
      return <ImageMCQQuestionComponent question={question} />;
    case "video":
      return <VideoQuestionComponent question={question} />;
    case "picture-to-picture":
      return <PictureToPictureQuestionComponent question={question} />;
    case "label-to-hotspot":
      return <ImageHotspotQuestionComponent question={question} />;
    case "hotspot-mcq":
      return <HotspotMCQQuestionComponent question={question} />;
    default:
      return <div>❌ Unknown question type: {question.question_type}</div>;
  }
}
