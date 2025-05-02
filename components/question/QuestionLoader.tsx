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
import LabelHotspotQuestionComponent from "./label-to-hotspot/LabelToHotspotQuestion";
import { AuroraBackground } from "../background/aurora-background";

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
    if (endTimestamp) {
      router.push(`/quiz/${quizData.quiz_id}/feedback`);
    }
  }, [endTimestamp, router]);

  return (
    <AuroraBackground>
      <div className="max-h-dvh w-full max-w-3xl space-y-5 rounded-xl p-4 px-4 lg:space-y-8">
        <QuestionLoaderHeader />

        {questions.map((q, index) => (
          <div
            className={`w-full space-y-5 rounded-xl lg:space-y-8 ${index == currentIndex ? "block" : "hidden"}`}
            key={q.question_id}
          >
            <div className="max-w-xl lg:max-w-5xl">
              <QuestionComponent question={q} />
            </div>
          </div>
        ))}
      </div>
    </AuroraBackground>
  );
}

function QuestionComponent({ question }: { question: Question }) {
  console.log("loading: ", question);
  switch (question.question_type) {
    case "slideshow":
      return (
        <SlideShowQuestionComponent
          question={question}
          key={question.question_id}
        />
      );
    case "image-mcq":
      return (
        <ImageMCQQuestionComponent
          question={question}
          key={question.question_id}
        />
      );
    case "video":
      return (
        <VideoQuestionComponent
          question={question}
          key={question.question_id}
        />
      );
    case "picture-to-picture":
      return (
        <PictureToPictureQuestionComponent
          question={question}
          key={question.question_id}
        />
      );
    case "label-to-hotspot":
      return (
        <LabelHotspotQuestionComponent
          question={question}
          key={question.question_id}
        />
      );
    case "hotspot-mcq":
      return (
        <HotspotMCQQuestionComponent
          question={question}
          key={question.question_id}
        />
      );
    default:
      return <div>❌ Unknown question type: {question.question_type}</div>;
  }
}
