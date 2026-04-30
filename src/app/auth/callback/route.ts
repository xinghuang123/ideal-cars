import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const requestedRedirect = searchParams.get("redirect");
  const safeRedirect =
    requestedRedirect && requestedRedirect.startsWith("/")
      ? requestedRedirect
      : "/account";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  // After confirming email we either land them on the requested page (if signed in)
  // or send them to /login with a confirmed flag.
  if (safeRedirect === "/login" || safeRedirect.startsWith("/login")) {
    return NextResponse.redirect(`${origin}/login?confirmed=1`);
  }
  return NextResponse.redirect(`${origin}${safeRedirect}`);
}
