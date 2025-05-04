import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BarChart3, BookOpen, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuizSummaryHeaderProps {
  quizTitle: string;
  quizDescription: string;
  scorePercentage: number;
  difficultyRating: number;
  lecturerAvatar: string;
  lecturerName: string;
}

export default function QuizSummaryHeader({
  quizTitle,
  quizDescription,
  difficultyRating,
  lecturerName,
  lecturerAvatar,
}: QuizSummaryHeaderProps) {
  const getDifficultyLabel = () => {
    if (difficultyRating >= 4) return "Hard";
    if (difficultyRating >= 2) return "Medium";
    return "Easy";
  };

  // Determine difficulty color
  const getDifficultyColor = () => {
    if (difficultyRating >= 4) return "bg-rose-500/10 text-rose-300";
    if (difficultyRating >= 2) return "bg-amber-500/10 text-amber-300";
    return "bg-emerald-500/10 text-emerald-300";
  };

  return (
    <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-white/10 p-2">
            <BookOpen className="h-5 w-5 text-indigo-300/90" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-300 hover:underline">
              {quizTitle}
            </h1>
            <p className="text-sm text-white/60">{quizDescription}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/10 p-2">
                <BarChart3 className="h-5 w-5 text-violet-300/90" />
              </div>
              <div>
                <p className="text-xs text-white/60">Difficulty</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 w-1.5 rounded-sm ${i < difficultyRating ? "bg-violet-400/80" : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                  <Badge
                    className={`${getDifficultyColor()} px-2 py-0.5 text-xs`}
                  >
                    {getDifficultyLabel()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-white/20">
                <AvatarImage
                  src={lecturerAvatar || "/placeholder.svg"}
                  alt={lecturerName}
                />
                <AvatarFallback>
                  <GraduationCap className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-white/60">Created By</p>
                <h3 className="text-base font-semibold">{lecturerName}</h3>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
