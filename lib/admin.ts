import { prisma } from "@/lib/prisma";
import { isTerminatedAccount, terminatedAccountMessage } from "@/lib/account-status";
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
      accountStatus: true,
    },
  });

  if (user && isTerminatedAccount(user.accountStatus)) {
    return {
      user: null,
      response: Response.json(
        { error: terminatedAccountMessage },
        { status: 403 }
      ),
    };
  }

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
