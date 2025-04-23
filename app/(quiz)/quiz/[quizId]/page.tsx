"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import useUserStore from "@/stores/useUserStore";

type Quiz = {
  quizId: string;
  lecturerId: string;
  name: string;
  description: string;
  joinCode?: string;
  quizCoverUrl: string;
  lastUpdatedAt: string;
  createdAt: string;
};

function QuizNotFound() {
  const router = useRouter();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-md p-8 shadow-md">
      <h1 className="text-xl font-bold">Quiz not found!!</h1>
      <Button
        variant="secondary"
        className="hover:border-3 flex items-center gap-2 transition-all duration-200 ease-in-out hover:gap-5"
        onClick={() => router.push("/")}
      >
        Return to home <ArrowRightIcon />
      </Button>
    </div>
  );
}

export default function QuizPage() {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quiz/${quizId}`);
        if (!res.ok) throw new Error("Quiz not found");

        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  if (loading) return <Spinner />;

  return (
    <main className="flex h-full w-full items-center justify-center bg-blue-600 p-4">
      {quiz ? (
        <div className="">
          <h1 className="text-2xl font-bold">Quiz: {quiz.name}</h1>
          {/* <pre className="mt-4">{JSON.stringify(quiz, null, 2)}</pre> */}
        </div>
      ) : (
        <QuizNotFound />
      )}
    </main>
  );
}
