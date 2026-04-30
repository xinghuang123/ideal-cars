import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | Ideal Cars",
  description: "Create an Ideal Cars account to track your vehicle, service history, and finance.",
};

export default function SignupPage() {
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
          <h1 className="mb-1 text-2xl font-bold text-navy">Create your account</h1>
          <p className="mb-6 text-sm text-silver-dark">
            Track your car, service history, and finance applications.
          </p>
          <SignupForm />
          <p className="mt-6 text-center text-sm text-silver-dark">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
