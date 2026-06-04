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

    const customers = await prisma.customer.findMany({
      where: {
        userId,
      },
      include: {
        invoices: {
          select: {
            id: true,
            description: true,
            amount: true,
            currency: true,
            status: true,
            dueDate: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ customers });
  } catch (error) {
    console.log("GET CUSTOMERS ERROR:", error);

    return Response.json(
      { error: "Failed to load customers" },
      { status: 500 }
    );
  }
}
