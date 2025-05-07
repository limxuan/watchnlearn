"use client";
import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const PictureToPictureCreator = () => {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const quizId = params.quizId as string;
  const fileInputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pairs, setPairs] = useState(
    Array(4)
      .fill(null)
      .map(() => ({
        id: crypto.randomUUID(),
        source: { src: null as string | null, file: null as File | null },
        target: { src: null as string | null, file: null as File | null },
      })),
  );

  const handleClear = () => {
    setPairs(
      Array(4)
        .fill(null)
        .map(() => ({
          id: crypto.randomUUID(),
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

    const url = URL.createObjectURL(file);
    const newPairs = [...pairs];
    newPairs[pairIndex][type] = { src: url, file };
    setPairs(newPairs);
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
    const input = fileInputRefs.current[pairIndex]?.[type === "source" ? 0 : 1];
    if (input) input.click();
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const name = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("quiz-images")
      .upload(name, file);
    if (error) throw error;

    const { data } = supabase.storage.from("quiz-images").getPublicUrl(name);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Authentication error:", authError);
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

      // 1. Insert ONE question row
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          quiz_id: quizId,
          question_type: "picture-to-picture",
          question_text: "Match the pairs",
          is_active: true,
        })
        .select("question_id")
        .single();

      if (questionError) {
        console.error("Error inserting question:", questionError);
        throw questionError;
      }

      const insertedOptionIds: {
        [key: string]: { source: string; target: string };
      } = {};

      for (const pair of validPairs) {
        if (pair.source.file && pair.target.file) {
          let sourceImageUrl: string | null = null;
          let targetImageUrl: string | null = null;

          try {
            sourceImageUrl = await uploadImageToSupabase(pair.source.file);
          } catch (uploadError) {
            console.error("Error uploading source image:", uploadError);
            throw uploadError;
          }

          try {
            targetImageUrl = await uploadImageToSupabase(pair.target.file);
          } catch (uploadError) {
            console.error("Error uploading target image:", uploadError);
            throw uploadError;
          }

          const { data: sourceOption, error: sourceOptionError } =
            await supabase
              .from("question_options")
              .insert({
                question_id: question.question_id,
                option_text: "Source image",
                option_url: sourceImageUrl,
                is_correct: true,
                is_active: true,
              })
              .select("option_id")
              .single();

          if (sourceOptionError) {
            console.error("Error inserting source option:", sourceOptionError);
            throw sourceOptionError;
          }

          const { data: targetOption, error: targetOptionError } =
            await supabase
              .from("question_options")
              .insert({
                question_id: question.question_id,
                option_text: "Target image",
                option_url: targetImageUrl,
                is_correct: true,
                is_active: true,
              })
              .select("option_id")
              .single();

          if (targetOptionError) {
            console.error("Error inserting target option:", targetOptionError);
            throw targetOptionError;
          }

          insertedOptionIds[pair.id] = {
            source: sourceOption.option_id,
            target: targetOption.option_id,
          };
        }
      }

      // 3. Insert matches by linking source & target option_ids
      for (const pair of validPairs) {
        const optionIds = insertedOptionIds[pair.id];
        if (optionIds) {
          const { source, target } = optionIds;
          const { error: matchError } = await supabase
            .from("question_matches")
            .insert({
              question_id: question.question_id,
              source_option_id: source,
              target_option_id: target,
            });

          if (matchError) {
            console.error("Error inserting match:", matchError);
            throw matchError;
          }
        }
      }

      alert("Picture-to-picture question created successfully!");
      router.push(`/quiz/${quizId}/questions`);
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Failed to create quiz: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#98d5c0] pb-40 pt-20">
      <h1 className="text-center text-3xl font-bold text-[#205781]">
        Create Picture to Picture Question
      </h1>

      <div className="mx-auto mt-12 w-[90%] px-4">
        <h2 className="mb-6 text-center text-xl font-bold text-[#205781]">
          Upload Matching Image Pairs
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {pairs.map((pair, index) => (
            <div
              key={pair.id}
              className="rounded-lg border-[3px] border-[#205781] bg-[#f8f8d5] p-4 shadow-md"
            >
              <h3 className="text-center font-medium text-[#205781]">
                Pair {index + 1}
              </h3>

              {/* Hidden Inputs */}
              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  fileInputRefs.current[index] ||= [];
                  fileInputRefs.current[index][0] = el;
                }}
                onChange={(e) =>
                  handleImageUpload(
                    index,
                    "source",
                    e.target.files?.[0] ?? null,
                  )
                }
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  fileInputRefs.current[index] ||= [];
                  fileInputRefs.current[index][1] = el;
                }}
                onChange={(e) =>
                  handleImageUpload(
                    index,
                    "target",
                    e.target.files?.[0] ?? null,
                  )
                }
                className="hidden"
              />

              <div
                onDrop={(e) => handleDrop(e, index, "source")}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => handleClickUpload(index, "source")}
                className="mt-3 flex h-40 cursor-pointer items-center justify-center rounded-xl border-4 border-dashed border-[#205781] bg-[#98d5c0] text-[#205781] hover:bg-[#98D2C0]"
              >
                {pair.source.src ? (
                  <img
                    src={pair.source.src}
                    alt="source"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="text-sm font-medium">&#x2295; Source Image</p>
                )}
              </div>

              <div className="my-2 text-center font-bold text-[#205781]">
                ↓ Match to ↓
              </div>

              <div
                onDrop={(e) => handleDrop(e, index, "target")}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => handleClickUpload(index, "target")}
                className="flex h-40 cursor-pointer items-center justify-center rounded-xl border-4 border-dashed border-[#205781] bg-[#98d5c0] text-[#205781] hover:bg-[#98D2C0]"
              >
                {pair.target.src ? (
                  <img
                    src={pair.target.src}
                    alt="target"
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

      <div className="mt-12 flex justify-center gap-6">
        <Button
          onClick={() => router.push(`/quiz/${quizId}/questions`)}
          className="border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] hover:bg-[#205781] hover:text-[#f6f8d5]"
        >
          ← Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] hover:bg-[#98d5c0]"
        >
          {isSubmitting ? "Submitting..." : "Create Question"}
        </Button>
        <Button
          onClick={handleClear}
          className="border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] hover:bg-[#F29898]"
        >
          ✕ Clear
        </Button>
      </div>
    </div>
  );
};

export default PictureToPictureCreator;
