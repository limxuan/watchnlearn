import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Question, QuestionAttempt } from "@/stores/useQuizStore";
import { PieChart, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

// interface QuestionAttempt {
//   is_correct: boolean
//   question: {
//     question_type: string
//   }
// }

interface SummaryStatsProps {
  correctQuestions: number;
  totalQuestions: number;
  questionAttempts: QuestionAttempt[];
}

export const fetchQuestion = async (questionId: string): Promise<Question> => {
  const supabase = await createClient();
  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("question_id", questionId)
    .single();
  return question;
};

export default async function SummaryStats({
  correctQuestions,
  totalQuestions,
  questionAttempts,
}: SummaryStatsProps) {
  // Calculate percentage
  const percentage = Math.round((correctQuestions / totalQuestions) * 100);

  // Count by question type
  const questionTypeStats = questionAttempts.reduce(
    async (acc, attempt) => {
      const question = await fetchQuestion(attempt.question_id);
      const type = question.question_type;
      const res = await acc;
      if (!res[type]) {
        res[type] = { total: 0, correct: 0 };
      }
      res[type].total += 1;
      if (attempt.is_correct) {
        res[type].correct += 1;
      }
      return res;
    },
    {} as Promise<Record<string, { total: number; correct: number }>>,
  );

  // Format question type for display
  const formatQuestionType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="h-full border-white/10 bg-white/5 shadow-xl backdrop-blur-xl">
      <CardContent className="flex h-full flex-col p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-violet-300/90" />
          <h3 className="text-base font-semibold sm:text-lg">
            Performance Summary
          </h3>
        </div>

        {/* Overall stats */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2">
            <CheckCircle className="h-5 w-5 text-emerald-400/90" />
            <div>
              <span className="block text-xs text-white/60">Correct</span>
              <span className="font-bold">{correctQuestions}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2">
            <XCircle className="h-5 w-5 text-rose-400/90" />
            <div>
              <span className="block text-xs text-white/60">Incorrect</span>
              <span className="font-bold">
                {totalQuestions - correctQuestions}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-white/60">Overall Accuracy</span>
          <span className="font-medium">{percentage}%</span>
        </div>

        <Progress
          value={percentage}
          className="mb-6 h-2 bg-white/10"
          // indicatorClassName={`${percentage >= 80 ? "bg-emerald-400/80" : percentage >= 60 ? "bg-amber-400/80" : "bg-rose-400/80"}`}
        />

        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <HelpCircle className="h-4 w-4 text-sky-300/90" />
          Performance by Question Type
        </h4>

        <div className="flex-grow space-y-3 overflow-auto">
          {Object.entries(await questionTypeStats).map(([type, stats]) => (
            <div
              key={type}
              className="rounded-lg bg-gray-800/30 p-3 backdrop-blur-md"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {formatQuestionType(type)}
                </span>
                <span className="text-xs text-white/60">
                  {stats.correct}/{stats.total} (
                  {Math.round((stats.correct / stats.total) * 100)}%)
                </span>
              </div>
              <Progress
                value={Math.round((stats.correct / stats.total) * 100)}
                className="h-1.5 bg-white/10"
                // indicatorclassname="bg-sky-400/80"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
