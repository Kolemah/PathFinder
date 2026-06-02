import { prisma } from "@/lib/prisma";
import { isTerminatedAccount, terminatedAccountMessage } from "@/lib/account-status";
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
      accountStatus: true,
    },
  });

  if (!user) {
    return unauthorizedResponse();
  }

  if (isTerminatedAccount(user.accountStatus)) {
    return Response.json(
      { error: terminatedAccountMessage },
      { status: 403 }
    );
  }

  return Response.json({ user });
}
