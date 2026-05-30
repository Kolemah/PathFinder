import { prisma } from "@/lib/prisma";
import { getInvoiceStatus } from "@/lib/invoice-status";
import {
  PAYMENT_STATUS_PENDING_CLEARANCE,
  calculateWalletAmounts,
  formatUsd,
  paymentAvailableAt,
} from "@/lib/wallet";
import { sendEmail } from "@/lib/email";
import { invoicePaidTemplate } from "@/lib/email-templates";

function invoiceResponse(invoice: {
  id: string;
  description: string;
  amount: number;
  status: string;
  dueDate: Date;
  paidAt: Date | null;
  paymentAvailableAt: Date | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentStatus: string;
  checkoutProvider: string | null;
  platformFeeRate: number;
  platformFeeUsd: number;
  netAmountUsd: number;
  netAmountNgn: number;
  exchangeRate: number;
  fundsReleasedAt: Date | null;
  customer: {
    name: string;
    email: string;
    country: string;
    state: string;
    address: string;
    zipcode: string;
  };
  user: {
    name: string;
    email: string;
  };
}) {
  return {
    id: invoice.id,
    description: invoice.description,
    amount: invoice.amount,
    status: invoice.status,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    paymentAvailableAt: invoice.paymentAvailableAt,
    paymentMethod: invoice.paymentMethod,
    paymentReference: invoice.paymentReference,
    paymentStatus: invoice.paymentStatus,
    checkoutProvider: invoice.checkoutProvider,
    platformFeeRate: invoice.platformFeeRate,
    platformFeeUsd: invoice.platformFeeUsd,
    netAmountUsd: invoice.netAmountUsd,
    netAmountNgn: invoice.netAmountNgn,
    exchangeRate: invoice.exchangeRate,
    fundsReleasedAt: invoice.fundsReleasedAt,
    customer: invoice.customer,
    business: invoice.user,
  };
}

function paymentReference(invoiceId: string) {
  return `TEST-${invoiceId.slice(-8).toUpperCase()}-${Date.now()}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      customer: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invoice) {
    return Response.json(
      { error: "Invoice not found" },
      { status: 404 }
    );
  }

  return Response.json({
    invoice: invoiceResponse(invoice),
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      customer: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invoice) {
    return Response.json(
      { error: "Invoice not found" },
      { status: 404 }
    );
  }

  if (invoice.status === "Paid") {
    return Response.json({
      message: "Invoice is already paid",
      invoice: invoiceResponse(invoice),
    });
  }

  if (getInvoiceStatus(invoice.status, invoice.dueDate) === "Overdue") {
    return Response.json(
      {
        error: "Invoice expired",
        invoice: invoiceResponse(invoice),
      },
      { status: 410 }
    );
  }

  const paidInvoice = await prisma.$transaction(async (tx) => {
    const paidAt = new Date();
    const walletAmounts = calculateWalletAmounts(invoice.amount);

    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: "Paid",
        paidAt,
        paymentAvailableAt: paymentAvailableAt(paidAt),
        paymentMethod: "Test Checkout",
        paymentReference: paymentReference(invoice.id),
        paymentStatus: PAYMENT_STATUS_PENDING_CLEARANCE,
        checkoutProvider: "Internal Test",
        ...walletAmounts,
      },
      include: {
        customer: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    await tx.transaction.create({
      data: {
        userId: invoice.user.id,
        type: "Payment Pending Clearance",
        amount: invoice.amount,
      },
    });

    return updatedInvoice;
  });

  sendEmail({
    to: invoice.user.email,
    subject: "Invoice payment received",
    html: invoicePaidTemplate({
      name: invoice.user.name,
      clientName: invoice.customer.name,
      amount: formatUsd(invoice.amount),
      invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invoices`,
      releaseDate: paidInvoice.paymentAvailableAt
        ? new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(paidInvoice.paymentAvailableAt)
        : undefined,
    }),
  }).catch((error) => {
    console.log("INVOICE PAID EMAIL ERROR:", error);
  });

  return Response.json({
    message: "Payment received and held for 3 days",
    invoice: invoiceResponse(paidInvoice),
  });
}
