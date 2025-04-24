import QuestionLoader from "@/components/question/slideshow/QuestionLoader";
import { Question } from "@/stores/useQuizStore";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Attempt({
  params,
}: {
  params: { quizId: string };
}) {
  const supabase = await createClient();
  const { quizId } = await params;
  const { data: quizData, error: quizFetchError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("quiz_id", quizId)
    .single();
  if (!quizData) return redirect("/quiz");
  if (quizFetchError) console.log(quizFetchError);

  const { data: questionsData, error: questionFetchError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId);

  if (!questionsData) return redirect("/quiz?message=no-questions");
  if (questionFetchError) console.log(questionFetchError);

  const questions: Question[] = await Promise.all(
    questionsData.map(async (q) => {
      const { data: questionOptionData, error } = await supabase
        .from("question_options")
        .select("*")
        .eq("question_id", q.question_id);

      if (error) {
        console.error(
          "Error fetching options for question:",
          q.question_id,
          error,
        );
      }

      return {
        ...q,
        question_options: questionOptionData ?? [],
      };
    }),
  );

  console.log({ questions });
  return <QuestionLoader questionsData={questions} />;
}
