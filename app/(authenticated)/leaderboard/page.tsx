"use client";

import React, { useEffect, useState } from "react";
import XPByWeekChart from "@/components/leaderboard/XPByWeekChart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import useUserStore from "@/stores/useUserStore";
import { createClient } from "@/utils/supabase/client";

const leaderboardPhrases = [
  "Take a look at how everyone is doing!",
  "Who's on top this week? Check out the leaderboard!",
  "Track your progress and beat your friends!",
  "Rise to the challenge and climb the ranks!",
  "Stay competitive and aim for the top spot!",
];

type Player = {
  user_id: string;
  username: string;
  xp: number;
  pfp_url: string;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserXP, setCurrentUserXP] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("Loading...");
  const [filteredData, setFilteredData] = useState<Player[]>([]);
  const [phrase, setPhrase] = useState(leaderboardPhrases[0]);

  const user = useUserStore((state) => state.user);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const type = activeTab === 0 ? "weekly" : "monthly";

      try {
        const res = await fetch(`/api/leaderboard?type=${type}`);
        const data = (await res.json()) as Player[];
        console.log({ data });
        setFilteredData(data);

        // Set random phrase
        const randomIndex = Math.floor(
          Math.random() * leaderboardPhrases.length,
        );
        setPhrase(leaderboardPhrases[randomIndex]);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
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
          .from("user_xp")
          .select("total_xp")
          .eq("user_id", user.user_id)
          .single();

        if (data) {
          setCurrentUserXP(data.total_xp);
        }
      } catch (error) {
        console.error("Error fetching current user XP:", error);
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
  `}</style>;
  return (
    <div className="min-h-screen bg-[#205781] px-4 py-10 text-[#f6f8d5] md:px-12 lg:px-28">
      <h1 className="font-spartan mb-2 text-6xl font-bold">Leaderboard 🏆</h1>
      <h2 className="font-spartan mb-6 text-lg font-semibold md:text-xl">
        {phrase}
      </h2>

      {/* Tab Buttons */}
      <div className="mb-4 flex gap-5 text-lg md:text-xl">
        <button
          onClick={() => setActiveTab(0)}
          className={`relative pb-1 font-bold transition-colors duration-300 ${
            activeTab === 0
              ? "border-b-2 border-white text-[#98D2C0]"
              : "text-[#f6f8d5]"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`relative pb-1 font-bold transition-colors duration-300 ${
            activeTab === 1
              ? "border-b-2 border-white text-[#98D2C0]"
              : "text-[#f6f8d5]"
          }`}
        >
          Monthly
        </button>
      </div>

      <div className="mb-10 h-0.5 w-3/4 bg-[#98D2C0]"></div>

      {/* Grid Layout: Leaderboard | Chart | Profile */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Leaderboard */}
        <div className="space-y-5 lg:col-span-1">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="mr-3 w-10 text-right text-xl font-bold text-[#f6f8d5]">
                    #{index + 1}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user?.pfp_url}
                      alt={`@${user?.username}`}
                    />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="h-4 w-32 rounded bg-gray-300"></div>
                    <div className="h-3 w-20 rounded bg-gray-300"></div>
                  </div>
                </div>
              ))
            : filteredData.map((player, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="mr-3 w-10 text-right text-xl font-bold text-[#f6f8d5]">
                    #{index + 1}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={player.pfp_url}
                      alt={`@${player?.username}`}
                    />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                  <div className="text-base leading-tight text-[#f6f8d5]">
                    <strong>{player.username}</strong>
                    <br />
                    XP: {player.xp}
                  </div>
                </div>
              ))}
        </div>

        {/* Chart */}
        <div className="chart-container">
          <XPByWeekChart data={filteredData as any} />
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center gap-2 p-4 text-center lg:col-span-1">
          <Avatar className="mb-4 h-44 w-44">
            <AvatarImage src={user?.pfp_url ?? ""} alt={`@${user?.username}`} />
            <AvatarFallback>👤</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold">{currentUsername}</h2>
          <h3 className="text-lg">Total XP:</h3>
          <div className="text-3xl font-extrabold">{currentUserXP}</div>
        </div>
      </div>
    </div>
  );
}
