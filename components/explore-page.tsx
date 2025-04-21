'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExplorePage() {
   const [loading, setLoading] = useState(true);
   const [quizzes, setQuizzes] = useState<any[]>([]);
   const [mostPlayed, setMostPlayed] = useState<any[]>([]);
   const [recent, setRecent] = useState<any[]>([]);

   useEffect(() => {
      const fetchQuizzes = async () => {
         const supabase = createClient();

         // Fetch All Public Quiz
         const quizzesRes = await supabase
            .from('quizzes')
            .select('*')
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
            .select('*')
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

               <h1 className="text-3xl font-bold mb-6 text-center text-[#f6f8d5]">Popular Quizzes</h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
               >
                  {loading
                     ? renderSkeletonCards(3) : quizzes.map((quiz, id) => (
                        <Link key={id} href={`/quiz/${quiz.id}`}>
                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="bg-[#5691a4] text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-gray-700 transition"
                           >
                              {quiz.quiz_cover_url && (
                                 <img src={quiz.quiz_cover_url} alt={quiz.description} className="w-full h-40 object-cover rounded-lg mb-2" />
                              )}
                              <p className="text-b text-gray-300 font-bold">{quiz.description}</p>
                              <br />
                              <h5 className="text-m font-semibold mb-2">By: {quiz.name}</h5>
                           </motion.div>
                        </Link>
                     ))}
               </motion.div>

               <h1 className="text-3xl font-bold mt-12 mb-6 text-center text-[#f6f8d5]">Recently Created</h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
               >
                  {loading
                     ? renderSkeletonCards(3) : recent.map((quiz, id) => (
                        <Link key={id} href={`/quiz/${quiz.id}`}>
                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="bg-[#5691a4] text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-gray-700 transition"
                           >
                              {quiz.quiz_cover_url && (
                                 <img src={quiz.quiz_cover_url} alt={quiz.description} className="w-full h-40 object-cover rounded-lg mb-2" />
                              )}
                              <p className="text-b text-gray-300 font-bold">{quiz.description}</p>
                              <br />
                              <h5 className="text-m font-semibold mb-2">By: {quiz.name}</h5>
                           </motion.div>
                        </Link>
                     ))}
               </motion.div>

               <h1 className="text-3xl font-bold mt-12 mb-6 text-center text-[#f6f8d5]">Most Played Quizzes</h1>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
               >
                  {loading
                     ? renderSkeletonCards(3) : mostPlayed.map((quiz, id) => (
                        <Link key={id} href={`/quiz/${quiz.id}`}>
                           <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="bg-[#5691a4] text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-gray-700 transition"
                           >
                              {quiz.quiz_cover_url && (
                                 <img src={quiz.quiz_cover_url} alt={quiz.description} className="w-full h-40 object-cover rounded-lg mb-2" />
                              )}
                              <p className="text-b text-gray-300 font-bold">{quiz.description}</p>
                              <br />
                              <h5 className="text-m font-semibold mb-2">By: {quiz.name}</h5>
                           </motion.div>
                        </Link>
                     ))}
               </motion.div>

            </div>
         </nav>
      </main>
   );
}
