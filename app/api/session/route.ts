import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromCookies, unauthorizedResponse } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserIdFromCookies();

  if (!userId) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
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
    },
  });

  if (!user) {
    return unauthorizedResponse();
  }

  return Response.json({ user });
}
