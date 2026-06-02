import { prisma } from "@/lib/prisma";
import { getInvoiceStatus } from "@/lib/invoice-status";
import {
  PAYMENT_STATUS_PENDING_CLEARANCE,
  calculateWalletAmounts,
  paymentAvailableAt,
} from "@/lib/wallet";
import {
  forbiddenResponse,
  getSessionUserIdFromCookies,
  unauthorizedResponse,
} from "@/lib/session";
import {
  isRestrictedAccount,
  isTerminatedAccount,
  restrictedAccountMessage,
  terminatedAccountMessage,
} from "@/lib/account-status";

function defaultDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);
  return dueDate;
}

function paymentReference(invoiceId: string) {
  return `MANUAL-${invoiceId.slice(-8).toUpperCase()}-${Date.now()}`;
}

async function getInvoiceAccountAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      emailVerified: true,
      accountStatus: true,
    },
  });

  if (!user) {
    return { allowed: false, error: "User not found", status: 404 };
  }

  if (!user.emailVerified) {
    return {
      allowed: false,
      error: "Please verify your email before creating invoices.",
      status: 403,
    };
  }

  if (isTerminatedAccount(user.accountStatus)) {
    return { allowed: false, error: terminatedAccountMessage, status: 403 };
  }

  if (isRestrictedAccount(user.accountStatus)) {
    return {
      allowed: false,
      error: restrictedAccountMessage("invoice"),
      status: 403,
    };
  }

  return { allowed: true };
}

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

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ invoices });
  } catch (error) {
    console.log("GET INVOICES ERROR:", error);

    return Response.json(
      { error: "Failed to load invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const body = await req.json();

    const {
      userId,
      sourceInvoiceId,
      name,
      gmail,
      country,
      state,
      address,
      zipcode,
      description,
      amount,
    } = body;

    if (!sessionUserId) return unauthorizedResponse();

    if (sourceInvoiceId) {
      if (!userId) {
        return Response.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      if (userId !== sessionUserId) return forbiddenResponse();

      const access = await getInvoiceAccountAccess(userId);

      if (!access.allowed) {
        return Response.json(
          { error: access.error },
          { status: access.status }
        );
      }

      const sourceInvoice = await prisma.invoice.findFirst({
        where: {
          id: sourceInvoiceId,
          userId,
        },
        include: {
          customer: true,
        },
      });

      if (!sourceInvoice) {
        return Response.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      if (
        getInvoiceStatus(sourceInvoice.status, sourceInvoice.dueDate) !==
        "Overdue"
      ) {
        return Response.json(
          { error: "Only expired invoices can be renewed" },
          { status: 400 }
        );
      }

      const invoice = await prisma.invoice.create({
        data: {
          description: sourceInvoice.description,
          amount: sourceInvoice.amount,
          status: "Pending",
          dueDate: defaultDueDate(),
          userId,
          customerId: sourceInvoice.customerId,
        },
        include: {
          customer: true,
        },
      });

      return Response.json({
        message: "New invoice created from expired invoice",
        invoice,
      });
    }

    if (
      !userId ||
      !name ||
      !gmail ||
      !country ||
      !state ||
      !address ||
      !zipcode ||
      !description ||
      !amount
    ) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const access = await getInvoiceAccountAccess(userId);

    if (!access.allowed) {
      return Response.json(
        { error: access.error },
        { status: access.status }
      );
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return Response.json(
        { error: "Amount must be a valid dollar amount." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: gmail,
        country,
        state,
        address,
        zipcode,
        userId,
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        description,
        amount: Number(amount),
        status: "Pending",
        dueDate: defaultDueDate(),
        userId,
        customerId: customer.id,
      },
      include: {
        customer: true,
      },
    });

    return Response.json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.log("CREATE INVOICE ERROR:", error);

    return Response.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const body = await req.json();
    const {
      id,
      userId,
      status,
      name,
      gmail,
      country,
      state,
      address,
      zipcode,
      description,
      amount,
      dueDate,
    } = body;

    if (!sessionUserId) return unauthorizedResponse();

    if (!id || !userId) {
      return Response.json(
        { error: "Invoice ID and user ID are required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!invoice) {
      return Response.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (
      status === "Paid" &&
      getInvoiceStatus(invoice.status, invoice.dueDate) === "Overdue"
    ) {
      return Response.json(
        { error: "Invoice expired" },
        { status: 410 }
      );
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const isMarkingPaid = status === "Paid" && invoice.status !== "Paid";
      const paidAt = new Date();

      if (
        name !== undefined ||
        gmail !== undefined ||
        country !== undefined ||
        state !== undefined ||
        address !== undefined ||
        zipcode !== undefined
      ) {
        await tx.customer.update({
          where: {
            id: invoice.customerId,
          },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(gmail !== undefined ? { email: gmail } : {}),
            ...(country !== undefined ? { country } : {}),
            ...(state !== undefined ? { state } : {}),
            ...(address !== undefined ? { address } : {}),
            ...(zipcode !== undefined ? { zipcode } : {}),
          },
        });
      }

      return tx.invoice.update({
        where: {
          id,
        },
        data: {
          ...(status !== undefined ? { status } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(amount !== undefined ? { amount: Number(amount) } : {}),
          ...(dueDate !== undefined ? { dueDate: new Date(dueDate) } : {}),
          ...(isMarkingPaid
            ? {
                paidAt,
                paymentAvailableAt: paymentAvailableAt(paidAt),
                paymentMethod: "Manual",
                paymentReference: paymentReference(id),
                paymentStatus: PAYMENT_STATUS_PENDING_CLEARANCE,
                checkoutProvider: "Internal Test",
                ...calculateWalletAmounts(invoice.amount),
              }
            : {}),
        },
        include: {
          customer: true,
        },
      });
    });

    return Response.json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.log("UPDATE INVOICE ERROR:", error);

    return Response.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!sessionUserId) return unauthorizedResponse();

    if (!id || !userId) {
      return Response.json(
        { error: "Invoice ID and user ID are required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!invoice) {
      return Response.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    await prisma.invoice.delete({
      where: {
        id,
      },
    });

    return Response.json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.log("DELETE INVOICE ERROR:", error);

    return Response.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
