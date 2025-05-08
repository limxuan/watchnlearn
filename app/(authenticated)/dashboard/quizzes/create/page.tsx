"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";

export default function CreateQuizPage() {
  const [quizName, setQuizName] = useState("");
  const [description, setDescription] = useState("");
  const [publicVisibility, setPublicVisibility] = useState(false);

  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateQuiz = async () => {
    if (!quizName || !description || !coverFile) {
      alert("Please fill in all fields and upload a cover image.");
      return;
    }

    setUploading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      alert("You must be logged in.");
      setUploading(false);
      return;
    }

    const quizId = uuidv4();
    const fileExt = coverFile.name.split(".").pop();
    const fileName = `${quizId}.${fileExt}`;

    // 1. Upload to quiz-images
    const { error: uploadError } = await supabase.storage
      .from("quiz-images")
      .upload(fileName, coverFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert(`Failed to upload cover image: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from("quiz-images")
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      alert("Failed to generate public URL for the image");
      setUploading(false);
      return;
    }

    const coverUrl = urlData.publicUrl;

    // 3. Insert quiz data
    const { error: insertError } = await supabase.from("quizzes").insert({
      quiz_id: quizId,
      user_id: user.id,
      name: quizName,
      description: description,
      quiz_cover_url: coverUrl,
      join_code: Math.random().toString(36).substring(2, 8),
      public_visibility: publicVisibility,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      alert(`Failed to create quiz: ${insertError.message}`);
      setUploading(false);
      return;
    }

    setUploading(false);

    router.push(`/quiz/${quizId}/questions`);
  };

  const handleCoverClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        if (!files[0].type.startsWith("image/")) {
          alert("Please upload an image file");
          return;
        }
        const file = files[0];
        const url = URL.createObjectURL(file);
        setCoverSrc(url);
        setCoverFile(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    setQuizName("");
    setDescription("");
    setCoverSrc(null);
    setPublicVisibility(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-center text-3xl font-bold text-[#205781]">
        Create a New Quiz
      </h1>
      <Input
        placeholder="Quiz Name"
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
      />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="space-y-4 px-4">
        <h2 className="text-center text-xl font-bold text-[#205781]">
          Quiz Cover Image
        </h2>
        <div
          onDrop={(e) => e.preventDefault()}
          onClick={handleCoverClick}
          className="mx-auto flex h-64 w-[80%] cursor-pointer items-center justify-center rounded-xl border-4 border-dashed border-[#205781] text-center text-[#205781] transition hover:bg-[#98D2C0]"
        >
          {coverSrc ? (
            <img
              src={coverSrc}
              alt="Cover preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <p className="text-lg font-normal">
              &#x2295; Click to add cover image
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-[80%] justify-center px-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="public-toggle"
            checked={publicVisibility}
            onCheckedChange={(c) => setPublicVisibility(!!c)}
            className="border-[#205781] data-[state=checked]:bg-[#205781]"
          />
          <Label htmlFor="public-toggle" className="text-[#205781]">
            Make quiz public
          </Label>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button
          onClick={() => router.push("/dashboard/quizzes")}
          className="w-25 h-10 border-[2px] border-[#205781] bg-[#98D2C0] text-lg font-semibold text-[#205781] transition duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
        >
          &#8592; Back
        </Button>
        <Button
          onClick={handleCreateQuiz}
          disabled={uploading}
          className="w-25 h-10 border-[2px] border-[#205781] bg-[#98D2C0] text-lg font-semibold text-[#205781] transition duration-300 ease-linear hover:bg-[#205781] hover:text-[#f6f8d5]"
        >
          {uploading ? "Starting..." : "Next"}
        </Button>
        <Button
          onClick={handleClear}
          className="w-25 h-10 border-[2px] border-[#205781] bg-[#98D2C0] text-lg font-semibold text-[#205781] transition duration-300 ease-linear hover:bg-[#F29898]"
        >
          &#x2715; Clear
        </Button>
      </div>
    </div>
  );
}
