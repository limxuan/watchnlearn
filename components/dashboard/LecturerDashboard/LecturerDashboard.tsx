"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; //database
import uploadProfilePicture from "@/utils/uploadProfilePicture"; //upload pfp

import styles from "./LecturerDashboard.module.css";
import { useRouter } from "next/navigation"; //for future navigation to specific quiz use

//use grid layout

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
import { ChevronsUpDown, ChevronsUp, ChevronsDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { GitCommitVertical, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import useUserStore from "@/stores/useUserStore";

const LecturerDashboard = () => {
  const supabase = createClient(); //database
  const router = useRouter(); //for future navigation to specific quiz use
  const [isOpen, setIsOpen] = React.useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserStore();
  const userId = user?.user_id; // Replace this with a real ID from your DB

  const [newUsername, setNewUsername] = useState("");
  const [newPfpUrl, setNewPfpUrl] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [isCurrentPasswordCorrect, setIsCurrentPasswordCorrect] =
    useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState("");
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);

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
        .eq("user_id", userId);

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
          .in("badge_id", badgeIds);

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
    handleBadges();
  }, [userId]);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleEditProfile = async () => {
    if (newPasswordInput && !isCurrentPasswordCorrect) {
      alert(
        "Please enter the correct current password to update your password.",
      );
      return;
    }

    if (newPasswordInput && newPasswordInput !== confirmNewPasswordInput) {
      setNewPasswordError("New passwords don't match.");
      return;
    } else {
      setNewPasswordError(""); // Clear any previous new password error
    }

    const updates: {
      username?: string;
      pfp_url?: string;
      email?: string;
      password?: string;
    } = {};
    if (newUsername !== user?.username) updates.username = newUsername;
    if (newPfpUrl !== user?.pfp_url && newPfpUrl) updates.pfp_url = newPfpUrl; // Only update if new URL exists and is different
    if (newEmail !== user?.email) updates.email = newEmail;
    if (newPasswordInput) updates.password = newPasswordInput; // Only update password if a new one is entered

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

      setCurrentPasswordInput("");
      setIsCurrentPasswordCorrect(false);
      setIsCollapseOpen(false);
      setNewPasswordInput("");
      setConfirmNewPasswordInput("");
      // Optionally clear the newPfpUrl after successful save
      setNewPfpUrl("");
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [publishedQuizCount, setPublishedQuizCount] = useState<number | null>(
    null,
  );
  const [isLoadingPublishedQuizzes, setIsLoadingPublishedQuizzes] =
    useState(true);
  const [publishedQuizError, setPublishedQuizError] = useState<string | null>(
    null,
  );

  const fetchPublishedQuizCount = async () => {
    setIsLoadingPublishedQuizzes(true);
    setPublishedQuizError(null);

    try {
      const { data, error, count } = await supabase
        .from("quizzes")
        .select("*", { count: "exact" }) // Use count: 'exact' for efficient counting
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching published quizzes:", error);
        setPublishedQuizError(error.message);
        setPublishedQuizCount(null);
      } else {
        setPublishedQuizCount(count);
      }
    } finally {
      setIsLoadingPublishedQuizzes(false);
    }
  };

  useEffect(() => {
    fetchPublishedQuizCount();
  }, [userId]);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const chartConfig = {
    attempts: {
      label: "Attempts",
      color: "hsl(var(--chart-1))",
    },
  };

  interface QuizAttemptData {
    name: string;
    attempts: number;
  }

  const [chartData, setChartData] = useState<QuizAttemptData[]>([]);
  const [totalAttemptsAllQuizzes, setTotalAttemptsAllQuizzes] =
    useState<number>(0);

  useEffect(() => {
    const fetchQuizAttemptData = async () => {
      try {
        // 1. Fetch the user's quizzes with their names
        const { data: quizzesData, error: quizzesError } = await supabase
          .from("quizzes")
          .select("quiz_id, name")
          .eq("user_id", userId);

        if (quizzesError) {
          console.error("Error fetching quizzes:", quizzesError);
          return;
        }

        if (!quizzesData || quizzesData.length === 0) {
          setChartData([]);
          setTotalAttemptsAllQuizzes(0);
          return;
        }

        const quizIds = quizzesData.map((quiz) => quiz.quiz_id);
        const quizIdNameMap: { [key: string]: string } = quizzesData.reduce(
          (acc: { [key: string]: string }, quiz) => {
            acc[quiz.quiz_id] = quiz.name;
            return acc;
          },
          {},
        );

        // 2. Fetch the count of attempts for each of the user's quizzes
        const { data: attemptsData, error: attemptsError } = await supabase
          .from("quiz_attempts")
          .select("quiz_id")
          .in("quiz_id", quizIds);

        if (attemptsError) {
          console.error("Error fetching quiz attempts:", attemptsError);
          return;
        }

        if (!attemptsData) {
          setChartData([]);
          setTotalAttemptsAllQuizzes(0);
          return;
        }

        // 3. Count the attempts for each quiz
        const quizAttemptCounts: { [quizId: string]: number } = {};
        attemptsData.forEach((attempt) => {
          quizAttemptCounts[attempt.quiz_id] =
            (quizAttemptCounts[attempt.quiz_id] || 0) + 1;
        });

        // 4. Format the data for the chart
        const formattedData: QuizAttemptData[] = Object.keys(
          quizAttemptCounts,
        ).map((quizId) => ({
          name: quizIdNameMap[quizId] || "Unknown Quiz",
          attempts: quizAttemptCounts[quizId],
        }));

        setChartData(formattedData);
        setTotalAttemptsAllQuizzes(attemptsData.length);
      } catch (error) {
        console.error("Error fetching quiz attempt data:", error);
      }
    };

    fetchQuizAttemptData();
  }, [userId]);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  interface Quiz {
    quiz_id: string;
    user_id: string;
    name: string;
    description: string;
    public_visibility: boolean;
    join_code: string;
    quiz_cover_url: string;
  }

  const [publishedQuizzes, setPublishedQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editQuizName, setEditQuizName] = useState("");
  const [editQuizDescription, setEditQuizDescription] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [deletionNotificationOpen, setDeletionNotificationOpen] =
    useState(false);

  const fetchPublishedQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching published quizzes:", error);
        setError(error.message);
      } else if (data) {
        setPublishedQuizzes(data);
      }
    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedQuizzes();
  }, [userId]);

  const handleVisibilityChange = async (quizId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ public_visibility: !isPublic })
        .eq("quiz_id", quizId);

      if (error) {
        console.error("Error updating quiz visibility:", error);
        // Optionally, revert the switch state on error
      } else {
        // Optimistically update the state
        setPublishedQuizzes((prevQuizzes) =>
          prevQuizzes.map((quiz) =>
            quiz.quiz_id === quizId
              ? { ...quiz, public_visibility: !isPublic }
              : quiz,
          ),
        );
      }
    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
    }
  };

  const handleEditClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setEditQuizName(quiz.name);
    setEditQuizDescription(quiz.description);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedQuiz) return;
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ name: editQuizName, description: editQuizDescription })
        .eq("quiz_id", selectedQuiz.quiz_id);

      if (error) {
        console.error("Error updating quiz:", error);
      } else {
        setPublishedQuizzes((prevQuizzes) =>
          prevQuizzes.map((quiz) =>
            quiz.quiz_id === selectedQuiz.quiz_id
              ? {
                  ...quiz,
                  name: editQuizName,
                  description: editQuizDescription,
                }
              : quiz,
          ),
        );
        setEditDialogOpen(false);
        setSelectedQuiz(null);
      }
    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
    }
  };

  const handleDeleteClick = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("quiz_id", quizToDelete);

      if (error) {
        console.error("Error deleting quiz:", error);
      } else {
        setPublishedQuizzes((prevQuizzes) =>
          prevQuizzes.filter((quiz) => quiz.quiz_id !== quizToDelete),
        );
        setDeleteConfirmationOpen(false);
        setQuizToDelete(null);
        setDeletionNotificationOpen(true);
      }
    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
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
                  <Badge className={styles.badgesContainer}>
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
            <p>No User Found</p> // Optionally show an error message
          )}
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
                    <div>
                      <Input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            const newUrl = await uploadProfilePicture(file);

                            // change table here/
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
                      New profile picture will be updated after "Save Changes".
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

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-left">
                    Email
                  </Label>
                  <Input
                    id="email"
                    className="col-span-3"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ backgroundColor: "#427C83" }}
                  />
                </div>

                <div className={styles.passwordContainer}>
                  <div className="rounded-md border px-4 py-2 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">
                          Current Password
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (isCurrentPasswordCorrect) {
                              setIsCurrentPasswordCorrect(false);
                              setIsCollapseOpen(false);
                              setCurrentPasswordError("");
                            } else {
                              if (user?.password === currentPasswordInput) {
                                setIsCurrentPasswordCorrect(true);
                                setIsCollapseOpen(true);
                                setCurrentPasswordError("");
                              } else {
                                setIsCurrentPasswordCorrect(false);
                                setIsCollapseOpen(false);
                                setCurrentPasswordError(
                                  "Incorrect current password.",
                                );
                              }
                            }
                          }}
                        >
                          {isCurrentPasswordCorrect ? (
                            <ChevronsUp className="h-4 w-4" />
                          ) : (
                            <ChevronsDown className="h-4 w-4" />
                          )}
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </div>

                      <Input
                        type="password"
                        value={currentPasswordInput}
                        onChange={(e) =>
                          setCurrentPasswordInput(e.target.value)
                        }
                        placeholder="Enter current password"
                        style={{ backgroundColor: "#356369" }}
                      />
                      {currentPasswordError && (
                        <p className="text-xs text-red-500">
                          {currentPasswordError}
                        </p>
                      )}

                      {isCurrentPasswordCorrect && (
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="newPassword" className="text-left">
                            New Password
                          </Label>
                          <Input
                            type="password"
                            id="newPassword"
                            className="col-span-3"
                            value={newPasswordInput}
                            onChange={(e) =>
                              setNewPasswordInput(e.target.value)
                            }
                            style={{ backgroundColor: "#356369" }}
                          />

                          <Label
                            htmlFor="confirmNewPassword"
                            className="text-left"
                          >
                            Confirm New Password
                          </Label>
                          <Input
                            type="password"
                            id="confirmNewPassword"
                            className="col-span-3"
                            value={confirmNewPasswordInput}
                            onChange={(e) =>
                              setConfirmNewPasswordInput(e.target.value)
                            }
                            style={{ backgroundColor: "#356369" }}
                          />
                          {newPasswordError && (
                            <p className="text-xs text-red-500">
                              {newPasswordError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="flex flex-col items-end justify-between gap-2 md:flex-row md:items-center md:justify-end md:gap-0">
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
                    className="t-y-0 bg-grey absolute left-[-8px] h-full w-0.5 md:bottom-auto md:left-[-8px] md:top-auto md:h-auto md:w-full md:bg-transparent"
                    style={{ height: "35px" }}
                  />
                  <Button className="ml-4">Log Out</Button>
                </div>
              </SheetFooter>
            </SheetContent>

            {showConfirmation && (
              <Sheet open={showConfirmation} onOpenChange={setShowConfirmation}>
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
                          window.location.reload(); // Add this line here
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
      </div>
      {/* ============================================================================================================ */}
      <div className={styles.dashContent}>
        <div className={styles.dashboardStats}>
          <div className={styles.badgesEarned}>
            <h1>You have Earned: </h1>
            {userBadgesInfo ? (
              <>
                <div className={styles.badges}>
                  <h2>{userBadgesInfo.length}</h2>
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAA9CAMAAAApvJHbAAAAY1BMVEX///8AAADCwsLc3Nzk5OT09PSZmZnq6ur7+/vR0dG9vb3Z2dnIyMgSEhIXFxd3d3ezs7NmZmaEhIR+fn4JCQmsrKxaWlphYWFubm6kpKSSkpJDQ0NPT08fHx8rKysxMTE6OjqKF/4DAAADS0lEQVRIiY1X2baDIAysrRtVu2jrgnX5/6+8hAAmiL3NQ49AwpBkEujpdCDZVfZrFb2Wrn7ER0phSYY1onKTv2+Q1NFenj/aD9Zg7BtZ3z92WOc/AI9atZLCTV2GBeeK/4wLrbdcvWmBJ3h8Ny610ju0UsFK+s1YgMaaEZtk+37C4nBsnMF6RybmKCLmEpbLQ2sIzpOMUzVuvTHdjgmkefSPEtEANmr8CRvH/s4Y5xfVWb3tNmnVypmMH4YljXecl28IcvGczMEyntQPJYk8yHrj6d3VWGoCLN6ea8CahUxIcPqmvjpQr88uHhDafcGU9ki5SG1hANUT872YHS5BxkkTcBsrJXe98N4mahhPoaSNxr+X0ZwaG38hXatITHx2tXozqdFsbq6cUXmpWVqdzOEyzzixFZBP7sxU9Pl1tESA7LEjURaqxHIrkE1zk8u2o/DZbUhsijMLNICY0FSf8kLduhFvsgDbMopXG6ZY6WhphU6eMGdbXm0KenJJKg2NmKhQ924A+SFrI62fIZAxgKvcoOHWHa2MJ/cKJaXs79VR9UehD6zKbXaKXutDYez/6HrLwIF7oaPoWkIZ7tgTOboididspa0PSajdhRtjSjIxRzsxFnHw4Ng1bDhsoS2u1G1M2lC+QKRuRXYjJT2oxeY6xqZ1jo5ach65fVWCp8F59xit34nPYSK6rWgi5G9+unhAfizB6kXpdAc4umlO5nqYwmsFj89OcnwXBO9nDCeU4sEdr8s+qjiHGXSHmf7s4ZM7nis9AG8xnJjgJ3+iZJi2KdM0r/bG7hpL0btZlhjnRKTG4d4u78Fbl8nY8UsVx/Y5YxLzEHgRkQ4giL3lrAtlCHyDRvx0IaZVTcIA4N4VzqBNpCBMd3DZ64F7cA8apNZ2sMfIF3bg/rvhhAUBpOz3JemDH0JjO/DAvZwD9JhdQCzLABo7IYDbW8/oNAy8JfHtOTQDH4ieA89ZZgcLbR87DlwwvSKEjdMb9MmFPWFat+39UJ5R9BOhol5bcIH187Sa5+AfBegvHYO2nqfRYV/ZBOpCMmgE16X37z8b258oPWMzF+5JTDAtM5vraTK/S+dDm5fQfKDvyWuv2f/iNEq8zP59kXyqc0DzD0R3Inzy0QolAAAAAElFTkSuQmCC"
                    alt="Badged Icon"
                    className="h-10 w-10"
                  />
                </div>

                <p>in your life time</p>
              </>
            ) : (
              <>
                <h3>"No badges... yet!"</h3>
              </>
            )}
          </div>

          {/* ============================================================================================================ */}

          <div className={styles.quizPublished}>
            <h1>Total Quizzes Published</h1>
            {isLoadingPublishedQuizzes ? (
              <h2>Loading...</h2>
            ) : publishedQuizError ? (
              <p>Error loading quiz count: {publishedQuizError}</p>
            ) : (
              <h2>{publishedQuizCount !== null ? publishedQuizCount : 0}</h2>
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
              <CardTitle style={{ color: "#6B8474" }}>
                Quiz Attempt Chart
              </CardTitle>
              <CardDescription style={{ color: "#F6F8D5" }}>
                Total attempts across all your quizzes
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ChartContainer
                config={chartConfig}
                style={{ width: "100%", height: "170px" }}
              >
                <ResponsiveContainer>
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, stroke: "#E8E9CC" }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis tick={{ stroke: "#E8E9CC" }} />
                    <Tooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="attempts" fill="#4F959D" radius={8} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="leading-none text-[#E8E9CC] text-muted-foreground">
                Total of {totalAttemptsAllQuizzes} attempts across all your
                quizzes.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* ============================================================================================================ */}

      <div className={styles.recentPublishedQuiz}>
        <h1>Your Published Quizzes</h1>
        <div className={styles.recentPublishedQuizContainer}>
          {isLoading ? (
            <div>Loading published quizzes...</div>
          ) : error ? (
            <div>Error loading quizzes: {error}</div>
          ) : publishedQuizzes.length > 0 ? (
            publishedQuizzes.map((quiz) => (
              <div
                key={quiz.quiz_id}
                className={styles.singleRecentPublishedQuiz}
                onMouseEnter={(e) => {
                  if (quiz.quiz_cover_url) {
                    e.currentTarget.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${quiz.quiz_cover_url}')`;
                    e.currentTarget.classList.add(styles.showCover);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage = "none";
                  e.currentTarget.classList.remove(styles.showCover);
                }}
              >
                <div className={styles.nameEditDelete}>
                  <h1>{quiz.name}</h1>
                  <div className={styles.editDelete}>
                    <Button
                      variant="outline"
                      onClick={() => handleEditClick(quiz)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(quiz.quiz_id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className={styles.desCode}>
                  <p>{quiz.description}</p>
                  <Badge variant="outline" className={styles.joinCode}>
                    {quiz.join_code}
                  </Badge>
                </div>

                <div className={styles.visibility}>
                  <Label htmlFor={`public-${quiz.quiz_id}`}>
                    {quiz.public_visibility ? "Public" : "Private"}
                  </Label>

                  <Switch
                    id={`public-${quiz.quiz_id}`}
                    checked={quiz.public_visibility}
                    onCheckedChange={(checked) =>
                      handleVisibilityChange(
                        quiz.quiz_id,
                        quiz.public_visibility,
                      )
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <div>You haven't published any quizzes yet.</div>
          )}
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Quiz</DialogTitle>
              <DialogDescription>
                Edit the name and description of your quiz.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editQuizName}
                  onChange={(e) => setEditQuizName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={editQuizDescription}
                  onChange={(e) => setEditQuizDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleEditSave}
                style={{ marginBottom: "15px" }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteConfirmationOpen}
          onOpenChange={setDeleteConfirmationOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this quiz? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteConfirmationOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteQuiz}
                style={{ marginBottom: "15px" }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deletionNotificationOpen}
          onOpenChange={setDeletionNotificationOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Quiz Deleted</DialogTitle>
              <DialogDescription>
                The quiz has been successfully deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setDeletionNotificationOpen(false)}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ============================================================================================================ */}
    </div>
  );
};

export default LecturerDashboard;
