import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status === "banned") {
    await supabase.auth.signOut();
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("banned", "1");
    return NextResponse.redirect(loginUrl);
  }

  const roleSegment = pathname.split("/")[2]; // /dashboard/<role>/...
  if (
    profile.role !== "admin" &&
    roleSegment &&
    roleSegment !== profile.role
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return getResponse();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
