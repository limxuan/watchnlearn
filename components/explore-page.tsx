"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Dialog, DialogTitle, DialogContent } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useMemo } from "react";

export default function ExplorePage() {
   const router = useRouter();
   const [join_code, setJoinCode] = useState("")
   const [loading, setLoading] = useState(true);
   const [quizzes, setQuizzes] = useState<any[]>([]);
   const [mostPlayed, setMostPlayed] = useState<any[]>([]);
   const [recent, setRecent] = useState<any[]>([]);
   const [open, setOpen] = useState(false)

   function getRandomQuizzes<T>(array: T[], count: number): T[] {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
   }
   const randomQuizzes = useMemo(() => getRandomQuizzes(quizzes, 6), [quizzes]);

   const handleComplete = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      const supabase = createClient();
      const { data, error } = await supabase
         .from("quizzes")
         .select("quiz_id, join_code")
         .ilike("join_code", join_code.toLowerCase());

      if (error) {
         console.log(error);
         return;
      }

      if (data && data.length > 0) {
         router.push(`/quiz/${data[0].quiz_id}`);
      } else {
         alert("Invalid OTP code");
      }
   };

   useEffect(() => {
      const fetchQuizzes = async () => {
         const supabase = createClient();

         // Fetch All Public Quiz
         const quizzesRes = await supabase
            .from("quizzes")
            .select("*, users (username)")
            .eq("public_visibility", true);

         if (quizzesRes.error) {
            console.log(quizzesRes.error.message);
            return;
         }
         const quizzesData = quizzesRes.data || [];
         setQuizzes(quizzesData);

         // Fetch Most Played
         const { data, error } = await supabase
            .from("quiz_attempts")
            .select("quiz_id")

         if (error) {
            console.log("Error fetching quiz attempts:", error);
         } else {
            // Count attempts per quiz_id
            const attemptCount: Record<number, number> = {};

            console.log({ data });

            data.forEach((attempt) => {
               attemptCount[attempt.quiz_id] =
                  (attemptCount[attempt.quiz_id] || 0) + 1;
            });

            // Sort quiz_ids by number of attempts (descending) and limit to top 5
            const mostPlayed = Object.entries(attemptCount)
               .sort((a, b) => b[1] - a[1])
               .slice(0, 5)
               .map(([quiz_id, count]) => ({
                  quiz_id: quiz_id,
                  attempt_count: count,
               }));

            const mostPlayedDetails = await Promise.all(
               mostPlayed.map(async ({ quiz_id }) => {
                  const { data, error } = await supabase
                     .from("quizzes")
                     .select("*")
                     .eq("public_visibility", true)
                     .eq("quiz_id", quiz_id)
                     .maybeSingle();

                  if (error) {
                     console.log("Error fetching quiz details:", error);
                     return null;
                  }
                  return data;
               }),
            );

            if (error) {
               console.log(error);
               return;
            }
            setMostPlayed(mostPlayedDetails);
         }

         // Fetch Recent Quiz
         const recentQuizzesRes = await supabase
            .from("quizzes")
            .select("*, users (username)")
            .eq("public_visibility", true)
            .order("created_at", { ascending: false })
            .limit(3);

      if (data && data.length > 0) {
         router.push(`/quiz/${data[0].quiz_id}`);
      } else {
         alert("Invalid OTP code");
      }
   };

   useEffect(() => {
      const fetchQuizzes = async () => {
         const supabase = createClient();

         // Fetch All Public Quiz
         const quizzesRes = await supabase
            .from("quizzes")
            .select("*, users (username)")
            .eq("public_visibility", true);

         if (quizzesRes.error) {
            console.log(quizzesRes.error.message);
            return;
         }
         const quizzesData = quizzesRes.data || [];
         setQuizzes(quizzesData);

         // Fetch Most Played
         const { data, error } = await supabase
            .from("quiz_attempts")
            .select("quiz_id");

         if (error) {
            console.error("Error fetching quiz attempts:", error);
         } else {
            // Count attempts per quiz_id
            const attemptCount: Record<number, number> = {};

            console.log({ data });

            data.forEach((attempt) => {
               attemptCount[attempt.quiz_id] =
                  (attemptCount[attempt.quiz_id] || 0) + 1;
            });

            // Sort quiz_ids by number of attempts (descending) and limit to top 5
            const mostPlayed = Object.entries(attemptCount)
               .sort((a, b) => b[1] - a[1])
               .slice(0, 5)
               .map(([quiz_id, count]) => ({
                  quiz_id: quiz_id,
                  attempt_count: count,
               }));

            const mostPlayedDetails = await Promise.all(
               mostPlayed.map(async ({ quiz_id }) => {
                  const { data, error } = await supabase
                     .from("quizzes")
                     .select("*")
                     .eq("quiz_id", quiz_id)
                     .single();

                  if (error) {
                     console.log("Error fetching quiz details:", error);
                     return null;
                  }
                  return data;
               }),
            );

            if (error) {
               console.log(error);
               return;
            }
            setMostPlayed(mostPlayedDetails);
         }

         // Fetch Recent Quiz
         const recentQuizzesRes = await supabase
            .from("quizzes")
            .select("*, users (username)")
            .eq("public_visibility", true)
            .order("created_at", { ascending: false })
            .limit(3);

         if (recentQuizzesRes.error) {
            console.log(recentQuizzesRes.error.message);
            return;
         }
         const recentQuizzesData = recentQuizzesRes.data || [];
         setRecent(recentQuizzesData);

         setLoading(false);
      };

      fetchQuizzes();

      const down = (e: KeyboardEvent) => {
         if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setOpen((open) => !open);
         }
      };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
   }, []);

   const renderSkeletonCards = (count = 3) =>
      Array.from({ length: count }).map((_, index) => (
         <div key={index} className="space-y-3 rounded-lg bg-[#5691a4] p-6 shadow">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
         </div>
      ));

   return (
      <main className="min-h-screen bg-[#205781]">
         <nav className="px-4 py-8 text-foreground">
            <div className="mx-auto max-w-5xl">
               <div className="mb-8 flex items-center justify-between">

                  <Dialog>
                     <DialogContent>
                        <VisuallyHidden>
                           <DialogTitle></DialogTitle>
                        </VisuallyHidden>
                     </DialogContent>
                  </Dialog>

                  <Button
                     onClick={() => setOpen((open) => !open)}
                     className="hidden sm:inline-flex"
                  >
                     Search Quiz
                  </Button>

                  <Button
                     variant="outline"
                     size="icon"
                     onClick={() => setOpen((open) => !open)}
                     className="sm:hidden p-2"

                  >
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-search"
                     >
                        <path d="M21 21L16.65 16.65" />
                        <circle cx="11" cy="11" r="8" />
                     </svg>
                  </Button>

                  <CommandDialog open={open} onOpenChange={setOpen}>
                     <CommandInput placeholder="Search for quizzes..." />
                     <CommandList>
                        <CommandEmpty>No quiz found.</CommandEmpty>
                        <CommandGroup>
                           {quizzes.map((quiz) => (
                              <CommandItem
                                 key={quiz.quiz_id}
                                 onSelect={() => {
                                    router.push(`/quiz/${quiz.quiz_id}`);
                                    setOpen(false);
                                 }}
                              >
                                 {quiz.name}
                              </CommandItem>
                           ))}
                        </CommandGroup>
                     </CommandList>
                  </CommandDialog>

                  <div className="flex items-center space-x-2">
                     <InputOTP
                        className="w-24"
                        maxLength={6}
                        value={join_code}
                        onChange={setJoinCode}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                     >
                        <InputOTPGroup>
                           {[...Array(6)].map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                           ))}
                        </InputOTPGroup>
                     </InputOTP>

                     <Button
                        onClick={handleComplete}
                        disabled={join_code.length !== 6}
                     >
                        Join
                     </Button>

                  </div>
               </div>

               {/* All Quizzes */}
               <h1 className="mb-6 text-center text-3xl font-bold text-[#f6f8d5]" > Hot Quizzes </h1>

               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3"
               >
                  {loading
                     ? renderSkeletonCards(3)
                     : randomQuizzes.map((quiz, id) => (
                        <button key={id} onClick={() => router.push(`/quiz/${quiz.quiz_id}`)}>

                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="flex h-[350px] flex-col rounded-lg bg-[#5691a4] p-6 text-center text-white shadow transition hover:bg-gray-700 hover:shadow-lg"
                           >
                              {quiz.quiz_cover_url && (
                                 <img
                                    src={quiz.quiz_cover_url}
                                    alt={quiz.description}
                                    className="mb-2 flex h-40 w-full flex-col rounded-lg object-cover"
                                 />
                              )}
                              <br />
                              <h5 className="mb-2 text-xl font-semibold">
                                 {quiz.name}
                              </h5>
                           </motion.div>
                        </button>
                     ))}
               </motion.div>

               {/* Recently Quizzes */}
               <h1 className="mb-6 mt-12 text-center text-3xl font-bold text-[#f6f8d5]"> Recently Created </h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3"
               >
                  {loading
                     ? renderSkeletonCards(3)
                     : recent.map((quiz, id) => (
                        <button key={id} onClick={() => router.push(`/quiz/${quiz.quiz_id}`)}>
                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="flex h-[350px] flex-col rounded-lg bg-[#5691a4] p-6 text-center text-white shadow transition hover:bg-gray-700 hover:shadow-lg"
                           >
                              {quiz.quiz_cover_url && (
                                 <img
                                    src={quiz.quiz_cover_url}
                                    alt={quiz.description}
                                    className="mb-2 flex h-40 w-full flex-col rounded-lg object-cover"
                                 />
                              )}
                              <br />
                              <h5 className="mb-2 text-xl font-semibold">
                                 {quiz.name}
                              </h5>
                           </motion.div>
                        </button>
                     ))}
               </motion.div>

               {/* Most Played Quizzes */}
               <h1
                  className="mb-6 mt-12 text-center text-3xl font-bold text-[#f6f8d5]"
                  onClick={() => console.log({ mostPlayed })}
               >
                  Most Played Quizzes
               </h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3"
               >
                  {loading
                     ? renderSkeletonCards(3)
                     : mostPlayed.map((quiz, id) => {
                        if (!quiz) return null;
                        return (
                           <button key={id} onClick={() => router.push(`/quiz/${quiz.quiz_id}`)}>
                              <motion.div
                                 whileHover={{ scale: 1.03 }}
                                 transition={{ type: "spring", stiffness: 300 }}
                                 className="flex h-[350px] flex-col rounded-lg bg-[#5691a4] p-6 text-center text-white shadow transition hover:bg-gray-700 hover:shadow-lg"
                              >
                                 {quiz.quiz_cover_url && (
                                    <img
                                       src={quiz.quiz_cover_url}
                                       alt={quiz.description}
                                       className="mb-2 flex h-40 w-full flex-col rounded-lg object-cover"
                                    />
                                 )}
                                 <br />
                                 <h5 className="mb-2 text-xl font-semibold">
                                    {quiz.name}
                                 </h5>
                              </motion.div>
                           </button>
                        );
                     })}
               </motion.div>
            </div>
         </nav>
      </main >

   );
}
