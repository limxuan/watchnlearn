"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import useUserStore from "@/stores/useUserStore";

export default function WaitingApproval() {
  const router = useRouter();
  const supabase = createClient();
  const { clearUser } = useUserStore();

  const handleLogout = async () => {
    clearUser();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="flex min-h-[91dvh] items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md rounded-2xl border border-border shadow-xl">
        <CardHeader className="flex flex-col items-center space-y-2">
          <ClockIcon className="h-10 w-10 text-yellow-500" />
          <CardTitle className="text-center text-xl font-semibold">
            Awaiting Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-sm text-muted">
            Your lecturer account is currently pending approval from the admin
            team. You’ll be notified once your account is verified.
          </p>
          <Button onClick={handleLogout} className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
