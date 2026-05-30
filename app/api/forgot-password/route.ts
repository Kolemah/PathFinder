import { prisma } from "@/lib/prisma";
import { getAppUrl, sendEmail } from "@/lib/email";
import { passwordResetTemplate } from "@/lib/email-templates";
import { createEmailToken, tokenExpiry } from "@/lib/email-tokens";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (user) {
      const token = createEmailToken();

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: tokenExpiry(1),
        },
      });

      const resetLink = `${getAppUrl()}/reset-password?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your PathPayX password",
        html: passwordResetTemplate({
          name: user.name,
          actionUrl: resetLink,
        }),
      }).catch((error) => {
        console.log("PASSWORD RESET EMAIL ERROR:", error);
      });
    }

    return Response.json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);

    return Response.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
