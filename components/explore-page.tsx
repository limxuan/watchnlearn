'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function ExplorePage() {
   const [loading, setLoading] = useState(true);
   const [quizzes, setQuizzes] = useState<any[]>([]);
   const [mostPlayed, setMostPlayed] = useState<any[]>([]);
   const [recent, setRecent] = useState<any[]>([]);
   const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   const handleOpenModal = (quiz: any) => {
      setSelectedQuiz(quiz);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedQuiz(null);
   };

   useEffect(() => {
      const fetchQuizzes = async () => {
         const supabase = createClient();

         // Fetch All Public Quiz
         const quizzesRes = await supabase
            .from('quizzes')
            .select('*, users (username)')
            .eq('public_visibility', true)

         if (quizzesRes.error) {
            console.log(quizzesRes.error.message);
            return;
         }
         const quizzesData = quizzesRes.data || [];
         setQuizzes(quizzesData);

         // Fetch Most Played
         const { data: mostPlayed, error } = await supabase.rpc('get_most_played_quizzes', {
            limit_num: 5,
         });

         if (error) {
            console.log(error.message);
            return;
         }
         setMostPlayed(mostPlayed);

         // Fetch Recent Quiz
         const recentQuizzesRes = await supabase
            .from('quizzes')
            .select('*, users (username)')
            .eq('public_visibility', true)
            .order('created_at', { ascending: false })
            .limit(3);

         if (recentQuizzesRes.error) {
            console.log(recentQuizzesRes.error.message);
            return;
         }
         const recentQuizzesData = recentQuizzesRes.data || [];
         setRecent(recentQuizzesData);

         setLoading(false);
      }

      fetchQuizzes();
   }, []);

   const renderSkeletonCards = (count = 3) =>
      Array.from({ length: count }).map((_, index) => (
         <div key={index} className="bg-[#5691a4] p-6 rounded-lg shadow space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
         </div>
      ));

   return (
      <main className="bg-[#205781] min-h-screen">
         <nav className="text-foreground px-4 py-8">
            <div className="max-w-5xl mx-auto">

               {/* All Quizzes */}
               <h1 className="text-3xl font-bold mb-6 text-center text-[#f6f8d5]">Popular Quizzes</h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4"
               >
                  {loading
                     ? renderSkeletonCards(3) : quizzes.map((quiz, id) => (
                        <button key={id} onClick={() => handleOpenModal(quiz)}>
                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="bg-[#5691a4] text-center text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-gray-700 transition flex flex-col h-[350px]"
                           >
                              {quiz.quiz_cover_url && (
                                 <img src={quiz.quiz_cover_url} alt={quiz.description} className="w-full h-40 object-cover rounded-lg mb-2 flex flex-col" />
                              )}
                              <br />
                              <h5 className="text-xl font-semibold mb-2">{quiz.name}</h5>

                           </motion.div>

                        </button>
                     ))}
               </motion.div>

               {/* Recently Quizzes */}
               <h1 className="text-3xl font-bold mt-12 mb-6 text-center text-[#f6f8d5]">Recently Created</h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4"
               >
                  {loading
                     ? renderSkeletonCards(3) : recent.map((quiz, id) => (
                        <button key={id} onClick={() => handleOpenModal(quiz)}>
                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="bg-[#5691a4] text-center text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-gray-700 transition flex flex-col h-[350px]"
                           >
                              {quiz.quiz_cover_url && (
                                 <img src={quiz.quiz_cover_url} alt={quiz.description} className="w-full h-40 object-cover rounded-lg mb-2 flex flex-col" />
                              )}
                              <br />
                              <h5 className="text-xl font-semibold mb-2">{quiz.name}</h5>

                           </motion.div>

                        </button>
                     ))}
               </motion.div>

               {/* Most Played Quizzes */}
               <h1 className="text-3xl font-bold mt-12 mb-6 text-center text-[#f6f8d5]">Most Played Quizzes</h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4"
               >
                  {loading
                     ? renderSkeletonCards(3) : mostPlayed.map((quiz, id) => (
                        <button key={id} onClick={() => handleOpenModal(quiz)}>
                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="bg-[#5691a4] text-center text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-gray-700 transition flex flex-col h-[350px]"
                           >
                              {quiz.quiz_cover_url && (
                                 <img src={quiz.quiz_cover_url} alt={quiz.description} className="w-full h-40 object-cover rounded-lg mb-2 flex flex-col" />
                              )}
                              <br />
                              <h5 className="text-xl font-semibold mb-2">{quiz.name}</h5>

                           </motion.div>

                        </button>
                     ))}
               </motion.div>

            </div>
         </nav>
         {
            isModalOpen && selectedQuiz && (
               <div className="fixed inset-0 backdrop-blur bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-[#6a92b2] w-[1000px] h-[600px] p-6 rounded-lg shadow-lg relative overflow-y-scroll">
                     <button
                        onClick={handleCloseModal}
                        className="absolute top-2 right-4 text-[#f6f8d5] hover:text-black text-[30px] font-bold"
                     >
                        &times;
                     </button>
                     <h2 className="text-[30px] text-[#f6f8d5] font-bold mb-2">{selectedQuiz.name}</h2>
                     <p className="text-sm text-gray-600 mb-4">Created by: {selectedQuiz.users?.username}</p>
                     {selectedQuiz.quiz_cover_url && (
                        <div className="flex justify-center">
                           <div className="border-4 border-[#f6f8d5] rounded-md overflow-hidden incline-block">
                              <img src={selectedQuiz.quiz_cover_url} alt={selectedQuiz.description} className="max-w-full max-h-[200px] object-contain" />
                           </div>
                        </div>
                     )}

                     <p className="mt-4 text-gray-700">
                        <span className="font-semibold text-[#f6f8d5]">Description:</span>
                     </p>
                     <p className="text-[20px] text-grey-600">{selectedQuiz.description}</p>
                     <br />

                     <div className="text-center mt-4">
                        <Button asChild size="lg" variant={"default"} className="hover:bg-black hover:text-[#f6f8d5]">
                           <Link href={`/quiz/${selectedQuiz.join_code}`}>Enter Quiz</Link>
                        </Button>
                     </div>

                  </div>
               </div>
            )
         }
      </main >
   );
}
