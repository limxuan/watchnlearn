"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import CompleteProfile from "./page";

export default function AuthenticatedClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role, username")
        .eq("user_id", user.id)
        .single();

      console.log({ profile });
      if (!profile || !profile.role || !profile.username) {
        setLoading(false);
        return <CompleteProfile />;
      } else {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return <Spinner />;
  }

  return <>{children}</>;
}
