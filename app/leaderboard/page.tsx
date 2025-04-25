'use client';

import React, { useEffect, useState } from 'react';
import XPByWeekChart from '@/components/leaderboard/XPByWeekChart';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  profile_url: string;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserXP, setCurrentUserXP] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('Loading...');
  const [filteredData, setFilteredData] = useState<Player[]>([]);
  const [phrase, setPhrase] = useState(leaderboardPhrases[0]);

  const user = useUserStore(state => state.user);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const type = activeTab === 0 ? 'weekly' : 'monthly';

      try {
        const res = await fetch(`/api/leaderboard?type=${type}`);
        const data = (await res.json()) as Player[];
        setFilteredData(data);

        // Set random phrase
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
        if (!user) {
          return setCurrentUsername("User not found, please log in");
        }

        setCurrentUsername(user.username);

        const { data, error } = await supabase
          .from('user_xp')
          .select('total_xp')
          .eq('user_id', user.user_id)
          .single();

        if (data) {
          setCurrentUserXP(data.total_xp);
        }
      } catch (error) {
        console.error('Error fetching current user XP:', error);
      }
    };

    fetchCurrentUserXP();
  }, []);
  <style jsx>{`
    

    .chart-container {
      height: 300px;
      width: 100%;
      margin-bottom: 10px;
    }


    .chart-container {
      width: 50%;
      display: flex;
      justify-content: center;
      height: 200px;
    }

   
   

   

    
  `}</style>
  return (
    <div className="bg-[#205781] px-4 py-10 md:px-12 lg:px-28 min-h-screen text-[#f6f8d5]">
      <h1 className="text-6xl font-bold mb-2 font-spartan">Leaderboard 🏆</h1>
      <h2 className="text-lg md:text-xl font-semibold mb-6 font-spartan">{phrase}</h2>

      {/* Tab Buttons */}
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

      {/* Grid Layout: Leaderboard | Chart | Profile */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-1 space-y-5">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 animate-pulse">
                <div className="text-xl font-bold text-[#f6f8d5] w-10 text-right mr-3">#{index + 1}</div>
                <Avatar className="w-12 h-12">
    <AvatarImage src={user?.pfp_url} alt={`@${user?.username}`} />
    <AvatarFallback>👤</AvatarFallback>
  </Avatar>
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
                <Avatar className="w-12 h-12 ">
    <AvatarImage src={player.profile_url} alt={`@${player?.username}`} />
    <AvatarFallback>👤</AvatarFallback>
  </Avatar>
                <div className="text-base leading-tight text-[#f6f8d5]">
                  <strong>{player.username}</strong><br />
                  XP: {player.xp}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chart */}
        <div className="chart-container">
          
            <XPByWeekChart data={filteredData as any} />
          
        </div>

        {/* User Profile */}
        <div className="lg:col-span-1 text-center flex flex-col items-center p-4 gap-2">
  <Avatar className="w-44 h-44 mb-4">
    <AvatarImage src={user?.pfp_url ?? ""} alt={`@${user?.username}`} />
    <AvatarFallback>👤</AvatarFallback>
  </Avatar>

  <h2 className="text-xl font-bold">{currentUsername}</h2>
  <h3 className="text-lg">Total XP:</h3>
  <div className="text-3xl font-extrabold">{currentUserXP}</div>
</div>
    </div>
    </div>
  );}