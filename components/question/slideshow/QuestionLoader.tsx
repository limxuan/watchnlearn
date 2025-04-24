"use client";
import useQuizStore, { Question } from "@/stores/useQuizStore";
import { useEffect } from "react";

export default function QuestionLoader({
  questionsData,
}: {
  questionsData: Question[];
}) {
  const { loadQuestions, questions } = useQuizStore();

  useEffect(() => {
    loadQuestions(questionsData);
    console.log("client", questionsData);
  }, [loadQuestions, questionsData]);

  return <h1>{questions?.map((q) => q.question_text)}</h1>;
}
