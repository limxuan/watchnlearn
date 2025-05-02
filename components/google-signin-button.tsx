"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL}/complete-profile`,
      },
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="h-5 w-5" />
      Sign in with Google
    </Button>
  );
}
