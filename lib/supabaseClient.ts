import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function incrementXp(userId: string, amount: number) {
  const { data: userXPData } = await supabase
    .from("user_xp")
    .select("*")
    .eq("user_id", userId)
    .single();

  const XPData = {
    user_id: userId,
    last_updated_at: new Date(),
    total_xp: 0,
  };

  if (!userXPData) {
    XPData.total_xp = amount;
    const { error: insertXpError } = await supabase
      .from("user_xp")
      .insert(XPData);

    if (insertXpError) {
      console.error("Error inserting user XP:", insertXpError);
      return;
    }
  } else {
    XPData.total_xp = userXPData.total_xp + amount;
    const { error: updateXpError } = await supabase
      .from("user_xp")
      .update(XPData)
      .eq("user_id", userId);

    if (updateXpError) {
      console.error("Error updating user XP:", updateXpError);
      return;
    }
  }

  const XPTransactionData = {
    user_id: userId,
    xp_amount: amount,
    created_at: new Date(),
  };

  const { error: transactionError } = await supabase
    .from("xp_transactions")
    .insert(XPTransactionData);

  if (transactionError) {
    console.error("Error logging XP transaction:", transactionError);
    return;
  }

  // update badges
  const { data: eligibleBadges } = await supabase
    .from("badges")
    .select("badge_id")
    .lte("xp_threshold", XPData.total_xp);

  console.log({ eligibleBadges });

  if (eligibleBadges) {
    const { data: earnedBadges, error: userBadgeError } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    if (userBadgeError) {
      console.error("Error fetching earned badges:", userBadgeError);
      return;
    }

    const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id));
    const newBadges = eligibleBadges.filter(
      (b) => !earnedBadgeIds.has(b.badge_id),
    );

    if (newBadges.length === 0) return;

    const badgeInserts = newBadges.map((b) => ({
      user_id: userId,
      badge_id: b.badge_id,
      earned_at: new Date(),
    }));

    const { error: badgeInsertError } = await supabase
      .from("user_badges")
      .insert(badgeInserts);

    if (badgeInsertError) {
      console.error("Error inserting new badges:", badgeInsertError);
      return;
    }
  }
}
