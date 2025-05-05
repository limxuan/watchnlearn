"use client";
import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const WhichOfImg = () => {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quizQuestion, setQuizQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answerImages, setAnswerImages] = useState<
    { src: string | null; file: File | null; isCorrect: boolean }[]
  >(Array(4).fill({ src: null, file: null, isCorrect: false }));
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const bucket = "quiz-images";

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return publicUrl;
  };

  const handleDone = async () => {
    setIsSubmitting(true);
    try {
      if (
        !quizQuestion.trim() ||
        answerImages.some((img) => !img.file) ||
        !answerImages.some((img) => img.isCorrect)
      ) {
        alert(
          "Please fill the question, upload all images, and select a correct answer",
        );
        return;
      }

      if (!quizId) {
        alert("Missing quiz ID");
        return;
      }

      const answerUrls = await Promise.all(
        answerImages.map((img) => {
          if (!img.file) throw new Error("Missing image file");
          return uploadImage(img.file);
        }),
      );

      // 1. Save question
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert([
          {
            quiz_id: quizId,
            question_type: "which_of_images",
            question_text: quizQuestion,
            is_active: true,
          },
        ])
        .select("question_id, question_text")
        .single();

      if (questionError) throw questionError;

      // 2. Save answer options
      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(
          answerImages.map((img, index) => ({
            question_id: question.question_id,
            option_text: `Option ${index + 1}`,
            option_url: answerUrls[index],
            is_correct: img.isCorrect,
            is_active: true,
          })),
        );

      if (optionsError) throw optionsError;

      router.push(`/quiz/${quizId}/questions`);
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerImageUpload = async (index: number, file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;

    try {
      const url = URL.createObjectURL(file);
      const newAnswerImages = [...answerImages];
      newAnswerImages[index] = { src: url, file, isCorrect: false };
      setAnswerImages(newAnswerImages);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Please upload a valid image file");
    }
  };

  const handleSetCorrectAnswer = (index: number) => {
    const newAnswerImages = answerImages.map((img, i) => ({
      ...img,
      isCorrect: i === index,
    }));
    setAnswerImages(newAnswerImages);
  };

  const handleClear = () => {
    setQuizQuestion("");
    setAnswerImages(Array(4).fill({ src: null, file: null, isCorrect: false }));
  };

  return (
    <div className="bg-[#98d5c0] pb-40 pt-20">
      <div className="space-y-4 px-4">
        <h1 className="text-center text-3xl font-bold text-[#205781]">
          Create Which of the Image Quiz
        </h1>
      </div>

      <div className="mx-auto mt-12 w-[90%] px-4">
        <h2 className="mb-6 text-center text-xl font-bold text-[#205781]">
          Upload 4 Answer Images (Click to mark as correct)
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {answerImages.map((image, index) => (
            <div
              key={index}
              className={`relative h-64 cursor-pointer rounded-xl border-4 ${image.isCorrect ? "border-green-500" : "border-[#205781]"}`}
              onClick={() => handleSetCorrectAnswer(index)}
            >
              {image.src ? (
                <>
                  <img
                    src={image.src}
                    alt={`Answer option ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleAnswerImageUpload(index, e.target.files[0]);
                      }
                    }}
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <label className="flex cursor-pointer flex-col items-center">
                    <span className="text-lg font-medium text-[#205781]">
                      &#x2295; Add Image {index + 1}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleAnswerImageUpload(index, e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
              {image.isCorrect && (
                <div className="absolute bottom-2 left-2 rounded-full bg-green-500 px-3 py-1 text-white">
                  Correct
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex justify-center pl-36 pr-36 pt-10">
        <Input
          value={quizQuestion}
          onChange={(e) => setQuizQuestion(e.target.value)}
          placeholder="Enter your question (e.g. 'Which of these is correct?')"
          className="border-[#205781] bg-white text-[#205781] hover:border-[#98D2C0]"
        />
      </div>

      <div className="mt-12 flex justify-center gap-6 bg-[#98d5c0] pb-48">
        <Button
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition-all duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
          onClick={() => router.push(`/quiz/${quizId}/questions`)}
        >
          &#x2190; Back
        </Button>
        <Button
          type="button"
          onClick={handleDone}
          disabled={isSubmitting}
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition duration-300 ease-linear hover:bg-[#98D2C0]"
        >
          {isSubmitting ? "Adding..." : "\u2295 Add"}
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

export default WhichOfImg;
