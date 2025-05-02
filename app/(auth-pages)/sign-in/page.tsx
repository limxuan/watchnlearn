import { signInAction, signInWithGoogleAction } from "@/app/actions";
import FlexCenter from "@/components/flex-center";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc"; // Google icon
import Link from "next/link";
import GoogleSignInButton from "@/components/google-signin-button";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <FlexCenter>
      <form className="min-w-64 max-w-64">
        <h1 className="text-2xl font-medium">Sign in</h1>
        <p className="text-sm text-foreground">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium text-foreground underline"
            href="/sign-up"
          >
            Sign up
          </Link>
        </p>

        <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs text-foreground underline"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />

          <SubmitButton pendingText="Signing In..." formAction={signInAction}>
            Sign in
          </SubmitButton>

          <FormMessage message={searchParams} />
        </div>
        <GoogleSignInButton />
      </form>
    </FlexCenter>
  );
}
