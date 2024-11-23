import ContinueWithGoogleButton from "@/components/continue-with-google-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./login-form";
import Link from "next/link";

export default function Login() {
  return (
    <div>
      <Card>
        <CardHeader className="text-3xl font-bold">
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline pl-2">
            Register here.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
