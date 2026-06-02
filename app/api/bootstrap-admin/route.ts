import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromCookies, unauthorizedResponse } from "@/lib/session";

export async function POST() {
  const userId = await getSessionUserIdFromCookies();

  if (!userId) return unauthorizedResponse();

  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: "Admin",
    },
    select: {
      id: true,
    },
  });

  if (existingAdmin) {
    return Response.json(
      { error: "Admin account already exists" },
      { status: 403 }
    );
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: "Admin",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
    },
  });

  return Response.json({
    message: "Admin account created",
    user,
  });
}
