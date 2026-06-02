import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { isTerminatedAccount } from "@/lib/account-status";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GOOGLE_STATE_COOKIE = "pathfinder_google_state";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

type GoogleUser = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Google OAuth credentials are not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const tokenData = await tokenRes.json();

  const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const googleUser = (await userInfoRes.json()) as GoogleUser;

  if (!googleUser.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const randomPassword = await bcrypt.hash(randomBytesFallback(), 10);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: googleUser.email,
    },
    select: {
      accountStatus: true,
    },
  });

  if (isTerminatedAccount(existingUser?.accountStatus)) {
    return NextResponse.redirect(new URL("/login?account=terminated", req.url));
  }

  const user = await prisma.user.upsert({
    where: {
      email: googleUser.email,
    },
    update: {
      googleId: googleUser.sub,
      name: googleUser.name || googleUser.email,
      photo: googleUser.picture || "",
    },
    create: {
      email: googleUser.email,
      name: googleUser.name || googleUser.email,
      googleId: googleUser.sub,
      photo: googleUser.picture || "",
      password: randomPassword,
      emailVerified: true,
    },
    select: {
      id: true,
      accountStatus: true,
    },
  });

  if (isTerminatedAccount(user.accountStatus)) {
    return NextResponse.redirect(new URL("/login?account=terminated", req.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  setSessionCookie(response, user.id);
  response.cookies.set({
    name: GOOGLE_STATE_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}

function randomBytesFallback() {
  return Math.random().toString(36) + Date.now().toString(36);
}
