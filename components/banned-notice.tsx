"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import useUserStore from "@/stores/useUserStore";

interface BannedNoticeProps {
  reason: string;
  bannedAt: string;
}

export default function BannedNotice({ reason, bannedAt }: BannedNoticeProps) {
  const router = useRouter();
  const supabase = createClient();
  const { clearUser } = useUserStore();

  const handleLogout = async () => {
    clearUser();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-[91dvh] items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md rounded-2xl border border-destructive shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2 text-red-400">
          <AlertCircle className="h-10 w-10" />
          <CardTitle className="text-center text-xl font-bold">
            Account Banned
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted">
            You have been banned from accessing the system.
          </p>
          <div className="text-sm">
            <p>
              <span className="font-medium">Reason:</span> {reason}
            </p>
            <p>
              <span className="font-medium">Banned At:</span>{" "}
              {new Date(bannedAt).toLocaleString()}
            </p>
          </div>
          <Button onClick={handleLogout} className="w-full bg-red-400">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
