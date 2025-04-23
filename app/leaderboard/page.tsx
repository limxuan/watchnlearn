'use client';

import React, { useEffect, useState } from 'react';
import XPByWeekChart from '@/components/leaderboard/XPByWeekChart';
import useUserStore from '@/stores/useUserStore';
import { createClient } from '@/utils/supabase/client';


const leaderboardPhrases = [
  "Take a look at how everyone is doing!",
  "Who's on top this week? Check out the leaderboard!",
  "Track your progress and beat your friends!",
  "Rise to the challenge and climb the ranks!",
  "Stay competitive and aim for the top spot!"
];
type Player = {
  user_id: string;
  username: string;
  xp: number;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserXP, setCurrentUserXP] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('Loading...');
  const user = useUserStore(state => state.user)
  const supabase = createClient();

const [filteredData, setFilteredData] = useState<Player[]>([]);  const [phrase, setPhrase] = useState(leaderboardPhrases[0]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      
      const type = activeTab === 0 ? 'weekly' : 'monthly';
      try {
        const res = await fetch(`/api/leaderboard?type=${type}`);
        console.log(res)
        const data = (await res.json()) as Player[];  
        setFilteredData(data);
  
        // Handle phrase every time data is fetched
        const randomIndex = Math.floor(Math.random() * leaderboardPhrases.length);
        setPhrase(leaderboardPhrases[randomIndex]);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLeaderboard();
  }, [activeTab]);
  useEffect(() => {
    const fetchCurrentUserXP = async () => {
      try {
        if(!user) {
          return setCurrentUsername("user not fetched")
        }
        setCurrentUsername(user!.username);

        // fetching xp
        const { data, error } = await supabase
  .from('user_xp')
  .select('total_xp')
  .eq('user_id', user!.user_id)
  .single();
        setCurrentUserXP(data!.total_xp);

      } catch (error) {
        console.error('Error fetching current user XP:', error);
      }
    };
  
    fetchCurrentUserXP();
  }, []);
  
  return (
    <div className="bg-[#205781] px-4 py-10 md:px-12 lg:px-28 min-h-screen text-[#f6f8d5]">
    

      <h1 className= "text-6x1 font-bold mb-2 font-spartan">Leaderboard 🏆</h1>
      <h2 className ="text-lg md:text-x1 font-semibold mb-6 font-spartan">{phrase}</h2>

      <div className="flex gap-5 text-lg md:text-xl mb-4">
  <button
    onClick={() => setActiveTab(0)}
    className={`relative pb-1 transition-colors duration-300 font-bold ${
      activeTab === 0
        ? 'text-[#98D2C0] border-b-2 border-white'
        : 'text-[#f6f8d5]'
    }`}
  >
    Weekly
  </button>
  <button
    onClick={() => setActiveTab(1)}
    className={`relative pb-1 transition-colors duration-300 font-bold ${
      activeTab === 1
        ? 'text-[#98D2C0] border-b-2 border-white'
        : 'text-[#f6f8d5]'
    }`}
  >
    Monthly
  </button>
</div>

      <div className="w-3/4 h-0.5 bg-[#98D2C0] mb-10"></div>

      <div className="w-full flex flex-col lg:flex-row justify-between gap-4">
        <div className="w-full lg:w-2/3 space-y-5">
        {loading ? (
  Array.from({ length: 5 }).map((_, index) => (
    <div key={index} className="flex items-center gap-4 animate-pulse">
      <div className="text-xl font-bold text-[#f6f8d5] w-10 text-right mr-3">#{index + 1}</div>
      <div className="w-10 h-10 bg-gray-300 rounded-full mr-4 p-1"></div>
      <div className="space-y-1">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-3 bg-gray-300 rounded w-20"></div>
      </div>
    </div>
  ))
) : (
  filteredData.map((player, index) => (
<div key={index} className="flex items-center gap-4">      
<div className="text-xl font-bold text-[#f6f8d5] w-10 text-right mr-3">#{index + 1}</div>      
<div className="w-10 h-10 bg-white rounded-full mr-4 p-1"></div>     
<div className="text-base leading-tight text-[#f6f8d5]">        
  <strong>{player.username}</strong><br />
        XP: {player.xp}
      </div>
    </div>
  ))
)}
        </div>

        <div className="w-full lg:w-1/2 flex justify-center items-center h-52">
        <div className='w-[90%] flex justify-center'>
          <XPByWeekChart data={filteredData as any} />
          </div>
        </div>

        <div className="w-full lg:w-1/3 text-center flex flex-col items-center gap-2">
  <div className="w-44 h-44 rounded-full bg-black mb-4"></div>
  <h2 className="text-xl font-bold">{currentUsername}</h2>
  <h3 className="text-lg">Total XP:</h3>
  <div className="text-3xl font-extrabold">{currentUserXP}</div>
</div>
      </div>
    </div>
  );
}