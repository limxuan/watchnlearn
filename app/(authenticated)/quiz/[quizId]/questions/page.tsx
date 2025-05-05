"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function QuizQuestionsClient({ params }: any) {
  const { quizId } = use<{ quizId: string }>(params);
  const [quizData, setQuizData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId) return;
      setLoading(true);

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("quiz_id", quizId)
        .single();

      if (quizError) {
        console.error("Quiz fetch error:", quizError);
      } else {
        setQuizData(quiz);
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("is_active", true);

      if (questionsError) {
        console.error("Questions fetch error:", questionsError);
      } else {
        setQuestions(questionsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [quizId]);

  const handleSoftDelete = async (questionId: string) => {
    const { error } = await supabase
      .from("questions")
      .update({ is_active: false })
      .eq("question_id", questionId);

    if (error) {
      console.error("Soft delete error:", error);
      alert("Error deleting question.");
    } else {
      setQuestions((prev) => prev.filter((q) => q.question_id !== questionId));
    }
  };

  const typeOptions = [
    { label: "Slideshow", path: "slideshow" },
    { label: "Image Hotspot", path: "imghotspot" },
    { label: "Picture Matching", path: "pic2pic" },
    { label: "Video Question", path: "vidqn" },
    { label: "Image MCQ", path: "whichofimg" },
    { label: "Drag-and-Drop", path: "dragndrop" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-center text-3xl font-bold text-[#205781]">
        Questions for {quizData?.name}
      </h1>

      <div>
        <h2 className="mb-4 text-xl font-bold text-[#205781]">
          Active Questions
        </h2>
        {questions.length === 0 ? (
          <p className="text-[#205781]">No questions added yet.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((question) => (
              <li
                key={question.question_id}
                className="flex items-center justify-between border-b pb-2"
              >
                <span>{question.question_text || "[Untitled Question]"}</span>
                <Button
                  variant="destructive"
                  onClick={() => handleSoftDelete(question.question_id)}
                  className="border-[3px] border-[#205781] bg-[#F29898] text-[#205781]"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Button
          onClick={() => setShowTypeSelector(!showTypeSelector)}
          className="border-[3px] border-[#205781] bg-[#98D2C0] text-[#205781] hover:bg-[#205781] hover:text-[#f6f8d5]"
        >
          + Add Question
        </Button>

        <Button
          onClick={() => router.push("/dashboard/quizzes")}
          className="border-[3px] border-[#205781] bg-[#98D2C0] text-[#205781] hover:bg-[#205781] hover:text-[#f6f8d5]"
        >
          ← Back
        </Button>
      </div>

      {showTypeSelector && (
        <div className="mt-4 rounded-lg border-[3px] border-[#205781] bg-[#f6f8d5] p-4 shadow">
          <h3 className="mb-2 text-lg font-semibold text-[#205781]">
            Select Question Type:
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {typeOptions.map(({ label, path }) => (
              <Button
                key={path}
                onClick={() => router.push(`/quiz/${quizId}/questions/${path}`)}
                className="border border-[#205781] bg-[#F5F5F5] text-[#205781] hover:bg-[#E0F2F1]"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
