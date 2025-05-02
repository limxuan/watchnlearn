"use client";
import useUserStore from "@/stores/useUserStore";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLogout() {
  const supabase = createClient();
  const { clearUser } = useUserStore();
  const router = useRouter();
  useEffect(() => {
    supabase.auth.signOut();
    clearUser();
    router.push("/sign-in");
  }, []);
  return <h1>Logging out...</h1>;
}
