import { prisma } from "@/lib/prisma";
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
      },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
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
    const { userId, name, email, role, photo, balance, darkMode } = body;

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

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(role !== undefined ? { role } : {}),
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
