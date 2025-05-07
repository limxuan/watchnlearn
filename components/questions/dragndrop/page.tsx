"use client";
import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const dnd = () => {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const quizId = params.quizId as string;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");

  const [options, setOptions] = useState([
    { id: 1, text: "", isCorrect: true, x: 25, y: 25, color: "bg-red-500" },
    { id: 2, text: "", isCorrect: true, x: 50, y: 50, color: "bg-blue-500" },
    { id: 3, text: "", isCorrect: true, x: 75, y: 75, color: "bg-green-500" },
  ]);

  const imageRef = useRef<HTMLImageElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`;
    const bucket = "quiz-images";

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload failed:", error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleDone = async () => {
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

      if (!imageURL) {
        alert("Please upload an image for the question");
        return;
      }

      if (options.some((opt) => !opt.text)) {
        alert("Please provide text for all answer options");
        return;
      }

      const imageUrlsArray = imageURL ? [imageURL] : [];

      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert([
          {
            quiz_id: quizId,
            question_type: "label-to-hotspot",
            question_text: quizQuestion,
            image_urls: imageUrlsArray,
            is_active: true,
          },
        ])
        .select("question_id")
        .single();

      if (questionError) throw questionError;

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(
          options.map((option) => ({
            question_id: question.question_id,
            option_text: option.text,
            pos_x: Math.round(option.x),
            pos_y: Math.round(option.y),
            is_correct: true,
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
  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;

    try {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      const publicUrl = await uploadImage(file);
      setImageURL(publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed");
    }
  };

  const handleClear = () => {
    setImageSrc(null);
    setImageURL(null);
    setQuizQuestion("");
    setOptions([
      { id: 1, text: "", isCorrect: true, x: 25, y: 25, color: "bg-red-500" },
      { id: 2, text: "", isCorrect: true, x: 50, y: 50, color: "bg-blue-500" },
      { id: 3, text: "", isCorrect: true, x: 75, y: 75, color: "bg-green-500" },
    ]);
  };

  const handleOptionChange = (id: number, value: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text: value } : opt)),
    );
  };

  const handleOptionPositionChange = (id: number, e: React.MouseEvent) => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    );

    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, x, y } : opt)),
    );
  };

  const handleOptionDrag = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    const move = (e: MouseEvent) => {
      handleOptionPositionChange(id, e as unknown as React.MouseEvent);
    };
    const cleanup = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", cleanup);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", cleanup);
  };

  return (
    <div className="min-h-screen bg-[#98d5c0]">
      <h1 className="pb-5 pt-7 text-center text-3xl font-bold text-[#205781]">
        Quiz Type: Drag & Drop
      </h1>

      <div className="mx-auto mt-8 w-[80%] space-y-4">
        <h2 className="text-center text-xl font-bold text-[#205781]">
          Answer Options (all correct with different colors)
        </h2>
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                placeholder={`Option ${option.id} (${option.color.replace("bg-", "").replace("-500", "")})`}
                className="border-[#205781] bg-white text-[#205781] hover:border-[#98D2C0]"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-center text-xl font-bold text-[#205781]">
          Create your drag & drop question
        </h2>
        <div className="mx-auto w-[90%] max-w-[800px] overflow-hidden rounded-xl border-4 border-dashed border-[#205781] bg-[#98d5c0]">
          <div className="relative aspect-[16/9] w-full">
            {imageSrc ? (
              <div
                className="relative h-full w-full"
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Question image"
                  className="h-full w-full object-cover"
                />
                {options.map((option) => (
                  <div
                    key={option.id}
                    className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full ${option.color} ring-2 ring-white`}
                    style={{
                      left: `${option.x}%`,
                      top: `${option.y}%`,
                    }}
                    onMouseDown={(e) => handleOptionDrag(option.id, e)}
                    title={`Option ${option.id} (${option.color.replace("bg-", "").replace("-500", "")})`}
                  />
                ))}
              </div>
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <p className="text-lg font-medium text-[#205781]">
                  &#x2295; Drag & drop question image
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center bg-[#98d5c0]">
          <Button
            className="border-[3px] border-[#205781] bg-[#98d5c0] text-[#205781] hover:bg-[#205781] hover:text-[#98d5c0]"
            onClick={() => document.getElementById("questionInput")?.click()}
          >
            Browse Question Image
          </Button>
          <input
            id="questionInput"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files?.[0]) {
                await handleImageDrop({
                  dataTransfer: { files: [e.target.files[0]] },
                  preventDefault: () => { },
                } as unknown as React.DragEvent<HTMLDivElement>);
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center bg-[#98d5c0] pb-10">
        <Input
          value={quizQuestion}
          onChange={(e) => setQuizQuestion(e.target.value)}
          className="w-[80%] border-[3px] border-[#205781] bg-white font-bold text-[#205781] transition-all duration-200 ease-linear hover:border-[#98d2c0]"
          placeholder="Enter quiz question (e.g. 'Identify the landmarks')"
        />
      </div>

      <div className="flex justify-center gap-6 bg-[#98d2c0] pb-48">
        <Button
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition-all duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
          onClick={() => router.push(`/quiz/${quizId}/questions`)}
        >
          &#x2190; Back
        </Button>

        <Button
          onClick={handleDone}
          disabled={
            !imageURL || isSubmitting || options.some((opt) => !opt.text)
          }
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition duration-300 ease-linear hover:bg-[#98D2C0]"
        >
          {isSubmitting ? "Saving..." : "Add Question"}
        </Button>
        <Button
          onClick={handleClear}
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition duration-300 ease-linear hover:bg-[#F29898]"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default dnd;
