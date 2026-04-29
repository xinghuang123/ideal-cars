import type { Metadata } from "next";
import Image from "next/image";
import SetPasswordForm from "./SetPasswordForm";

export const metadata: Metadata = {
  title: "Set Password | Ideal Cars",
  robots: { index: false, follow: false },
};

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image
            src="/images/logo-transparent.png"
            alt="Ideal Cars"
            width={200}
            height={60}
            priority
          />
          <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
            Admin
          </span>
        </div>
        <div className="rounded-xl border border-silver bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-navy">Set Your Password</h1>
          <p className="mb-6 text-sm text-silver-dark">
            Choose a password to finish setting up your account.
          </p>
          <SetPasswordForm />
        </div>
      </div>
    </div>
  );
}
