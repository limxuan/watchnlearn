import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
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
  quizCoverUrl: string;
  lastUpdatedAt: string;
  createdAt: string;
};

export default async function QuizDetailsPage({
  params,
}: {
  params: { quizId: string };
}) {
  return <h1>{params.quizId}</h1>;
}
