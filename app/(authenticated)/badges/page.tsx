"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useUserStore from "@/stores/useUserStore";
import { cn } from "@/lib/utils";
import FlexCenter from "@/components/flex-center";

interface Badge {
  badge_id: string;
  name: string;
  image_url: string;
  description: string;
  xp_threshold: number;
  is_active: boolean;
  created_at: string;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

export default function Home() {
  const [badgesData, setBadgesData] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<
    (Badge & UserBadge) | null
  >(null);
  const [userXP, setUserXP] = useState(0);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const supabase = createClient();
  const { user } = useUserStore();

  useEffect(() => {
    const fetchBadges = async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("xp_threshold", { ascending: true });

      const { data: userBadgesData, error: userBadgesError } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user?.user_id);

      const { data: userXPData, error: userXPError } = await supabase
        .from("user_xp")
        .select("total_xp")
        .eq("user_id", user?.user_id)
        .single();

      if (userXPError) {
        console.error("Error fetching user XP:", userXPError);
      } else {
        setUserXP(userXPData?.total_xp || 0);
      }

      if (userBadgesError) {
        console.error("Error fetching user badges:", userBadgesError);
      } else {
        setUserBadges(userBadgesData);
      }

      if (error) {
        console.error("Error fetching badges:", error);
      } else {
        setBadgesData(data || []);
        setSelectedBadge(data?.[0] || null);
      }

      setIsLoading(false);
    };

    fetchBadges();
  }, []);

  return (
    <FlexCenter>
      <div className="flex w-full flex-col items-center overflow-x-hidden bg-[#205781] p-20 pt-10 text-[#f6f8d4]">
        {/* Title */}
        <div className="flex w-[90dvw] flex-col items-center justify-between lg:w-full lg:flex-row">
          <div>
            <h1 className="text-2xl font-bold lg:mb-2 lg:text-6xl">Badges</h1>
            <h2
              className="text-sm font-semibold md:text-xl lg:mb-6"
              style={{ fontFamily: "League Spartan, sans-serif" }}
            >
              All the badges you have earned
            </h2>
          </div>

          <div className="mt-4 rounded-lg bg-[#1b4e72] p-4 md:mt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold lg:text-xl">Your XP</p>
                <p className="text-3xl font-bold text-[#98D2C0]">{userXP} XP</p>
              </div>
              <div className="ml-4 text-right">
                <p className="text-sm">Badges earned</p>
                <p className="text-2xl font-bold">
                  {userBadges.length.toString()} / {badgesData.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="mb-10 h-0.5 w-full"
          style={{ backgroundColor: "#98D2C0" }}
        />

        {/* Grid + Details */}
        <div className="flex w-[90dvw] flex-col items-center justify-center gap-8 lg:w-full lg:flex-row">
          {/* Badge Grid */}
          <ScrollArea className="h-[550px] w-full max-w-[750px] transform rounded-md border-4 border-[#f6f8d5] p-4 transition duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <main
              className="grid w-full grid-cols-3 gap-2.5 bg-[#205781] p-5"
              style={{
                ["--tw-border-opacity" as any]: "1",
                ["--tw-border-color" as any]: "#f6f8d5",
              }}
            >
              {isLoading
                ? Array.from({ length: 9 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="aspect-square w-full rounded-md"
                  />
                ))
                : badgesData.map((badge) => {
                  const userBadge = userBadges.find(
                    (ub) => ub.badge_id === badge.badge_id,
                  );
                  return (
                    <div
                      key={badge.badge_id}
                      onClick={() => {
                        setSelectedBadge({ ...badge, ...userBadge! });
                        if (window.innerWidth < 1024)
                          setShowMobileModal(true);
                      }}
                      className={cn(
                        "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-4 p-2 text-center transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:bg-[#1b4e72] hover:shadow-lg",
                        userBadge ? "border-green-300" : "border-gray-500",
                      )}
                    >
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="h-12 w-12 object-contain"
                      />
                      <p className="mt-2 text-sm font-semibold">
                        {badge.name}
                      </p>
                    </div>
                  );
                })}
            </main>
          </ScrollArea>

          {/* Badge Details Card (Desktop Only) */}
          <div className="hidden lg:block">
            <Card
              className={cn(
                "h-[500px] w-full max-w-[600px] border-4 border-[#f6f8d5] bg-[#205781] text-[#f6f8d5]",
              )}
            >
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Badge Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-12 grid w-full items-start gap-5 text-lg font-bold">
                  {isLoading ? (
                    <>
                      <div className="flex justify-center py-4">
                        <Skeleton className="aspect-square h-16 w-16" />
                      </div>
                      <div className="space-y-4 px-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-1/2" />
                      </div>
                    </>
                  ) : selectedBadge ? (
                    <>
                      <div className="flex justify-center border-2 py-4">
                        <img
                          src={selectedBadge.image_url}
                          alt={selectedBadge.name}
                          className="h-24 w-24 border-2 object-contain"
                        />
                      </div>
                      <div className="space-y-4 px-4">
                        <p>
                          <strong>Name:</strong> {selectedBadge.name}
                        </p>
                        <p>
                          <strong>XP Required:</strong>{" "}
                          {selectedBadge.xp_threshold}
                        </p>

                        <p>
                          <strong>Date Added:</strong>{" "}
                          {new Date(
                            selectedBadge.created_at,
                          ).toLocaleDateString()}
                        </p>

                        {selectedBadge.earned_at && (
                          <p>
                            <strong>Earned At:</strong>{" "}
                            {new Intl.DateTimeFormat("en-GB", {
                              timeZone: "Asia/Singapore",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }).format(new Date("2025-04-30T08:37:41.25+00:00"))}
                          </p>
                        )}

                        {selectedBadge.description && (
                          <p>
                            <strong>Description:</strong>{" "}
                            {selectedBadge.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-lg font-medium">
                      No badge selected.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between" />
            </Card>
          </div>
        </div>

        {/* Badge Details Modal (Mobile Only) */}
        {showMobileModal && selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 lg:hidden">
            <div className="relative w-11/12 max-w-md rounded-lg border-4 border-[#f6f8d5] bg-[#205781] p-6 text-[#f6f8d5]">
              <button
                onClick={() => setShowMobileModal(false)}
                className="absolute right-3 top-2 text-xl text-[#f6f8d5]"
              >
                &times;
              </button>
              <div className="flex justify-center border-2 py-4">
                <img
                  src={selectedBadge.image_url}
                  alt={selectedBadge.name}
                  className="h-24 w-24 border-2 object-contain"
                />
              </div>
              <div className="mt-4 space-y-4">
                <p>
                  <strong>Name:</strong> {selectedBadge.name}
                </p>
                <p>
                  <strong>XP Required:</strong> {selectedBadge.xp_threshold}
                </p>
                <p>
                  <strong>Date Obtained:</strong>{" "}
                  {new Date(selectedBadge.created_at).toLocaleDateString()}
                </p>
                {selectedBadge.earned_at && (
                  <p>
                    <strong>Earned At:</strong>{" "}
                    {new Intl.DateTimeFormat("en-GB", {
                      timeZone: "Asia/Singapore",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(new Date("2025-04-30T08:37:41.25+00:00"))}
                  </p>
                )}

                {selectedBadge.description && (
                  <p>
                    <strong>Description:</strong> {selectedBadge.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FlexCenter>
  );
}
