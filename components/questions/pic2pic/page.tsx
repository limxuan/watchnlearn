"use client";
import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const PictureToPictureCreator = () => {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const quizId = params.quizid as string;
  const fileInputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pairs, setPairs] = useState(
    Array(4)
      .fill(null)
      .map(() => ({
        id: Math.random().toString(36).substring(2, 11),
        source: { src: null as string | null, file: null as File | null },
        target: { src: null as string | null, file: null as File | null },
      })),
  );

  const handleClear = () => {
    setPairs(
      Array(4)
        .fill(null)
        .map(() => ({
          id: Math.random().toString(36).substring(2, 11),
          source: { src: null, file: null },
          target: { src: null, file: null },
        })),
    );
  };

  const handleImageUpload = async (
    pairIndex: number,
    type: "source" | "target",
    file: File | null,
  ) => {
    if (!file || !file.type.startsWith("image/")) return;

    try {
      const url = URL.createObjectURL(file);
      const newPairs = [...pairs];
      newPairs[pairIndex] = {
        ...newPairs[pairIndex],
        [type]: { src: url, file },
      };
      setPairs(newPairs);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Please upload a valid image file");
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    pairIndex: number,
    type: "source" | "target",
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageUpload(pairIndex, type, file);
  };

  const handleClickUpload = (pairIndex: number, type: "source" | "target") => {
    if (!fileInputRefs.current[pairIndex]) {
      fileInputRefs.current[pairIndex] = [];
    }
    const input = fileInputRefs.current[pairIndex][type === "source" ? 0 : 1];
    if (input) input.click();
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("quiz-images")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("quiz-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("You need to be logged in to create quizzes");
        return;
      }

      const validPairs = pairs.filter(
        (pair) => pair.source.file && pair.target.file,
      );

      if (validPairs.length === 0) {
        alert("Please add at least one complete pair");
        return;
      }

      for (const pair of validPairs) {
        if (!pair.source.file || !pair.target.file) continue;

        const sourceUrl = await uploadImageToSupabase(pair.source.file);
        const targetUrl = await uploadImageToSupabase(pair.target.file);

        const { data: question, error: questionError } = await supabase
          .from("questions")
          .insert({
            quiz_id: quizId,
            question_type: "picture_to_picture",
            question_text: "Match the pairs",
            is_active: true,
          })
          .select("question_id")
          .single();

        if (questionError) throw questionError;

        const { data: sourceOption, error: sourceError } = await supabase
          .from("question_options")
          .insert({
            question_id: question.question_id,
            option_text: "Source image",
            option_url: sourceUrl,
            is_correct: false,
            is_active: true,
          })
          .select("option_id")
          .single();

        if (sourceError) throw sourceError;

        const { data: targetOption, error: targetError } = await supabase
          .from("question_options")
          .insert({
            question_id: question.question_id,
            option_text: "Target image",
            option_url: targetUrl,
            is_correct: false,
            is_active: true,
          })
          .select("option_id")
          .single();

        if (targetError) throw targetError;

        const { error: matchError } = await supabase
          .from("question_matches")
          .insert({
            question_id: question.question_id,
            source_option_id: sourceOption.option_id,
            target_option_id: targetOption.option_id,
          });

        if (matchError) throw matchError;
      }

      alert("Quiz created successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Failed to create quiz: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsSubmitting(false);
    }
    router.push(`/quiz/${quizId}/questions`);
  };

  return (
    <div className="min-h-screen bg-[#98d5c0] pb-40 pt-20">
      <h1 className="text-center text-3xl font-bold text-[#205781]">
        Create Picture to Picture Quiz
      </h1>

      <div className="mx-auto mt-12 w-[90%] bg-[#98d5c0] px-4">
        <h2 className="mb-6 text-center text-xl font-bold text-[#205781]">
          Create 4 Matching Pairs (Click to upload images)
        </h2>

        <div className="grid grid-cols-1 gap-8 bg-[#98d5c0] md:grid-cols-2 lg:grid-cols-2">
          {pairs.map((pair, index) => (
            <div
              key={pair.id}
              className="space-y-4 rounded-lg border-[3px] border-[#205781] bg-[#f8f8d5] p-4 shadow-md"
            >
              <h3 className="text-center font-medium text-[#205781]">
                Pair {index + 1}
              </h3>

              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  if (!fileInputRefs.current[index])
                    fileInputRefs.current[index] = [];
                  fileInputRefs.current[index][0] = el;
                }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageUpload(index, "source", e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  if (!fileInputRefs.current[index])
                    fileInputRefs.current[index] = [];
                  fileInputRefs.current[index][1] = el;
                }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageUpload(index, "target", e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div
                onDrop={(e) => handleDrop(e, index, "source")}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => handleClickUpload(index, "source")}
                className="flex h-40 cursor-pointer items-center justify-center rounded-xl border-4 border-dashed border-[#205781] bg-[#98d5c0] text-center text-[#205781] transition hover:bg-[#98D2C0]"
              >
                {pair.source.src ? (
                  <img
                    src={pair.source.src}
                    alt={`Source ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="text-sm font-medium">&#x2295; Source Image</p>
                )}
              </div>

              <div className="text-center text-lg font-bold text-[#205781]">
                ↓ Match to ↓
              </div>

              <div
                onDrop={(e) => handleDrop(e, index, "target")}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => handleClickUpload(index, "target")}
                className="flex h-40 cursor-pointer items-center justify-center rounded-xl border-4 border-dashed border-[#205781] bg-[#98d5c0] text-center text-[#205781] transition hover:bg-[#98D2C0]"
              >
                {pair.target.src ? (
                  <img
                    src={pair.target.src}
                    alt={`Target ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="text-sm font-medium">&#x2295; Target Image</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center gap-6 bg-[#98d5c0] pb-48">
        <Button
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition-all duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
          onClick={() => router.push(`/quiz/${quizId}/questions`)}
        >
          &#x2190; Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition duration-300 ease-linear hover:bg-[#98d5c0]"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </Button>
        <Button
          onClick={handleClear}
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition duration-300 ease-linear hover:bg-[#F29898]"
        >
          &#x2715; Clear
        </Button>
      </div>
    </div>
  );
};

export default PictureToPictureCreator;
