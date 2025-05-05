"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const VidQn: React.FC = () => {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const uploadVideo = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("quiz-images")
      .upload(fileName, file);

    if (error) {
      console.error("Video upload failed:", error.message);
      throw new Error("Video upload failed");
    }

    const { data: publicUrlData } = supabase.storage
      .from("quiz-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!validVideoTypes.includes(file.type)) {
        alert("Please upload a valid video file (MP4, WebM, or Ogg)");
        return;
      }

      const maxSizeMB = 50;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Video must be smaller than ${maxSizeMB}MB`);
        return;
      }

      const url = await uploadVideo(file);
      setVideoSrc(URL.createObjectURL(file));
      setVideoURL(url);
    } catch (err) {
      console.error("Video upload failed:", err);
      alert("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleVideoUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleVideoUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleOptionChange = (index: number, text: string) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = text;
    setOptions(updatedOptions);
  };

  const handleCheckbox = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions.forEach((option, idx) => (option.isCorrect = idx === index));
    setOptions(updatedOptions);
  };

  const handleClear = () => {
    setVideoSrc(null);
    setVideoURL(null);
    setQuizQuestion("");
    setOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  };

  const handleDone = async () => {
    if (!videoURL) {
      alert("Please upload a video first");
      return;
    }

    if (!quizQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    if (options.some((opt) => !opt.text.trim())) {
      alert("Please fill in all options");
      return;
    }

    if (!options.some((opt) => opt.isCorrect)) {
      alert("Please select a correct answer");
      return;
    }

    if (!quizId) {
      alert("Missing quiz ID");
      return;
    }

    try {
      const { data: question, error: questionsError } = await supabase
        .from("questions")
        .insert([
          {
            quiz_id: quizId,
            question_type: "video",
            question_text: quizQuestion,
            video_url: videoURL,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (questionsError) throw questionsError;

      const optionInserts = options.map((option) => ({
        question_id: question.question_id,
        option_text: option.text,
        is_correct: option.isCorrect,
        is_active: true,
      }));

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(optionInserts);

      if (optionsError) throw optionsError;

      router.push(`/quiz/${quizId}/questions`);

      alert("Question added successfully!");
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Failed to save question. Please try again.");
    }
  };

  return (
    <div className="bg-[#98d2c0]">
      <h1 className="pb-5 pt-7 text-center text-3xl font-bold text-[#205781]">
        Create Video Question
      </h1>

      <div className="pb-5 text-center text-xl font-bold text-[#205781]">
        Drop your question video below! (less than 50mb)
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="mx-auto flex h-64 w-[80%] items-center justify-center rounded-xl border-4 border-dashed border-[#205781] text-center text-[#205781] transition duration-200 ease-linear hover:bg-[#98D2C0]"
      >
        {videoSrc ? (
          <video src={videoSrc} className="max-h-full max-w-full" controls />
        ) : isUploading ? (
          <p className="text-lg font-medium">Uploading...</p>
        ) : (
          <p className="text-lg font-medium">
            &#x2295; Drag & drop video here!
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 py-6">
        <Button
          className="w-auto border-[3px] border-[#205781] bg-[#98d2c0] text-xl font-bold text-[#205781] transition-all duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
          onClick={() => document.getElementById("fileInput")?.click()}
          disabled={isUploading}
        >
          &#128193; Browse Files
        </Button>
        <input
          id="fileInput"
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <div className="flex items-center justify-center bg-[#98d2c0] pt-5">
        <Input
          value={quizQuestion}
          onChange={(e) => setQuizQuestion(e.target.value)}
          className="h-15 w-[150px] border-[3px] border-[#205781] bg-white font-bold text-[#205781] transition-all duration-200 ease-linear hover:border-[#98d2c0] md:w-[400px]"
          placeholder="Enter quiz question"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 bg-[#98d2c0] pb-10 pl-10 pr-10 pt-5">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-4">
            <Input
              className="h-15 border-[3px] border-[#205781] bg-white font-bold text-[#205781] transition-all duration-200 ease-linear hover:border-[#98d2c0]"
              placeholder={`Option ${index + 1}`}
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
            <Checkbox
              className="fg-[#f6f8d5] border-[2px] border-[#205781] data-[state=checked]:border-[#205781] data-[state=checked]:bg-[#205781]"
              checked={option.isCorrect}
              onCheckedChange={() => handleCheckbox(index)}
            />
            <Label className="font-bold text-[#205781]">Set as Answer</Label>
          </div>
        ))}
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
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition duration-300 ease-linear hover:bg-[#98D2C0]"
          disabled={isUploading}
        >
          &#x2295; Add
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

export default VidQn;
