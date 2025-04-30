// route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "weekly"; // weekly or monthly

  const now = new Date();
  const days = type === "monthly" ? 30 : 7;
  const since = new Date(
    now.getTime() - days * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 1. Get XP transactions within timeframe
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("user_id, xp_amount, created_at")
    .gte("created_at", since);

  console.log({ data, error });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  console.log("XP Transactions Data:", data); // Log the fetched data for verification

  // 2. Aggregate XP by user_id
  const xpByUser: Record<string, number> = {};

  for (const row of data) {
    xpByUser[row.user_id] = (xpByUser[row.user_id] || 0) + row.xp_amount;
  }

  const userIds = Object.keys(xpByUser);
  if (userIds.length === 0) return NextResponse.json([], { status: 200 });

  // 3. Get usernames for those user_ids
  const { data: usersData, error: userErr } = await supabase
    .from("users")
    .select("user_id, username")
    .in("user_id", userIds);

  if (userErr)
    return NextResponse.json({ error: userErr.message }, { status: 500 });

  console.log("Users Data:", usersData); // Log the user data for verification

  // 4. Combine and sort
  const leaderboard = usersData
    .map((user) => ({
      user_id: user.user_id,
      username: user.username,
      xp: xpByUser[user.user_id] || 0,
    }))
    .sort((a, b) => b.xp - a.xp);

  console.log("Leaderboard:", leaderboard); // Log the final leaderboard data

  return NextResponse.json(leaderboard);
}
