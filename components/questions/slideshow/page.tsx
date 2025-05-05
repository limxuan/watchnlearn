"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

const SlideShowPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const quizId = params.quizid as string;

  const [images, setImages] = useState<
    Array<{
      src: string | null;
      url: string | null;
      file: File | null;
    }>
  >(
    Array(4).fill({
      src: null,
      url: null,
      file: null,
    }),
  );

  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("quiz-images")
      .upload(fileName, file);

    if (error) {
      console.error("Image upload failed:", error.message);
      throw new Error("Image upload failed");
    }

    const { data: publicUrlData } = supabase.storage
      .from("quiz-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const url = await uploadImage(file);
      const newImages = [...images];
      newImages[index] = {
        src: URL.createObjectURL(file),
        url,
        file,
      };
      setImages(newImages);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleDrop =
    (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleImageUpload(index, file);
      }
    };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelect =
    (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await handleImageUpload(index, file);
    };

  const handleOptionChange = (index: number, text: string) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = text;
    setOptions(updatedOptions);
  };

  const handleClear = () => {
    setImages(
      Array(4).fill({
        src: null,
        url: null,
        file: null,
      }),
    );
    setOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setQuizQuestion("");
  };

  const [quizQuestion, setQuizQuestion] = useState("");

  const handleDone = async () => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user || !quizId) {
        console.error("Authentication error or missing quiz ID");
        return;
      }

      // Filter out null URLs and get only the uploaded image URLs
      const imageUrls = images
        .map((img) => img.url)
        .filter((url): url is string => url !== null);

      const { data: question, error: questionsError } = await supabase
        .from("questions")
        .insert([
          {
            quiz_id: quizId,
            question_type: "slideshow",
            question_text: quizQuestion,
            image_urls: imageUrls,
            video_url: null,
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

      handleClear();

      router.push(`/quiz/${quizId}/questions`);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCheckbox = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions[index].isCorrect = !updatedOptions[index].isCorrect;
    setOptions(updatedOptions);
  };

  return (
    <div className="h-full bg-[#98d5c0]">
      <h1 className="pb-5 pt-7 text-center text-3xl font-bold text-[#205781]">
        Create Slideshow Question
      </h1>
      <h1 className="pb-5 text-center text-xl font-bold text-[#205781]">
        Upload up to 4 images for your slideshow
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {images.map((image, index) => (
          <div key={index} className="mx-4">
            <div
              onDrop={handleDrop(index)}
              onDragOver={handleDragOver}
              className="flex h-64 w-full items-center justify-center rounded-xl border-4 border-dashed border-[#205781] text-center text-[#205781] transition duration-200 ease-linear hover:bg-[#98D2C0]"
            >
              {image.src ? (
                <img
                  src={image.src}
                  alt={`Slide ${index + 1}`}
                  className="max-h-full max-w-full"
                />
              ) : (
                <p className="text-lg font-medium">
                  &#x2295; Drag & drop image {index + 1}
                </p>
              )}
            </div>
            <div className="flex justify-center pt-2">
              <Button
                className="w-auto border-[3px] border-[#205781] bg-white text-lg font-bold text-[#205781] transition-all duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
                onClick={() =>
                  document.getElementById(`fileInput-${index}`)?.click()
                }
              >
                &#128193; Browse
              </Button>
              <input
                id={`fileInput-${index}`}
                type="file"
                accept="image/*"
                onChange={handleFileSelect(index)}
                className="hidden"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center bg-[#98d5c0] pt-5">
        <Input
          value={quizQuestion}
          onChange={(e) => setQuizQuestion(e.target.value)}
          className="h-15 w-[150px] border-[3px] border-[#205781] bg-white font-bold text-[#205781] transition-all duration-200 ease-linear hover:border-[#98d2c0] md:w-[400px]"
          placeholder="Enter quiz Question"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 bg-[#98d5c0] pb-10 pl-10 pr-10 pt-5">
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
      <div className="flex justify-center gap-6 bg-[#98d5c0] pb-48">
        <Button
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition-all duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
          onClick={() => router.push(`/quiz/${quizId}/questions`)}
        >
          &#x2190; Back
        </Button>
        <Button
          type="button"
          onClick={handleDone}
          className="w-35 h-15 border-[3px] border-[#205781] bg-white text-xl font-bold text-[#205781] transition duration-300 ease-linear hover:bg-[#98D2C0]"
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

export default SlideShowPage;
