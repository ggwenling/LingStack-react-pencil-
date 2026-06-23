import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const GITHUB_STATE_COOKIE = "github_oauth_state";

function getAppUrl(request: NextRequest) {
  return process.env.APP_URL || request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=github_not_configured", request.url)
    );
  }

  const appUrl = getAppUrl(request);
  const state = randomBytes(32).toString("hex");
  const redirectUri = `${appUrl}/api/auth/github/callback`;
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");

  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "read:user user:email");
  authorizeUrl.searchParams.set("state", state);

  const cookieStore = await cookies();
  cookieStore.set(GITHUB_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  return NextResponse.redirect(authorizeUrl);
}
