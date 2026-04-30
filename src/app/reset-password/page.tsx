import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Ideal Cars",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
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
          <h1 className="mb-1 text-2xl font-bold text-navy">Set a new password</h1>
          <p className="mb-6 text-sm text-silver-dark">
            Choose a strong password you haven&apos;t used before.
          </p>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
