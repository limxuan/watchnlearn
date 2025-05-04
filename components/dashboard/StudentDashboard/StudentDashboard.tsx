"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; //database
import uploadProfilePicture from "@/utils/uploadProfilePicture";

import styles from "./Dashboard.module.css";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartTooltip } from "@/components/ui/chart";

import { GitCommitVertical, LogOut } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useUserStore from "@/stores/useUserStore";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StudentDashboard = () => {
  const supabase = createClient(); //database
  const { user, clearUser } = useUserStore();
  const userId = user?.user_id;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  interface UserInfo {
    user_id: string;
    username: string;
    role?: string;
    pfp_url: string;
    email: string;
  }

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [newUsername, setNewUsername] = useState(userInfo?.username || "");
  const [newEmail, setNewEmail] = useState(userInfo?.email || "");
  const [newPfpUrl, setNewPfpUrl] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true); // Set loading to true when fetching starts
      if (!userId) {
        setIsLoading(false); // Ensure loading is false if userId is invalid
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("user_id, username, role, pfp_url, email")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else if (data) {
          setUserInfo(data);
          setNewUsername(data.username);
          setNewPfpUrl(data.pfp_url);
          setNewEmail(data.email);
        }
      } finally {
        setIsLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };

    fetchUserData();
  }, [userId]);
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [userBadgesInfo, setUserBadgesInfo] = useState<
    { url: string; name: string }[]
  >([]);

  const handleBadges = async () => {
    setIsLoading(true);
    try {
      const { data: userBadgeData, error: userBadgeError } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user?.user_id);

      if (userBadgeError) {
        console.error("Error fetching user badges:", userBadgeError);
        setIsLoading(false);
        return;
      }

      if (userBadgeData && userBadgeData.length > 0) {
        const badgeIds = userBadgeData.map((userBadge) => userBadge.badge_id);

        const { data: badgesData, error: badgesError } = await supabase
          .from("badges")
          .select("image_url, name")
          .in("badge_id", badgeIds)
          .eq("is_active", true);

        if (badgesError) {
          console.error("Error fetching badge URLs:", badgesError);
        } else if (badgesData) {
          const badgeInfos = badgesData.map((badge) => ({
            url: badge.image_url,
            name: badge.name,
          }));
          setUserBadgesInfo(badgeInfos);
        }
      } else {
        setUserBadgesInfo([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttemptedQuizzes();
    fetchXPDataForMonth(currentYear, currentMonthNumber).then(setChartData);
    fetchLifetimeAverageScore();
    fetchAttemptedQuizzes();
    fetchUserStreak();
    handleBadges();
  }, []);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push("/sign-in");
  };

  const handleEditProfile = async () => {
    let hasError = false;

    if (hasError) {
      return;
    }

    const updates: {
      username?: string;
      pfp_url?: string;
      email?: string;
      password?: string;
    } = {};
    if (newUsername !== userInfo?.username) updates.username = newUsername;
    if (newPfpUrl !== userInfo?.pfp_url && newPfpUrl)
      updates.pfp_url = newPfpUrl;
    if (newEmail !== userInfo?.email) updates.email = newEmail;
    if (newPasswordInput) updates.password = newPasswordInput;

    if (Object.keys(updates).length === 0) {
      alert("No changes to save.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", userId);

    if (error) {
      alert("Error updating profile (duplicate value): " + error.message);
    } else {
      setShowConfirmation(true);
      if (Object.keys(updates).length > 0) {
      }

      setNewPasswordInput("");
      setNewPfpUrl("");
    }
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [userStreakData, setUserStreakData] = useState<{
    current_streak: number;
    longest_streak: number;
  } | null>(null);

  const fetchUserStreak = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user streak:", error);
      } else if (data) {
        setUserStreakData(data);
      } else {
        setUserStreakData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [lifetimeAverageScore, setLifetimeAverageScore] = useState<
    number | null
  >(null);
  const [hasQuizAttempts, setHasQuizAttempts] = useState<boolean>(false);

  const fetchLifetimeAverageScore = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("correct_questions, total_questions")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching quiz attempts:", error);
      } else if (data && data.length > 0) {
        setHasQuizAttempts(true);
        let totalCorrect = 0;
        let totalQuestions = 0;

        data.forEach((attempt) => {
          totalCorrect += attempt.correct_questions;
          totalQuestions += attempt.total_questions;
        });

        const average =
          totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        setLifetimeAverageScore(average);
      } else {
        setHasQuizAttempts(false);
        setLifetimeAverageScore(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  type XPDataPoint = {
    day: number;
    XP: number;
  };

  const fetchXPDataForMonth = async (
    year: number,
    month: number,
  ): Promise<XPDataPoint[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("xp_transactions")
        .select("xp_amount, created_at")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching XP:", error);
        return [];
      }

      const dailyXP = new Map<number, number>();
      let totalXP = 0;

      data.forEach(({ xp_amount, created_at }) => {
        const date = new Date(created_at);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const day = date.getDate();
          dailyXP.set(day, (dailyXP.get(day) || 0) + xp_amount);
          totalXP += xp_amount;
        }
      });
      setXPTotal(totalXP);
      setIsLoading(false);
      return Array.from(dailyXP.entries())
        .sort(([a], [b]) => a - b)
        .map(([day, xp]) => ({ day, XP: xp }));
    } finally {
      setIsLoading(false);
    }
  };

  const [chartData, setChartData] = useState<XPDataPoint[]>([]);
  const [xptotal, setXPTotal] = useState<number>(0);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentMonthNumber = currentDate.getMonth();

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  interface Quiz {
    quiz_id: string;
    name: string;
    description: string;
    join_code: string;
    quiz_cover_url: string | null;
  }

  interface QuizAttemptWithQuizInfo {
    started_at: string;
    completed_at: string | null;
    quiz: Quiz;
    correct_questions: number;
    total_questions: number;
    attempt_id: string;
  }

  const [attemptedQuizzes, setAttemptedQuizzes] = useState<
    QuizAttemptWithQuizInfo[]
  >([]);

  const fetchAttemptedQuizzes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select(
          `
        started_at,
        completed_at,
        correct_questions,
        total_questions,
        attempt_id,
        quizzes (
          quiz_id,
          name,
          description,
          join_code,
          quiz_cover_url
        )
      `,
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching attempted quizzes:", error);
      } else if (data) {
        const formattedData: QuizAttemptWithQuizInfo[] = data.reduce(
          (acc: QuizAttemptWithQuizInfo[], attempt: any) => {
            if (
              attempt.quizzes !== null &&
              typeof attempt.correct_questions === "number" &&
              typeof attempt.total_questions === "number"
            ) {
              acc.push({
                started_at: attempt.started_at,
                completed_at: attempt.completed_at,
                quiz: attempt.quizzes,
                correct_questions: attempt.correct_questions,
                total_questions: attempt.total_questions,
                attempt_id: attempt.attempt_id,
              });
            }
            return acc;
          },
          [],
        );
        setAttemptedQuizzes(formattedData);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className={styles.all}>
      <div className={styles.pageHeader}>
        {/* ============================================================================================================ */}
        <div>
          {isLoading ? ( // Show skeleton while loading
            <div className="flex items-center space-x-4 border-b border-gray-200 p-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ) : user ? ( // Show user info when loaded
            <div className="flex items-center gap-4 border-b border-gray-200 p-2">
              <Avatar>
                <AvatarImage src={user.pfp_url} alt={user.username} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-start space-x-2">
                <div>
                  <p className="font-bold">
                    {user.username || "No User Found"}
                  </p>
                  {user.role && (
                    <Badge className="bg-[#F6F8D5] hover:bg-[#CDCFB2]">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <div>
                  <Badge
                    className={styles.badgesContainer}
                    onClick={() => router.push("/badges")}
                  >
                    {userBadgesInfo.length > 0 &&
                      userBadgesInfo.map((badgeInfo, index) => (
                        <div
                          key={index}
                          className="relative h-4 w-4 overflow-hidden rounded-full"
                        >
                          <Image
                            src={badgeInfo.url}
                            alt={`Badge ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            title={badgeInfo.name}
                          />
                        </div>
                      ))}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <p>No User Found</p>
          )}
        </div>

        {/* ============================================================================================================ */}
        <section className="flex flex-row gap-2">
          <div className={styles.settingButton}>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <LogOut className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="z-[10000]">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to sign out?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log you out of your current session.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>
                    Yes, Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* ============================================================================================================ */}

          <div className={styles.settingButton}>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <img
                    src="data:image/png;base64,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"
                    alt="Settings"
                  />
                </Button>
              </SheetTrigger>
              <SheetContent
                style={{
                  overflowY: "scroll",
                  backgroundColor: "#1B496C",
                  color: "#F6F8D5",
                }}
              >
                <SheetHeader>
                  <SheetTitle className={styles.settingTitle}>
                    Edit Profile
                    <img
                      src="data:image/png;base64,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"
                      alt="Settings Icon"
                      className="h-5 w-5"
                    />
                  </SheetTitle>

                  <SheetDescription>
                    Make changes to your profile here. Click save when you're
                    done.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="profilePicture" className="text-left">
                      Profile Picture
                    </Label>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={newPfpUrl || user?.pfp_url}
                          alt={user?.username}
                        />
                        <AvatarFallback>
                          {user?.username?.slice(0, 2)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className={styles.uploadProfilePictureButton}>
                        <Input
                          type="file"
                          id="profilePicture"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              const newUrl = await uploadProfilePicture(file);
                              if (newUrl) {
                                setNewPfpUrl(newUrl);
                              } else {
                                console.error(
                                  "Failed to upload profile picture.",
                                );
                              }
                            }
                          }}
                        />
                        <Label
                          htmlFor="profilePicture"
                          className="cursor-pointer rounded-md border bg-[#427C83] px-4 py-2 font-semibold transition-colors duration-150 hover:bg-[#356369]"
                        >
                          Upload Profile Picture
                        </Label>
                      </div>
                    </div>
                    {newPfpUrl && (
                      <p className="mt-1 text-xs text-gray-500">
                        New profile picture will be updated after "Save
                        Changes".
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-left">
                      Username
                    </Label>
                    <Input
                      id="username"
                      className="col-span-3"
                      value={newUsername}
                      onChange={(e) =>
                        setNewUsername(e.target.value.replace(/\s/g, ""))
                      }
                      style={{ backgroundColor: "#427C83" }}
                    />
                  </div>
                </div>
                <Link href="/protected/reset-password" className="underline">
                  Change Password
                </Link>

                <SheetFooter className="mt-3 flex flex-col items-end justify-between gap-2 md:flex-row md:items-center md:justify-end md:gap-0">
                  <div className="mb-2 flex items-center space-x-2 md:mb-0">
                    <SheetClose asChild>
                      <Button>Close</Button>
                    </SheetClose>
                    <Button type="submit" onClick={handleEditProfile}>
                      Save Changes
                    </Button>
                  </div>
                  <div className="relative">
                    <div
                      className="bg-grey pointer-events-none absolute inset-y-0 left-[-8px] h-full w-0.5 md:bottom-auto md:left-[-8px] md:top-auto md:h-auto md:w-full md:bg-transparent"
                      style={{ height: "35px" }}
                    />
                  </div>
                </SheetFooter>
              </SheetContent>

              {showConfirmation && (
                <Sheet
                  open={showConfirmation}
                  onOpenChange={setShowConfirmation}
                >
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Changes Saved</SheetTitle>
                      <SheetDescription>
                        Your profile has been updated successfully.
                      </SheetDescription>
                    </SheetHeader>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button
                          onClick={() => {
                            setShowConfirmation(false);
                            window.location.reload();
                          }}
                        >
                          OK
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              )}
            </Sheet>
          </div>
        </section>
      </div>
      {/* ============================================================================================================ */}
      <div className={styles.dashContent}>
        <div className={styles.dashboardStats}>
          <div className={styles.currentStreak}>
            <h1>Current Streak</h1>
            {userStreakData ? (
              <>
                <div className={styles.streak}>
                  <h2>{userStreakData.current_streak}</h2>
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWaefuDnhh1tjn60c9id80u9DOwv2rGqLnmQ&s"
                    alt="Streak Icon"
                    className="h-12 w-12"
                  />
                </div>
                <p>Longest Streak: {userStreakData.longest_streak}</p>
              </>
            ) : (
              <>
                <h3>No streak... yet!</h3>
              </>
            )}
          </div>

          {/* ============================================================================================================ */}

          <div className={styles.lifetimeScore}>
            <h1>Average Score</h1>
            {hasQuizAttempts ? (
              <h2>
                {lifetimeAverageScore !== null
                  ? lifetimeAverageScore.toFixed(2)
                  : "..."}
                %
              </h2>
            ) : (
              <p>No quiz attempts yet</p>
            )}
          </div>
        </div>

        {/* ============================================================================================================ */}
        <div className={styles.graphContainer}>
          <Card
            style={{
              backgroundColor: "#7FAFA0",
              border: "2px solid lightblue",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#6B8474" }}>XP Earned</CardTitle>
              <CardDescription style={{ color: "#F6F8D5" }}>
                Your Journey ({currentMonth})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading graph data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={142}>
                  <LineChart
                    data={chartData}
                    margin={{
                      left: 30,
                      right: 12,
                      top: 10,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid vertical={true} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => `${value}${ordinal(value)}`}
                      style={{ color: "#fff" }}
                      tick={{ fill: "#E8E9CC", stroke: "#E8E9CC" }}
                    />
                    <ChartTooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: "#456A66",
                        color: "#fff",
                        borderColor: "#97D6DD",
                        borderRadius: "13px",
                      }}
                      labelFormatter={(value) => `Day ${value}`}
                      labelStyle={{ color: "#F6F8D5" }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value) => [`XP: ${value}`]}
                    />
                    <Line
                      dataKey="XP"
                      type="natural"
                      stroke="#4F959D"
                      strokeWidth={2.5}
                      dot={({ cx, cy, payload }) => {
                        const r = 24;
                        return (
                          <GitCommitVertical
                            key={payload.day}
                            x={cx - r / 2}
                            y={cy - r / 2}
                            width={r}
                            height={r}
                            fill="#284B4F"
                            stroke="#356369"
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none text-[#E8E9CC]">
                Total Earned: {xptotal} xp
              </div>
              <div className="leading-none text-[#fff] text-muted-foreground">
                Showing daily XP for {currentMonth} {currentYear}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* ============================================================================================================ */}

      <div className={styles.recentQuiz}>
        <h1>Attempted Quizzes</h1>
        <div className={styles.recentQuizContainer}>
          {isLoading ? (
            <div>Loading attempted quizzes...</div>
          ) : attemptedQuizzes.length > 0 ? (
            attemptedQuizzes.map((attempt, idx) => (
              <div
                key={idx}
                className={styles.singleRecentQuiz}
                onMouseEnter={(e) => {
                  if (attempt.quiz.quiz_cover_url) {
                    e.currentTarget.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${attempt.quiz.quiz_cover_url}')`;
                    e.currentTarget.classList.add(styles.showCover);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage = "none";
                  e.currentTarget.classList.remove(styles.showCover);
                }}
                onClick={() => {
                  router.push(`/attempt-summary/${attempt.attempt_id}`);
                }}
              >
                <div className={styles.namePercentage}>
                  <h1>{attempt.quiz.name}</h1>
                  <p>
                    {attempt.correct_questions} / {attempt.total_questions}
                  </p>
                </div>

                <div className={styles.desCode}>
                  <p>{attempt.quiz.description}</p>
                  <Badge variant="outline" className={styles.joinCode}>
                    {attempt.quiz.join_code}
                  </Badge>
                </div>

                <div className={styles.startComplete}>
                  <div className={styles.startDate}>
                    <h1>Started</h1>
                    <p>{new Date(attempt.started_at).toLocaleDateString()}</p>
                  </div>

                  <img
                    className={styles.startCompleteImg}
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2vcHn6ZM_f5TqLERwFCy2-4knxp4JD9tF5g&s"
                    alt="Settings"
                  />

                  <div className={styles.completeDate}>
                    <h1>Completed</h1>
                    <p>
                      {attempt.completed_at
                        ? new Date(attempt.completed_at).toLocaleDateString()
                        : "Not Completed Yet !"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No attempted quizzes found for this user.</div>
          )}
        </div>
      </div>

      {/* ============================================================================================================ */}
    </div>
  );
};

export default StudentDashboard;
