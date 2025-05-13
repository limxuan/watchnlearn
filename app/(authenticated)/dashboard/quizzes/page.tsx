// app/dashboard/quizzes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

interface Quiz {
  quiz_id: string;
  name: string;
  description: string;
  public_visibility: boolean;
  quiz_cover_url: string | null;
}

export default function QuizDashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);

      const {data : { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("Error getting session:", sessionError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select("quiz_id, name, description, public_visibility, quiz_cover_url")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching quizzes:", error.message);
      } else {
        setQuizzes(data || []);
      }

      setLoading(false);
    };

    fetchQuizzes();
  }, []);

  const handleView = (quizId: string) => {
    router.push(`/quiz/${quizId}/questions`);
  };

  const handleCreate = () => {
    router.push("/dashboard/quizzes/create");
  };

  return (
    <div className="min-h-screen bg-[#98d2c0] p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#205781]">My Quizzes</h1>
        <Button
          className="border-2 border-[#205781] bg-[#205781] text-[#f6f8d5] hover:bg-[#98D2C0]"
          onClick={handleCreate}
        >
          + Create New Quiz
        </Button>
      </div>

      {loading ? (
        <p className="text-[#205781]">Loading quizzes...</p>
      ) : quizzes.length === 0 ? (
        <p className="text-[#205781]">
          No quizzes found. Start by creating one!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.quiz_id} className="border-[3px] border-[#205781]">
              <CardContent className="rounded-lg bg-[#98D2C0]/80 p-6 shadow-lg backdrop-blur-md">
                {quiz.quiz_cover_url && (
                  <img
                    src={quiz.quiz_cover_url}
                    alt={`${quiz.name} cover`}
                    className="mb-4 h-40 w-full rounded-lg border-[3px] border-[#205781] object-cover"
                  />
                )}
                <h2 className="text-xl font-bold text-[#205781]">
                  {quiz.name}
                </h2>
                <p className="mb-2 text-[#205781]">{quiz.description}</p>
                <Button
                  onClick={() => handleView(quiz.quiz_id)}
                  className="mt-2 border-2 border-[#205781] bg-[#205781] text-[#f6f8d5] hover:bg-[#98d2c0] hover:text-white"
                >
                  View Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
