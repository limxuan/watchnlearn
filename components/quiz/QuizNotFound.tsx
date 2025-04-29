"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "lucide-react";
export default function QuizNotFound() {
  const router = useRouter();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-md p-8 shadow-md">
      <h1 className="text-xl font-bold">Quiz not found!!</h1>
      <Button
        variant="secondary"
        className="hover:border-3 flex items-center gap-2 transition-all duration-200 ease-in-out hover:gap-5"
        onClick={() => router.push("/")}
      >
        Return to home <ArrowRightIcon />
      </Button>
    </div>
  );
}
