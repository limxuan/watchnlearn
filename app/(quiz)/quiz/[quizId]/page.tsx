import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader } from "@/components/ui/card";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CalendarIcon, Users } from "lucide-react";
import StartQuizButton from "@/components/quiz/StartQuizButton";
import QuizNotFound from "@/components/quiz/QuizNotFound";
import FlexCenter from "@/components/flex-center";

type Quiz = {
  quizId: string;
  lecturerId: string;
  name: string;
  description: string;
  joinCode?: string;
  quiz_cover_url: string;
  created_at: string;
  users: {
    username: string;
    pfp_url: string;
  };
};

export default async function QuizDetailsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const supabase = await createClient();
  const { data: q, error } = await supabase
    .from("quizzes")
    .select(
      `
    *,
    users (
      username,
      pfp_url
    )
  `,
    )
    .eq("quiz_id", quizId)
    .single();

  if (!q) return <QuizNotFound />;
  const quiz = q as Quiz;

  const { count: quizAttemptsCount, error: countError } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  if (countError) {
    console.log(countError);
  }

  console.log({ quiz, quizAttemptsCount });
  const formattedDate = new Date(quiz.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <FlexCenter>
      <div className="lg: container mb-0 max-w-4xl">
        <Card className="overflow-hidden">
          <div className="relative h-[150px] w-full lg:h-[300px]">
            <Image
              src={quiz.quiz_cover_url || "/placeholder.svg"}
              alt={quiz.name}
              fill
              className="object-cover"
            />
          </div>

          <CardHeader>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-8">
              <div>
                <h1 className="text-xl font-bold tracking-tight lg:text-3xl">
                  {quiz.name}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="lg:text-md text-sm">
                    Created on {formattedDate}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{quizAttemptsCount} attempts</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="lg:text-md text-sm text-muted-foreground">
              {quiz.description}
            </p>

            <Separator />

            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 lg:h-12 lg:w-12">
                <AvatarImage
                  src={quiz.users.pfp_url || "/placeholder.svg"}
                  alt={quiz.users.username}
                />
                <AvatarFallback>
                  {quiz.users.username
                    .split(" ")
                    .map((n: any) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="lg:text-md text-sm font-medium">Lecturer</p>
                <p className="text-xs text-muted-foreground lg:text-sm">
                  {quiz.users.username}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <StartQuizButton />
          </CardFooter>
        </Card>
      </div>
    </FlexCenter>
  );
}
