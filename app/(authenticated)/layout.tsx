import BannedNotice from "@/components/banned-notice";
import WaitingApproval from "@/components/waiting-approval";
import { createClient } from "@/utils/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("role, approved")
    .eq("user_id", data.user?.id)
    .single();

  console.log({ profile });

  const { data: banData } = await supabase
    .from("bans")
    .select("reason, banned_at")
    .eq("user_id", data.user?.id)
    .single();

  if (profile) {
    if (banData) {
      return (
        <BannedNotice reason={banData.reason} bannedAt={banData.banned_at} />
      );
    }
    if (profile.role == "lecturer" && !profile.approved) {
      return <WaitingApproval />;
    }
    return <>{children}</>;
  }
}
