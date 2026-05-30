import { getAppUrl, sendEmail } from "@/lib/email";
import { verifyEmailTemplate } from "@/lib/email-templates";
import { createEmailToken, tokenExpiry } from "@/lib/email-tokens";
import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromCookies, unauthorizedResponse } from "@/lib/session";

export async function POST() {
  try {
    const userId = await getSessionUserIdFromCookies();

    if (!userId) return unauthorizedResponse();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) return unauthorizedResponse();

    if (user.emailVerified) {
      return Response.json({
        message: "Email is already verified",
      });
    }

    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId,
      },
    });

    const token = createEmailToken();

    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt: tokenExpiry(24),
      },
    });

    const verificationLink = `${getAppUrl()}/api/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your PathPayX email",
      html: verifyEmailTemplate({
        name: user.name,
        actionUrl: verificationLink,
      }),
    });

    return Response.json({
      message: "Verification email sent",
    });
  } catch (error) {
    console.log("RESEND VERIFICATION ERROR:", error);

    return Response.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
