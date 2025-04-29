"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import useUserStore from "@/stores/useUserStore";
import InitUserStore from "@/components/init-user-store";
import { useEffect } from "react";
import StudentDashboard from "@/components/dashboard/StudentDashboard/StudentDashboard";
import LecturerDashboard from "@/components/dashboard/LecturerDashboard/LecturerDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { clearUser, user } = useUserStore();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push("/sign-in");
  };

  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/badges-management");
    }
  }, [user, router]);

  if (!user) return <InitUserStore />;

  return (
    <>
      {user.role == "student" && <StudentDashboard />}
      {user.role == "lecturer" && <LecturerDashboard />}
    </>
  );
}
