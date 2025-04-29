"use client";
import useQuizStore from "@/stores/useQuizStore";
import { Timer, BookOpen, ListOrdered } from "lucide-react";
import { useEffect, useState } from "react";

export default function QuestionLoaderHeader() {
  const { quiz, currentIndex, questions, startTimestamp, answers } =
    useQuizStore();
  const quizName = quiz?.name;
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTimestamp) return;

    const interval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp]);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleHeaderClick = () => {
    console.log({ answers });
  };

  return (
    <div className="w-full max-w-xl space-y-4 rounded-xl lg:max-w-5xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between lg:gap-4">
        <div
          className="hidden items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 shadow-md backdrop-blur-md md:flex"
          onClick={handleHeaderClick}
        >
          <BookOpen className="text-white lg:h-5 lg:w-5" />
          <span className="text-sm text-white lg:text-lg">{quizName}</span>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-white/20 bg-white/10 px-4 py-2 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Timer className="mb-1 text-white lg:h-5 lg:w-5" />
            <span className="text-sm font-medium text-white">
              {formattedTime}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden h-4 w-px bg-white/30 md:block" />

          {/* Question Counter */}
          <div className="flex items-center gap-2">
            <ListOrdered className="text-white lg:h-5 lg:w-5" />
            <span className="text-sm font-medium text-white">
              {currentIndex + 1}/{questions.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
