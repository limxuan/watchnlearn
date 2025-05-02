"use client";

import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <Spinner />
    </div>
  );
}
