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

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ transactions });
  } catch (error) {
    console.log("GET TRANSACTIONS ERROR:", error);

    return Response.json(
      { error: "Failed to load transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const body = await req.json();
    const { userId, type, amount } = body;

    if (!sessionUserId) return unauthorizedResponse();

    if (!userId || !type || !amount) {
      return Response.json(
        { error: "User ID, type, and amount are required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: Number(amount),
      },
    });

    return Response.json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.log("CREATE TRANSACTION ERROR:", error);

    return Response.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
