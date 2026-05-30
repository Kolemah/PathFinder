import { prisma } from "@/lib/prisma";
import {
  forbiddenResponse,
  getSessionUserIdFromCookies,
  unauthorizedResponse,
} from "@/lib/session";

export async function requireAdminUser() {
  const sessionUserId = await getSessionUserIdFromCookies();

  if (!sessionUserId) {
    return {
      user: null,
      response: unauthorizedResponse(),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: sessionUserId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "Admin") {
    return {
      user: null,
      response: forbiddenResponse(),
    };
  }

  return {
    user,
    response: null,
  };
}
