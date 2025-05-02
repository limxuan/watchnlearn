"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import useUserStore from "@/stores/useUserStore";
import { useRouter } from "next/navigation";

export default function CompleteProfile() {
  const supabase = createClient();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error: fetchError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single();

    if (data) {
      setError("This username is already taken.");
      return;
    }

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error(fetchError);
      setError("An error occurred. Please try again.");
      return;
    }

    const { error: insertError } = await supabase
      .from("users")
      .update({ username, role, pfp_url: user!.pfp_url })
      .eq("user_id", user!.user_id);

    if (insertError) {
      console.error(insertError);
      setError("An error occurred. Please try again.");
      return;
    }

    setUser({ ...user!, username, role });
    router.push("/dashboard");
  };

  return (
    <div className="flex w-full items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md rounded-2xl border border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Complete Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                required
              />
              {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value)}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
