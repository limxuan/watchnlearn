"use client";
import useQuizStore from "@/stores/useQuizStore";
import { Timer, BookOpen, ListOrdered, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuestionLoaderHeader() {
  const { quiz, currentIndex, questions, startTimestamp, resetQuiz } =
    useQuizStore();
  const quizName = quiz?.name;
  const [elapsedTime, setElapsedTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!startTimestamp) return;

    const interval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp]);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  const handleExit = () => {
    const confirmExit = confirm("Are you sure you want to exit the quiz?");
    if (confirmExit) {
      router.push("/quiz");
      setTimeout(() => {
        resetQuiz();
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-4 rounded-xl lg:max-w-5xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between lg:gap-4">
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 shadow-md backdrop-blur-md md:flex">
            <BookOpen className="text-white lg:h-5 lg:w-5" />
            <span className="text-sm text-white lg:text-lg">{quizName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 p-3 shadow-md backdrop-blur-md">
          <div className="flex w-full flex-col items-center gap-2 md:gap-0">
            <div className="flex w-full flex-row justify-between">
              <div className="flex w-full items-center justify-start gap-2 rounded-lg md:hidden">
                <BookOpen className="text-white" />
                <span className="text-sm font-semibold text-white">
                  {quizName}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                <Timer className="mb-1 text-white lg:h-5 lg:w-5" />
                <span className="text-sm font-medium text-white">
                  {formattedTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ListOrdered className="text-white lg:h-5 lg:w-5" />
                <span className="text-sm font-medium text-white">
                  {currentIndex + 1}/{questions.length}
                </span>
              </div>

              <button
                onClick={handleExit}
                className="items-center gap-1 rounded-lg px-3 py-2 text-white shadow-md backdrop-blur-md transition hover:bg-white/20 md:flex"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden text-sm md:block">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
