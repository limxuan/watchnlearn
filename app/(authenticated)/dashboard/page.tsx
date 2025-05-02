"use client";
import { useRouter } from "next/navigation";
import useUserStore from "@/stores/useUserStore";
import InitUserStore from "@/components/init-user-store";
import { useEffect } from "react";
import StudentDashboard from "@/components/dashboard/StudentDashboard/StudentDashboard";
import LecturerDashboard from "@/components/dashboard/LecturerDashboard/LecturerDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUserStore();

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
