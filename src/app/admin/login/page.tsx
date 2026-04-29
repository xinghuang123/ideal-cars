import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Ideal Cars",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const initialError =
    searchParams.error === "not_admin"
      ? "This account does not have admin access."
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-silver bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-navy">Staff Sign In</h1>
          <p className="mb-6 text-sm text-silver-dark">
            Restricted access. Contact the site owner if you need an account.
          </p>
          <LoginForm initialError={initialError} />
        </div>
      </div>
    </div>
  );
}
