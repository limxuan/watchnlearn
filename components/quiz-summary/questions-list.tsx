"use client";

import { JSX, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  ImageIcon,
  Video,
  Layers,
  Target,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Question,
  QuestionAttempt,
  QuestionOption,
  QuestionTypes,
} from "@/stores/useQuizStore";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

interface QuestionsListProps {
  questionAttempts: QuestionAttempt[];
}

function fetchQuestion(questionId: string) {
  const supabase = createClient();
  return supabase
    .from("questions")
    .select("*")
    .eq("question_id", questionId)
    .single();
}

async function fetchQuestionOption(optionId: string): Promise<QuestionOption> {
  const supabase = createClient();
  const { data } = await supabase
    .from("question_options")
    .select("*")
    .eq("option_id", optionId)
    .single();

  return data;
}

export default function QuestionsList({
  questionAttempts,
}: QuestionsListProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});

  // Toggle question expansion
  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get icon for question type
  const getQuestionTypeIcon = (type: QuestionTypes) => {
    switch (type) {
      case "slideshow":
        return <SlidersHorizontal className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "picture-to-picture":
        return <Layers className="h-4 w-4" />;
      case "label-to-hotspot":
        return <Target className="h-4 w-4" />;
      case "image-mcq":
      case "hotspot-mcq":
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  // Get color for question type badge
  const getQuestionTypeColor = (type: QuestionTypes) => {
    switch (type) {
      case "slideshow":
        return "bg-amber-500/10 text-amber-300";
      case "video":
        return "bg-rose-500/10 text-rose-300";
      case "picture-to-picture":
        return "bg-sky-500/10 text-sky-300";
      case "label-to-hotspot":
        return "bg-emerald-500/10 text-emerald-300";
      case "image-mcq":
        return "bg-violet-500/10 text-violet-300";
      case "hotspot-mcq":
        return "bg-teal-500/10 text-teal-300";
      default:
        return "bg-gray-500/10 text-gray-300";
    }
  };

  // Format question type for display
  const formatQuestionType = (type: QuestionTypes) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter questions by correct/incorrect
  const correctQuestions = questionAttempts.filter((q) => q.is_correct);
  const incorrectQuestions = questionAttempts.filter((q) => !q.is_correct);

  return (
    <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur-xl">
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold sm:mb-6 sm:text-xl">
          Question Breakdown
        </h2>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 rounded-lg bg-white/10 p-1 sm:mb-6">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white/20"
            >
              All Questions
            </TabsTrigger>
            <TabsTrigger
              value="correct"
              className="data-[state=active]:bg-white/20"
            >
              Correct ({correctQuestions.length})
            </TabsTrigger>
            <TabsTrigger
              value="incorrect"
              className="data-[state=active]:bg-white/20"
            >
              Incorrect ({incorrectQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 sm:space-y-4">
            {questionAttempts.map((attempt) => (
              <QuestionCard
                key={attempt.question_attempt_id}
                attempt={attempt}
                isExpanded={!!expandedQuestions[attempt.question_attempt_id]}
                onToggle={() => toggleQuestion(attempt.question_attempt_id)}
                getQuestionTypeIcon={getQuestionTypeIcon}
                getQuestionTypeColor={getQuestionTypeColor}
                formatQuestionType={formatQuestionType}
              />
            ))}
          </TabsContent>

          <TabsContent value="correct" className="space-y-3 sm:space-y-4">
            {correctQuestions.map((attempt) => (
              <QuestionCard
                key={attempt.question_attempt_id}
                attempt={attempt}
                isExpanded={!!expandedQuestions[attempt.question_attempt_id]}
                onToggle={() => toggleQuestion(attempt.question_attempt_id)}
                getQuestionTypeIcon={getQuestionTypeIcon}
                getQuestionTypeColor={getQuestionTypeColor}
                formatQuestionType={formatQuestionType}
              />
            ))}
          </TabsContent>

          <TabsContent value="incorrect" className="space-y-3 sm:space-y-4">
            {incorrectQuestions.map((attempt) => (
              <QuestionCard
                key={attempt.question_attempt_id}
                attempt={attempt}
                isExpanded={!!expandedQuestions[attempt.question_attempt_id]}
                onToggle={() => toggleQuestion(attempt.question_attempt_id)}
                getQuestionTypeIcon={getQuestionTypeIcon}
                getQuestionTypeColor={getQuestionTypeColor}
                formatQuestionType={formatQuestionType}
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface QuestionCardProps {
  attempt: QuestionAttempt;
  isExpanded: boolean;
  onToggle: () => void;
  getQuestionTypeIcon: (type: QuestionTypes) => JSX.Element;
  getQuestionTypeColor: (type: QuestionTypes) => string;
  formatQuestionType: (type: QuestionTypes) => string;
}

function QuestionCard({
  attempt,
  isExpanded,
  onToggle,
  getQuestionTypeIcon,
  getQuestionTypeColor,
  formatQuestionType,
}: QuestionCardProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(
    null,
  );
  const [correctOption, setCorrectOption] = useState<QuestionOption | null>(
    null,
  );
  useEffect(() => {
    console.log({ attempt });
    fetchQuestion(attempt.question_id).then((q) => {
      setQuestion(q.data);
    });
    fetchQuestionOption(attempt.selected_option_id).then(setSelectedOption);
    fetchQuestionOption(attempt.correct_option_id).then(setCorrectOption);
  }, []);
  return (
    <>
      {question && (
        <div
          className={cn(
            "overflow-hidden rounded-lg transition-all duration-200",
            "border border-white/10 bg-white/5 backdrop-blur-md",
            isExpanded ? "shadow-lg" : "shadow",
          )}
        >
          <div
            className="flex cursor-pointer items-center justify-between p-3 sm:p-4"
            onClick={onToggle}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {attempt.is_correct ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400/90 sm:h-5 sm:w-5" />
              ) : (
                <XCircle className="h-4 w-4 flex-shrink-0 text-rose-400/90 sm:h-5 sm:w-5" />
              )}
              <div>
                <p className="line-clamp-1 text-sm font-medium sm:text-base">
                  {question.question_text}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    className={`${getQuestionTypeColor(question.question_type)} flex items-center gap-1 px-2 py-0.5 text-xs`}
                  >
                    {getQuestionTypeIcon(question.question_type)}
                    <span className="hidden text-xs sm:inline">
                      {formatQuestionType(question.question_type)}
                    </span>
                    <span className="text-xs sm:hidden">
                      {formatQuestionType(question.question_type).substring(
                        0,
                        3,
                      )}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-white/60 sm:h-5 sm:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white/60 sm:h-5 sm:w-5" />
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="border-t border-white/10 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-white/60 sm:text-sm">Question:</p>
                  <p className="mt-1 text-sm sm:text-base">
                    {question.question_text}
                  </p>
                </div>

                {attempt.selected_option_id && (
                  <>
                    {selectedOption?.option_text && (
                      <div>
                        <p className="text-xs text-white/60 sm:text-sm">
                          Selected Option:
                        </p>
                        <p className="mt-1 text-sm sm:text-base">
                          {selectedOption?.option_text}
                        </p>
                      </div>
                    )}

                    {selectedOption?.option_url && (
                      <div>
                        <p className="text-xs text-white/60 sm:text-sm">
                          Selected Image:
                        </p>
                        <p className="mt-1 text-sm sm:text-base">
                          <Image
                            src={selectedOption.option_url}
                            alt=""
                            width={500}
                            height={200}
                          />
                        </p>
                      </div>
                    )}
                  </>
                )}

                {correctOption?.option_url && !attempt.is_correct && (
                  <div>
                    <p className="text-xs text-white/60 sm:text-sm">
                      Selected Image:
                    </p>
                    <p className="mt-1 text-sm sm:text-base">
                      <Image
                        src={correctOption.option_url}
                        alt=""
                        width={500}
                        height={200}
                      />
                    </p>
                  </div>
                )}

                {attempt.correct_option_id && !attempt.is_correct && (
                  <div>
                    <p className="text-xs text-white/60 sm:text-sm">
                      Correct Option:
                    </p>
                    <p className="mt-1 text-sm sm:text-base">
                      {correctOption?.option_text}
                    </p>
                  </div>
                )}

                {attempt.mistake_count && (
                  <div>
                    <p className="text-xs text-white/60 sm:text-sm">
                      Mistakes Made
                    </p>
                    <p className="mt-1 text-sm sm:text-base">
                      {attempt?.mistake_count}
                    </p>
                  </div>
                )}

                {question.image_urls && (
                  <div className="mt-2 overflow-hidden rounded-md bg-black/20 p-1">
                    <p className="mb-2 px-1 text-xs text-white/60 sm:text-sm">
                      Question Image:
                    </p>
                    <img
                      src={question.image_urls?.[0] || "/placeholder.svg"}
                      alt={question.question_text}
                      className="h-auto w-full rounded object-cover"
                    />
                  </div>
                )}

                {question.question_type === "picture-to-picture" && (
                  <div className="rounded-md bg-white/5 p-2 backdrop-blur-md sm:p-3">
                    <p className="mb-1 text-xs text-white/60 sm:mb-2 sm:text-sm">
                      Note:
                    </p>
                    <p className="text-xs sm:text-sm">
                      This question type requires matching all items correctly
                      before proceeding.
                    </p>
                  </div>
                )}

                <div
                  className={`rounded-md p-2 sm:p-3 ${attempt.is_correct ? "bg-emerald-500/10" : "bg-rose-500/10"}`}
                >
                  <p className="text-xs text-white/60 sm:text-sm">Result:</p>
                  <p className="mt-1 text-sm font-medium sm:text-base">
                    {attempt.is_correct ? (
                      <span className="text-emerald-400">Correct</span>
                    ) : (
                      <span className="text-rose-400">Incorrect</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
