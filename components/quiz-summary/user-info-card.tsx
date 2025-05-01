import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Sparkles, Trophy, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UserInfoCardProps {
  studentName: string;
  studentAvatar: string;
  scorePercentage: number;
  correctQuestions: number;
  totalQuestions: number;
  timeTaken: string;
  timeInMs: number;
}

export default function UserInfoCard({
  studentName,
  studentAvatar,
  scorePercentage,
  correctQuestions,
  totalQuestions,
  timeTaken,
  timeInMs,
}: UserInfoCardProps) {
  // Determine score color based on percentage
  const getScoreColor = () => {
    if (scorePercentage >= 80) return "text-emerald-400";
    if (scorePercentage >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-white/20">
              <AvatarImage
                src={studentAvatar || "/placeholder.svg"}
                alt={studentName}
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-white/60">Student</p>
              <h3 className="text-base font-semibold">{studentName}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-300/80" />
            <p className={`text-lg font-bold ${getScoreColor()}`}>
              {scorePercentage}%
            </p>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-white/60">Score</span>
          <span className="text-sm">
            {correctQuestions}/{totalQuestions} questions
          </span>
        </div>

        <Progress
          value={scorePercentage}
          className="mb-4 h-1.5 bg-white/10"
          // indicatorclassname={`${scorePercentage >= 80 ? "bg-emerald-400/80" : scorePercentage >= 60 ? "bg-amber-400/80" : "bg-rose-400/80"}`}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="mb-2 flex items-center gap-3 sm:mb-0">
            <div className="rounded-full bg-white/10 p-2">
              <Clock className="h-5 w-5 text-sky-300/90" />
            </div>
            <div>
              <p className="text-xs text-white/60">Time Taken</p>
              <p className="text-base font-bold">{timeTaken}</p>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-3 sm:mb-0">
            <div className="rounded-full bg-white/10 p-2">
              <Sparkles className="h-5 w-5 text-amber-400/90" />
            </div>
            <div>
              <p className="text-xs text-white/60">XP Earned</p>
              <p className="text-base font-bold">
                {correctQuestions * 10 +
                  (correctQuestions > 0
                    ? Math.max(
                        0,
                        Math.floor((240 - Math.floor(timeInMs / 1000)) / 5),
                      )
                    : 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
