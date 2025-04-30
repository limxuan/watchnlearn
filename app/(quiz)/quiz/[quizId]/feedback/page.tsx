"use client";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/background/aurora-background";
import { cn, isSameDay } from "@/lib/utils";
import { Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import useUserStore from "@/stores/useUserStore";
import useQuizStore from "@/stores/useQuizStore";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { incrementXp } from "@/lib/supabaseClient";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useUserStore();
  const { startTimestamp, completedTimestamp, answers, quiz, resetQuiz } =
    useQuizStore();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (completedTimestamp == 0) {
      router.push("/quiz");
    }
  }, []);

  const SaveQuestionAttempt = async (): Promise<string> => {
    // saving quiz attempt
    const { data: attemptData } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quiz!.quiz_id,
        user_id: user?.user_id,
        started_at: new Date(startTimestamp),
        completed_at: new Date(completedTimestamp),
        correct_questions: answers.filter((a) => a.isCorrect).length,
        total_questions: answers.length,
        difficulty_rating: rating,
      })
      .select()
      .single();

    // saving question attempt
    answers.forEach((opt) => {
      supabase
        .from("question_attempts")
        .insert({
          attempt_id: attemptData!.attempt_id,
          question_id: opt.questionId,
          selected_option_id: opt.selectedOption || null,
          correct_option_id: opt.correctOption || null,
          is_correct: opt.isCorrect,
          mistake_count: opt.mistakeCount === null ? null : opt.mistakeCount,
        })
        .then(({ error }) => {
          console.log({ error });
        });
    });

    // saving user streak
    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user?.user_id)
      .single();

    if (!streakData) {
      await supabase
        .from("user_streaks")
        .insert({
          user_id: user?.user_id,
          current_streak: 1,
          longest_streak: 1,
          streak_updated_at: new Date(completedTimestamp),
        })
        .then(({ error }) => {
          console.log({ error });
        });
    } else {
      const today = new Date();
      const completedDate = new Date(completedTimestamp);

      if (!isSameDay(today, completedDate)) {
        await supabase
          .from("user_streaks")
          .update({
            current_streak: streakData.current_streak + 1,
            longest_streak:
              streakData.current_streak + 1 > streakData.longest_streak
                ? streakData.current_streak + 1
                : streakData.longest_streak,
            streak_updated_at: new Date(completedTimestamp),
          })
          .eq("user_id", user?.user_id)
          .then(({ error }) => {
            console.log({ error });
          });
      }
    }

    // saving user xp
    const totalXpToIncrement = answers.filter((a) => a.isCorrect).length * 10;
    incrementXp(user!.user_id, totalXpToIncrement);
    return attemptData.attempt_id;
  };

  const handleSubmit = () => {
    if (rating > 0) {
      setSubmitted(true);
      resetQuiz();
      SaveQuestionAttempt().then((attemptId) =>
        router.push(`/attempt-summary/${attemptId}`),
      );
    }
  };

  return (
    <AuroraBackground>
      <div className="max-w-[80%] rounded-2xl border border-white/20 bg-gray-500/10 p-8 text-center shadow-lg backdrop-blur-lg transition-all lg:max-w-3xl">
        {submitted ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white lg:text-2xl">
              Thank you! 🌟
            </h2>
            <p className="text-white/70">Redirecting you to your results</p>
            <Spinner className="text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-xl font-bold text-white lg:text-2xl">
              Difficulty rating?
            </h2>
            <p className="text-sm text-white/50">
              You will see your results after you submit a rating!
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  className={cn(
                    "cursor-pointer transition-colors",
                    (hoverRating || rating) >= star
                      ? "text-yellow-400"
                      : "text-white/30",
                  )}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  fill={
                    (hoverRating || rating) >= star ? "currentColor" : "none"
                  }
                />
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className={cn(
                "w-full rounded-lg px-4 py-2 font-semibold backdrop-blur-lg transition-colors",
                rating === 0
                  ? "cursor-not-allowed bg-gray-400/20 text-white/50"
                  : "bg-green-500/80 text-white shadow-md hover:bg-green-400",
              )}
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}
