import { NextResponse, type NextRequest } from "next/server";

import { isSessionValid } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const valid = await isSessionValid(token);

  if (!valid) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/home/:path*"],
};
