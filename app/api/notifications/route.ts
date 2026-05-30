import { prisma } from "@/lib/prisma";
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

    if (!sessionUserId) return unauthorizedResponse();

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    return Response.json({ notifications });
  } catch (error) {
    console.log("GET NOTIFICATIONS ERROR:", error);

    return Response.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const body = await req.json();
    const { userId, message, href, type } = body;

    if (!sessionUserId) return unauthorizedResponse();

    if (!userId || !message) {
      return Response.json(
        { error: "User ID and message are required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        href: href || null,
        type: type || "system",
      },
    });

    return Response.json({
      message: "Notification created",
      notification,
    });
  } catch (error) {
    console.log("CREATE NOTIFICATION ERROR:", error);

    return Response.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!sessionUserId) return unauthorizedResponse();

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    await prisma.notification.deleteMany({
      where: {
        userId,
      },
    });

    return Response.json({
      message: "Notifications cleared",
    });
  } catch (error) {
    console.log("CLEAR NOTIFICATIONS ERROR:", error);

    return Response.json(
      { error: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}
