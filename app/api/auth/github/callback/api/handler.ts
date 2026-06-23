import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { createUserSession, setSessionCookie } from "@/lib/auth/session";

const GITHUB_STATE_COOKIE = "github_oauth_state";

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
};

type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
};

function getAppUrl(request: NextRequest) {
  return process.env.APP_URL || request.nextUrl.origin;
}

function redirectToLogin(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
}

async function createFailedAudit(input: {
  email?: string;
  userId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  reason: string;
}) {
  await prisma.loginAudit.create({
    data: {
      email: input.email || "github_oauth_unknown",
      userId: input.userId,
      result: "FAILED",
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      reason: input.reason,
    },
  });
}

async function exchangeCodeForToken(request: NextRequest, code: string) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth is not configured");
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${getAppUrl(request)}/api/auth/github/callback`,
    }),
  });

  if (!response.ok) {
    throw new Error("GitHub token exchange failed");
  }

  const tokenData = (await response.json()) as GitHubTokenResponse;

  if (!tokenData.access_token || tokenData.error) {
    throw new Error(tokenData.error_description || "GitHub access token missing");
  }

  return tokenData.access_token;
}

async function fetchGitHubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error("GitHub user request failed");
  }

  return (await response.json()) as GitHubUser;
}

async function fetchVerifiedPrimaryEmail(accessToken: string) {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error("GitHub email request failed");
  }

  const emails = (await response.json()) as GitHubEmail[];
  return (
    emails.find((item) => item.primary && item.verified)?.email ||
    emails.find((item) => item.verified)?.email
  );
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const requestCookies = await cookies();
  const savedState = requestCookies.get(GITHUB_STATE_COOKIE)?.value;
  const ipAddress = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");

  requestCookies.delete(GITHUB_STATE_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    await createFailedAudit({
      ipAddress,
      userAgent,
      reason: "Invalid GitHub OAuth state",
    });

    return redirectToLogin(request, "github_state_invalid");
  }

  try {
    const accessToken = await exchangeCodeForToken(request, code);
    const [githubUser, email] = await Promise.all([
      fetchGitHubUser(accessToken),
      fetchVerifiedPrimaryEmail(accessToken),
    ]);

    if (!email) {
      await createFailedAudit({
        ipAddress,
        userAgent,
        reason: "GitHub verified email missing",
      });

      return redirectToLogin(request, "github_email_unverified");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const providerAccountId = String(githubUser.id);
    const providerUsername = githubUser.login;

    const user = await prisma.$transaction(async (tx) => {
      const linkedAccount = await tx.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "GITHUB",
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

      if (linkedAccount) {
        return linkedAccount.user;
      }

      const existingUser = await tx.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (existingUser) {
        await tx.oAuthAccount.create({
          data: {
            userId: existingUser.id,
            provider: "GITHUB",
            providerAccountId,
            providerUsername,
          },
        });

        return existingUser;
      }

      return tx.user.create({
        data: {
          email: normalizedEmail,
          name: githubUser.name || githubUser.login,
          passwordHash: null,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
          oauthAccounts: {
            create: {
              provider: "GITHUB",
              providerAccountId,
              providerUsername,
            },
          },
        },
      });
    });

    if (user.status !== "ACTIVE") {
      await createFailedAudit({
        email: user.email,
        userId: user.id,
        ipAddress,
        userAgent,
        reason: "User is not active",
      });

      return redirectToLogin(request, "account_disabled");
    }

    const session = await createUserSession({
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
    });

    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.redirect(new URL("/home", request.url));
  } catch (error) {
    await createFailedAudit({
      ipAddress,
      userAgent,
      reason: error instanceof Error ? error.message : "GitHub OAuth failed",
    });

    return redirectToLogin(request, "github_oauth_failed");
  }
}
