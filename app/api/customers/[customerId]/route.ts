import { prisma } from "@/lib/prisma";
import {
  getSessionUserIdFromCookies,
  unauthorizedResponse,
} from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const { customerId } = await params;

    if (!sessionUserId) return unauthorizedResponse();

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: sessionUserId,
      },
      include: {
        invoices: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            description: true,
            amount: true,
            currency: true,
            status: true,
            dueDate: true,
            paidAt: true,
            paymentReference: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      return Response.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return Response.json({ customer });
  } catch (error) {
    console.log("GET CUSTOMER ERROR:", error);

    return Response.json(
      { error: "Failed to load customer" },
      { status: 500 }
    );
  }
}
