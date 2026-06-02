import { prisma } from "@/lib/prisma";
import { isTerminatedAccount, terminatedAccountMessage } from "@/lib/account-status";
import { releaseMaturedPayments } from "@/lib/wallet-release";
import {
  forbiddenResponse,
  getSessionUserIdFromCookies,
  unauthorizedResponse,
} from "@/lib/session";

export async function GET(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!sessionUserId) {
      return unauthorizedResponse();
    }

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) {
      return forbiddenResponse();
    }

    await releaseMaturedPayments(userId);

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
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (isTerminatedAccount(user.accountStatus)) {
      return Response.json(
        { error: terminatedAccountMessage },
        { status: 403 }
      );
    }

    return Response.json({ user });
  } catch (error) {
    console.log("GET USER ERROR:", error);

    return Response.json(
      { error: "Failed to load user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const body = await req.json();
    const { userId, name, email, photo, balance, darkMode } = body;

    if (!sessionUserId) {
      return unauthorizedResponse();
    }

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) {
      return forbiddenResponse();
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        accountStatus: true,
      },
    });

    if (isTerminatedAccount(existingUser?.accountStatus)) {
      return Response.json(
        { error: terminatedAccountMessage },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(photo !== undefined ? { photo } : {}),
        ...(balance !== undefined ? { balance: Number(balance) } : {}),
        ...(darkMode !== undefined ? { darkMode: Boolean(darkMode) } : {}),
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

    return Response.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log("UPDATE USER ERROR:", error);

    return Response.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
