import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminChrome from "./AdminChrome";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/set-password",
]);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-pathname") ?? "";

  // Defense in depth — middleware already gates /admin/*, but if it ever
  // misfires (matcher bug, deploy hiccup) the layout itself enforces.
  if (!PUBLIC_ADMIN_PATHS.has(pathname)) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const role =
      (data.user?.app_metadata as Record<string, unknown> | undefined)?.role;
    if (!data.user) {
      redirect("/admin/login");
    }
    if (role !== "admin") {
      redirect("/admin/login?error=not_admin");
    }
  }

  return <AdminChrome>{children}</AdminChrome>;
}
