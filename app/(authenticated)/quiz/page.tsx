"use client";
import { useRouter } from "next/navigation";
import React from "react";
import ExplorePage from "@/components/explore-page";

export default function QuizPage() {
  const router = useRouter();
  return (
    <>
      <ExplorePage />
    </>
  );
}
