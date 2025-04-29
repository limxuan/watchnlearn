"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [mostPlayed, setMostPlayed] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (quiz: any) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      const supabase = createClient();

      // Fetch All Public Quiz
      const quizzesRes = await supabase
        .from("quizzes")
        .select("*, users (username)")
        .eq("public_visibility", true);

      if (quizzesRes.error) {
        console.log(quizzesRes.error.message);
        return;
      }
      const quizzesData = quizzesRes.data || [];
      setQuizzes(quizzesData);

      // Fetch Most Played
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("quiz_id");

      if (error) {
        console.error("Error fetching quiz attempts:", error);
      } else {
        // Count attempts per quiz_id
        const attemptCount: Record<number, number> = {};

        console.log({ data });

        data.forEach((attempt) => {
          attemptCount[attempt.quiz_id] =
            (attemptCount[attempt.quiz_id] || 0) + 1;
        });

        // Sort quiz_ids by number of attempts (descending) and limit to top 5
        const mostPlayed = Object.entries(attemptCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([quiz_id, count]) => ({
            quiz_id: quiz_id,
            attempt_count: count,
          }));

        const mostPlayedDetails = await Promise.all(
          mostPlayed.map(async ({ quiz_id }) => {
            const { data, error } = await supabase
              .from("quizzes")
              .select("*")
              .eq("quiz_id", quiz_id)
              .single();
            return data;
          }),
        );

        if (error) {
          console.log(error);
          return;
        }
        setMostPlayed(mostPlayedDetails);
      }

      // Fetch Recent Quiz
      const recentQuizzesRes = await supabase
        .from("quizzes")
        .select("*, users (username)")
        .eq("public_visibility", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentQuizzesRes.error) {
        console.log(recentQuizzesRes.error.message);
        return;
      }
      const recentQuizzesData = recentQuizzesRes.data || [];
      setRecent(recentQuizzesData);

      setLoading(false);
    };

    fetchQuizzes();
  }, []);

  const renderSkeletonCards = (count = 3) =>
    Array.from({ length: count }).map((_, index) => (
      <div key={index} className="space-y-3 rounded-lg bg-[#5691a4] p-6 shadow">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    ));

  return (
    <main className="min-h-screen bg-[#205781]">
      <nav className="px-4 py-8 text-foreground">
        <div className="mx-auto max-w-5xl">
          {/* All Quizzes */}
          <h1
            className="mb-6 text-center text-3xl font-bold text-[#f6f8d5]"
            onClick={() => console.log({ quizzes })}
          >
            Popular Quizzes
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            {loading
              ? renderSkeletonCards(3)
              : quizzes.map((quiz, id) => (
                  <button key={id} onClick={() => handleOpenModal(quiz)}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-[350px] flex-col rounded-lg bg-[#5691a4] p-6 text-center text-white shadow transition hover:bg-gray-700 hover:shadow-lg"
                    >
                      {quiz.quiz_cover_url && (
                        <img
                          src={quiz.quiz_cover_url}
                          alt={quiz.description}
                          className="mb-2 flex h-40 w-full flex-col rounded-lg object-cover"
                        />
                      )}
                      <br />
                      <h5 className="mb-2 text-xl font-semibold">
                        {quiz.name}
                      </h5>
                    </motion.div>
                  </button>
                ))}
          </motion.div>

          {/* Recently Quizzes */}
          <h1 className="mb-6 mt-12 text-center text-3xl font-bold text-[#f6f8d5]">
            Recently Created
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            {loading
              ? renderSkeletonCards(3)
              : recent.map((quiz, id) => (
                  <button key={id} onClick={() => handleOpenModal(quiz)}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-[350px] flex-col rounded-lg bg-[#5691a4] p-6 text-center text-white shadow transition hover:bg-gray-700 hover:shadow-lg"
                    >
                      {quiz.quiz_cover_url && (
                        <img
                          src={quiz.quiz_cover_url}
                          alt={quiz.description}
                          className="mb-2 flex h-40 w-full flex-col rounded-lg object-cover"
                        />
                      )}
                      <br />
                      <h5 className="mb-2 text-xl font-semibold">
                        {quiz.name}
                      </h5>
                    </motion.div>
                  </button>
                ))}
          </motion.div>

          {/* Most Played Quizzes */}
          <h1
            className="mb-6 mt-12 text-center text-3xl font-bold text-[#f6f8d5]"
            onClick={() => console.log({ mostPlayed })}
          >
            Most Played Quizzes
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            {loading
              ? renderSkeletonCards(3)
              : mostPlayed.map((quiz, id) => {
                  return (
                    <button key={id} onClick={() => handleOpenModal(quiz)}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex h-[350px] flex-col rounded-lg bg-[#5691a4] p-6 text-center text-white shadow transition hover:bg-gray-700 hover:shadow-lg"
                      >
                        {quiz.quiz_cover_url && (
                          <img
                            src={quiz.quiz_cover_url}
                            alt={quiz.description}
                            className="mb-2 flex h-40 w-full flex-col rounded-lg object-cover"
                          />
                        )}
                        <br />
                        <h5 className="mb-2 text-xl font-semibold">
                          {quiz.name}
                        </h5>
                      </motion.div>
                    </button>
                  );
                })}
          </motion.div>
        </div>
      </nav>
      {isModalOpen && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur">
          <div className="relative h-[600px] w-[1000px] overflow-y-scroll rounded-lg bg-[#6a92b2] p-6 shadow-lg">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-2 text-[30px] font-bold text-[#f6f8d5] hover:text-black"
            >
              &times;
            </button>
            <h2 className="mb-2 text-[30px] font-bold text-[#f6f8d5]">
              {selectedQuiz.name}
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Created by: {selectedQuiz.users?.username}
            </p>
            {selectedQuiz.quiz_cover_url && (
              <div className="flex justify-center">
                <div className="incline-block overflow-hidden rounded-md border-4 border-[#f6f8d5]">
                  <img
                    src={selectedQuiz.quiz_cover_url}
                    alt={selectedQuiz.description}
                    className="max-h-[200px] max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            <p className="mt-4 text-gray-700">
              <span className="font-semibold text-[#f6f8d5]">Description:</span>
            </p>
            <p className="text-grey-600 text-[20px]">
              {selectedQuiz.description}
            </p>
            <br />

            <div className="mt-4 text-center">
              <Button
                asChild
                size="lg"
                variant={"default"}
                className="hover:bg-black hover:text-[#f6f8d5]"
              >
                <Link href={`/quiz/${selectedQuiz.quiz_id}`}>Enter Quiz</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
