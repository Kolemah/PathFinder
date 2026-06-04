import { prisma } from "@/lib/prisma";
import { getInvoiceStatus } from "@/lib/invoice-status";
import { getCurrencyToNgnRate } from "@/lib/exchange-rate";
import {
  DEFAULT_INVOICE_CURRENCY,
  PAYMENT_STATUS_PENDING_CLEARANCE,
  calculateWalletAmounts,
  formatCurrency,
  paymentAvailableAt,
} from "@/lib/wallet";
import { sendEmail } from "@/lib/email";
import { invoicePaidTemplate } from "@/lib/email-templates";

const FLUTTERWAVE_API_URL = "https://api.flutterwave.com/v3";

type FlutterwaveCheckoutResponse = {
  status: string;
  message: string;
  data?: {
    link?: string;
  };
};

type FlutterwaveVerifyResponse = {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref?: string;
    status: string;
    currency: string;
    amount: number;
    charged_amount?: number;
    payment_type?: string;
  };
};

type PayableInvoice = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: Date;
  customer: {
    name: string;
    email: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export function getFlutterwaveSecretKey() {
  return process.env.FLUTTERWAVE_SECRET_KEY || "";
}

export function flutterwaveTxRef(invoiceId: string) {
  return `PATHPAYX-${invoiceId}-${Date.now()}`;
}

export function isInvoicePayable(invoice: Pick<PayableInvoice, "status" | "dueDate">) {
  if (invoice.status === "Paid") {
    return {
      payable: false,
      error: "Invoice is already paid",
      status: 400,
    };
  }

  if (getInvoiceStatus(invoice.status, invoice.dueDate) === "Overdue") {
    return {
      payable: false,
      error: "Invoice expired",
      status: 410,
    };
  }

  return {
    payable: true,
  };
}

export async function createFlutterwaveCheckout(invoice: PayableInvoice) {
  const secretKey = getFlutterwaveSecretKey();

  if (!secretKey) {
    throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const txRef = flutterwaveTxRef(invoice.id);

  const res = await fetch(`${FLUTTERWAVE_API_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: Number(invoice.amount.toFixed(2)),
      currency: invoice.currency || DEFAULT_INVOICE_CURRENCY,
      redirect_url: `${appUrl}/api/pay/${invoice.id}/verify`,
      customer: {
        email: invoice.customer.email,
        name: invoice.customer.name,
      },
      meta: {
        invoiceId: invoice.id,
        sellerId: invoice.user.id,
      },
      customizations: {
        title: "PathPayX Invoice",
        description: invoice.description,
        logo: `${appUrl}/pathpayx-icon.png`,
      },
    }),
  });

  const data = (await res.json()) as FlutterwaveCheckoutResponse;

  if (!res.ok || data.status !== "success" || !data.data?.link) {
    throw new Error(data.message || "Failed to create Flutterwave checkout");
  }

  await prisma.invoice.update({
    where: {
      id: invoice.id,
    },
    data: {
      paymentReference: txRef,
      paymentMethod: "Flutterwave Checkout",
      checkoutProvider: "Flutterwave",
    },
  });

  return {
    checkoutUrl: data.data.link,
    txRef,
  };
}

export async function verifyFlutterwaveTransaction(transactionId: string) {
  const secretKey = getFlutterwaveSecretKey();

  if (!secretKey) {
    throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  }

  const res = await fetch(
    `${FLUTTERWAVE_API_URL}/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    }
  );

  const data = (await res.json()) as FlutterwaveVerifyResponse;

  if (!res.ok || data.status !== "success" || !data.data) {
    throw new Error(data.message || "Flutterwave verification failed");
  }

  return data.data;
}

export async function markInvoicePaidFromFlutterwave({
  invoiceId,
  transactionId,
}: {
  invoiceId: string;
  transactionId: string;
}) {
  const payment = await verifyFlutterwaveTransaction(transactionId);

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
    throw new Error("Invoice not found");
  }

  if (invoice.status === "Paid") {
    return invoice;
  }

  if (getInvoiceStatus(invoice.status, invoice.dueDate) === "Overdue") {
    throw new Error("Invoice expired");
  }

  const expectedTxRef = invoice.paymentReference;
  const invoiceCurrency = invoice.currency || DEFAULT_INVOICE_CURRENCY;
  const paidSuccessfully = payment.status === "successful";
  const amountMatches = Number(payment.amount) >= Number(invoice.amount);
  const currencyMatches = payment.currency === invoiceCurrency;
  const referenceMatches = expectedTxRef ? payment.tx_ref === expectedTxRef : true;

  if (!paidSuccessfully || !amountMatches || !currencyMatches || !referenceMatches) {
    throw new Error("Flutterwave payment could not be verified");
  }

  const { rate } = await getCurrencyToNgnRate(invoiceCurrency);
  const paidInvoice = await prisma.$transaction(async (tx) => {
    const paidAt = new Date();
    const walletAmounts = calculateWalletAmounts(invoice.amount, rate);

    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: "Paid",
        paidAt,
        paymentAvailableAt: paymentAvailableAt(paidAt),
        paymentMethod: payment.payment_type || "Flutterwave Checkout",
        paymentReference: payment.flw_ref || payment.tx_ref,
        paymentStatus: PAYMENT_STATUS_PENDING_CLEARANCE,
        checkoutProvider: `Flutterwave #${payment.id}`,
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
        type: "Payment Pending Clearance NGN Estimate",
        amount: updatedInvoice.netAmountNgn,
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
      amount: formatCurrency(invoice.amount, invoiceCurrency),
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

  return paidInvoice;
}
