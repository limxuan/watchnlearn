"use client";
import React, { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ImgHotspot: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const quizId = params.quizId as string;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hotspots, setHotspots] = useState<
    { x: number; y: number; isCorrect: boolean }[]
  >([
    { x: 25, y: 25, isCorrect: false },
    { x: 50, y: 50, isCorrect: true },
    { x: 75, y: 75, isCorrect: false },
  ]);
  const imageRef = useRef<HTMLImageElement>(null);

  const uploadImage = async (
    file: File,
    isCover: boolean = false,
  ): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`;
    const bucket = "quiz-images";
    let imageFile = file;

    if (!isCover) {
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");

      const originalWidth = imageBitmap.width;
      const originalHeight = imageBitmap.height;
      const targetAspect = 16 / 9;

      let cropWidth = originalWidth;
      let cropHeight = cropWidth / targetAspect;

      if (cropHeight > originalHeight) {
        cropHeight = originalHeight;
        cropWidth = cropHeight * targetAspect;
      }

      const cropX = (originalWidth - cropWidth) / 2;
      const cropY = (originalHeight - cropHeight) / 2;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return null;
      }

      ctx.drawImage(
        imageBitmap,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg"),
      );

      if (!blob) {
        console.error("Canvas toBlob failed");
        return null;
      }

      imageFile = new File([blob], file.name, { type: "image/jpeg" });
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, imageFile, {
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
    if (!imageURL) {
      alert("Please upload a question image.");
      return;
    }

    const correctHotspot = hotspots.find((h) => h.isCorrect);
    if (!correctHotspot) {
      alert("Please mark one hotspot as correct by clicking on it");
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        alert(
          "You need to be logged in to create quizzes. Please sign in and try again.",
        );
        return;
      }

      const imageUrlsArray = imageURL ? [imageURL] : [];

      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert([
          {
            quiz_id: quizId,
            question_type: "hotspot-mcq",
            question_text: quizQuestion,
            image_urls: imageUrlsArray,
            video_url: null,
            is_active: true,
          },
        ])
        .select("question_id, question_text")
        .single();

      if (questionError) throw questionError;

      // Prepare all hotspot options (1 correct and 2 incorrect)
      const hotspotOptions = hotspots.map((hotspot) => ({
        question_id: question.question_id,
        option_text: hotspot.isCorrect
          ? "Correct hotspot location"
          : "Incorrect hotspot location",
        pos_x: Math.round(hotspot.x),
        pos_y: Math.round(hotspot.y),
        is_correct: hotspot.isCorrect,
        is_active: true,
      }));

      // Insert all hotspot options at once
      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(hotspotOptions);

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
    setHotspots([
      { x: 25, y: 25, isCorrect: false },
      { x: 50, y: 50, isCorrect: true },
      { x: 75, y: 75, isCorrect: false },
    ]);
  };

  const setCorrectHotspot = (index: number) => {
    setHotspots((prevHotspots) =>
      prevHotspots.map((hotspot, i) => ({
        ...hotspot,
        isCorrect: i === index,
      })),
    );
  };

  const handleHotspotInteraction = (index: number, e: React.MouseEvent) => {
    if (e.type === "click") {
      setCorrectHotspot(index);
      return;
    }

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

    setHotspots((prev) => {
      const newHotspots = [...prev];
      newHotspots[index] = { ...newHotspots[index], x, y };
      return newHotspots;
    });
  };

  return (
    <div className="min-h-screen bg-[#98d5c0]">
      <h1 className="pb-5 pt-7 text-center text-3xl font-bold text-[#205781]">
        Quiz Type: Image Hotspot Quiz
      </h1>

      <div className="mt-8 space-y-4 bg-[#98d5c0]">
        <h2 className="text-center text-xl font-bold text-[#205781]">
          Create your hotspot question <br /> (click one of the dots to set as
          ans)
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
                {hotspots.map((spot, i) => (
                  <div
                    key={i}
                    className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full ${
                      spot.isCorrect
                        ? "bg-red-500 ring-2 ring-white"
                        : "bg-blue-500"
                    }`}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const move = (e: MouseEvent) =>
                        handleHotspotInteraction(
                          i,
                          e as unknown as React.MouseEvent,
                        );
                      const cleanup = () => {
                        window.removeEventListener("mousemove", move);
                        window.removeEventListener("mouseup", cleanup);
                      };
                      window.addEventListener("mousemove", move);
                      window.addEventListener("mouseup", cleanup);
                    }}
                    onClick={(e) => handleHotspotInteraction(i, e)}
                    title={
                      spot.isCorrect ? "Correct answer" : "Mark as correct"
                    }
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
            className="border-[3px] border-[#205781] bg-white text-[#205781] hover:bg-[#205781] hover:text-[#f6f8d5]"
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
                  preventDefault: () => {},
                } as unknown as React.DragEvent<HTMLDivElement>);
              }
            }}
            className="hidden"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-center bg-[#98d5c0]">
        <Input
          value={quizQuestion}
          onChange={(e) => setQuizQuestion(e.target.value)}
          className="w-[80%] border-[3px] border-[#205781] bg-white font-bold text-[#205781] transition-all duration-200 ease-linear hover:border-[#98d2c0]"
          placeholder="Enter quiz question (e.g. 'Identify the landmarks')"
        />
      </div>

      <div className="mt-8 flex justify-center gap-4 bg-[#98d5c0] pb-12">
        <Button
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition-all duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
          onClick={() => router.push(`/quiz/${quizId}/questions`)}
        >
          &#x2190; Back
        </Button>
        <Button
          onClick={() => handleDone()}
          disabled={!imageURL || isSubmitting}
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

export default ImgHotspot;
