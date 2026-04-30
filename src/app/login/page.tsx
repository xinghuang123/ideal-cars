import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | Ideal Cars",
  description: "Sign in to your Ideal Cars account.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; confirmed?: string };
}) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Link href="/">
            <Image
              src="/images/logo-transparent.png"
              alt="Ideal Cars"
              width={200}
              height={60}
              priority
            />
          </Link>
        </div>
        <div className="rounded-xl border border-silver bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-navy">Welcome back</h1>
          <p className="mb-6 text-sm text-silver-dark">
            Sign in to manage your vehicle and service history.
          </p>
          {searchParams.confirmed === "1" && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              Email confirmed. You can now sign in.
            </div>
          )}
          <LoginForm redirectTo={searchParams.redirect} />
          <div className="mt-6 flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-silver-dark hover:text-accent"
            >
              Forgot password?
            </Link>
            <Link
              href="/signup"
              className="font-medium text-accent hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
