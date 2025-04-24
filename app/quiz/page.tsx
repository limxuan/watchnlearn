import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function QuizPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("quizzes").select("quiz_id");
  console.log(data);
  return (
    <div className="space-y-2">
      {data?.map((quiz) => (
        <Link key={quiz.quiz_id} href={`/quiz/${quiz.quiz_id}`}>
          <div className="text-blue-600 hover:underline">
            Quiz {quiz.quiz_id}
          </div>
        </Link>
      ))}
    </div>
  );
}
