import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import FlexCenter from "@/components/flex-center";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <FlexCenter>
      <Card className="w-full max-w-sm shadow-xl md:max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" action={resetPasswordAction}>
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="New password"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm password"
                required
              />
            </div>
            <SubmitButton>Reset password</SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </CardContent>
      </Card>
    </FlexCenter>
  );
}
