import { prisma } from "@/lib/prisma";
import {
  createFlutterwaveCheckout,
  isInvoicePayable,
} from "@/lib/flutterwave";

function invoiceResponse(invoice: {
  id: string;
  description: string;
  amount: number;
  currency: string;
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
    currency: invoice.currency,
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

  const paymentAccess = isInvoicePayable(invoice);

  if (!paymentAccess.payable) {
    return Response.json(
      {
        error: paymentAccess.error,
        invoice: invoiceResponse(invoice),
      },
      { status: paymentAccess.status }
    );
  }

  const checkout = await createFlutterwaveCheckout(invoice);

  return Response.json({
    message: "Flutterwave checkout created",
    checkoutUrl: checkout.checkoutUrl,
    txRef: checkout.txRef,
  });
}
