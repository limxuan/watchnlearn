import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import QuizSummaryHeader from "@/components/quiz-summary/quiz-summary-header";
import QuestionsList from "@/components/quiz-summary/questions-list";
import SummaryStats from "@/components/quiz-summary/summary-stats";
import UserInfoCard from "@/components/quiz-summary/user-info-card";
import { UserInfo } from "@/stores/useUserStore";
import { QuestionAttempt, Quiz } from "@/stores/useQuizStore";

async function getQuiz(quizId: string): Promise<Quiz> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("*")
    .eq("quiz_id", quizId)
    .single();

  return data;
}

async function getUser(userId: string): Promise<UserInfo> {
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();
  return user;
}

async function getQuizCreator(quizId: string): Promise<UserInfo> {
  return await getUser((await getQuiz(quizId)).user_id);
}

type QuizAttempt = {
  attempt_id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  completed_at: string;
  correct_questions: number;
  total_questions: number;
  difficulty_rating: number;
};

async function getQuizAttempt(attemptId: string): Promise<{
  quizAttempt: QuizAttempt;
  questionAttempts: QuestionAttempt[];
} | null> {
  const supabase = await createClient();

  let { data: quizAttempt } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("attempt_id", attemptId)
    .single();

  console.log({ quizAttempt });

  if (!quizAttempt) {
    return null;
  }

  const { data: questionAttempts } = await supabase
    .from("question_attempts")
    .select("*")
    .eq("attempt_id", attemptId);

  return {
    quizAttempt: quizAttempt,
    questionAttempts: questionAttempts as QuestionAttempt[],
  };
}

export default async function QuizSummaryPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const data = await getQuizAttempt((await params).attemptId);

  if (!data) {
    notFound();
  }

  const { quizAttempt, questionAttempts } = data;
  const attemptUser = await getUser(quizAttempt.user_id);
  const creator = await getQuizCreator(quizAttempt.quiz_id);
  const quiz = await getQuiz(quizAttempt.quiz_id);

  const timeTaken =
    new Date(quizAttempt.completed_at).getTime() -
    new Date(quizAttempt.started_at).getTime();
  const minutes = Math.floor(timeTaken / 60000);
  const seconds = Math.floor((timeTaken % 60000) / 1000);

  const scorePercentage = Math.round(
    (quizAttempt.correct_questions / quizAttempt.total_questions) * 100,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Quiz details card */}
            <QuizSummaryHeader
              quizTitle={quiz.name}
              quizDescription={quiz.description}
              scorePercentage={scorePercentage}
              timeTaken={`${minutes}m ${seconds}s`}
              difficultyRating={quizAttempt.difficulty_rating}
              lecturerName={creator.username}
              lecturerAvatar={creator.pfp_url}
            />

            {/* User info card */}
            <UserInfoCard
              studentName={attemptUser.username}
              studentAvatar={attemptUser.pfp_url}
              scorePercentage={scorePercentage}
              correctQuestions={quizAttempt.correct_questions}
              totalQuestions={quizAttempt.total_questions}
            />
          </div>

          {/* Performance by question type card */}
          <div>
            <SummaryStats
              correctQuestions={quizAttempt.correct_questions}
              totalQuestions={quizAttempt.total_questions}
              questionAttempts={questionAttempts}
            />
          </div>
        </div>

        {/* Questions list */}
        <QuestionsList questionAttempts={questionAttempts} />
      </div>
    </div>
  );
}
