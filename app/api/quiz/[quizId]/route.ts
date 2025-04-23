import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { quizId: string } },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("quiz_id", (await params).quizId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
