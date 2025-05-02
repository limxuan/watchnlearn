"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import useUserStore from "@/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";

export default function AuthButton({
  closeMenuAction,
}: {
  closeMenuAction: () => void;
}) {
  const router = useRouter();
  const { user } = useUserStore();

  const handleProfileClick = () => {
    closeMenuAction();
    router.push("/dashboard");
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div
          className="flex cursor-pointer items-center gap-4 rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 hover:text-black"
          onClick={handleProfileClick}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleProfileClick();
            }
          }}
        >
          <div className="flex flex-col items-end">
            <span>{user.username}</span>
            <span className="text-xs text-gray-500">{user.role}</span>
          </div>
          <Avatar>
            <AvatarImage src={user.pfp_url} alt={`@${user.username}`} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  } else {
    return (
      <div className="z-[999] flex gap-2">
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
