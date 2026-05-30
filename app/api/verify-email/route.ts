import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?email=missing-token", req.url));
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?email=expired", req.url));
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerified: true,
      },
    });

    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: verificationToken.userId,
      },
    });
  });

  return NextResponse.redirect(new URL("/login?email=verified", req.url));
}
