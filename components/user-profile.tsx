"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import useUserStore from "@/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function AuthButton({
  closeMenuAction,
}: {
  closeMenuAction: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { user, clearUser } = useUserStore();

  const handleSignOut = async () => {
    clearUser();
    await supabase.auth.signOut();
    router.push("/sign-in");
    closeMenuAction();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="flex cursor-pointer items-center gap-4 rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 hover:text-black">
              <div className="flex flex-col items-end">
                <span>{user.username}</span>
                <span className="text-xs text-gray-500">{user.role}</span>
              </div>
              <Avatar>
                <AvatarImage src={user.pfp_url} alt={`@${user.username}`} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to sign out?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will log you out of your current session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>
                Yes, Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  } else {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/sign-in" onClick={closeMenuAction}>
            Sign in
          </Link>
        </Button>
        <Button asChild size="sm" variant="default">
          <Link href="/sign-up" onClick={closeMenuAction}>
            Sign up
          </Link>
        </Button>
      </div>
    );
  }
}
