import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="mx-auto flex min-w-64 max-w-64 flex-col">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text text-sm text-foreground">
          Already have an account?{" "}
          <Link className="font-medium text-primary underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
          <Label htmlFor="username">Username</Label>
          <Input name="username" placeholder="johnny123" required />
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <div className="flex items-center space-x-2">
            <Checkbox name="isLecturer" id="isLecturer" />
            <label
              htmlFor="isLecturer"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I am a lecturer 👨‍🏫
            </label>
          </div>
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <div className="h-4"></div>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
