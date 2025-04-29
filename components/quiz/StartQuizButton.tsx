"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export default function StartQuizButton() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => router.push(`${pathname}/attempt`)}
    >
      Start Quiz
    </Button>
  );
}
