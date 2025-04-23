"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import useUserStore from "@/stores/useUserStore";
import InitUserStore from "@/components/init-user-store";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { clearUser, user } = useUserStore();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push("/sign-in");
  };

  return (
    <>
      {user ? (
        <>
          <div className="flex w-full flex-1 flex-col gap-12">
            Dashboard Page
          </div>
          <div>
            Welcome {user!.username} ({user?.role})
          </div>
          <button onClick={handleSignOut}>sign out</button>
        </>
      ) : (
        <InitUserStore />
      )}
    </>
  );
}
