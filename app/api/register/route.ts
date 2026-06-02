import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { getAppUrl, sendEmail } from "@/lib/email";
import { welcomeEmailTemplate } from "@/lib/email-templates";
import { createEmailToken, tokenExpiry } from "@/lib/email-tokens";
import {
  passwordPolicyMessage,
  validatePasswordPolicy,
} from "@/lib/password-policy";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!validatePasswordPolicy(password)) {
      return Response.json(
        { error: passwordPolicyMessage },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        balance: true,
        darkMode: true,
        emailVerified: true,
        accountStatus: true,
      },
    });

    const verificationToken = createEmailToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: tokenExpiry(24),
      },
    });

    const verificationLink = `${getAppUrl()}/api/verify-email?token=${verificationToken}`;

    let emailStatus:
      | { sent: true; id?: string }
      | { sent: false; error: string };

    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Welcome to PathPayX - verify your email",
        html: welcomeEmailTemplate({
          name: user.name,
          actionUrl: verificationLink,
        }),
      });

      emailStatus = {
        sent: true,
        id:
          typeof emailResult === "object" &&
          emailResult !== null &&
          "id" in emailResult &&
          typeof emailResult.id === "string"
            ? emailResult.id
            : undefined,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send verification email";

      console.log("WELCOME EMAIL ERROR:", error);

      emailStatus = {
        sent: false,
        error: message,
      };
    }

    const response = NextResponse.json({
      message: "Account created successfully. Check your email to verify your account.",
      user,
      emailStatus,
    });

    setSessionCookie(response, user.id);

    return response;
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
