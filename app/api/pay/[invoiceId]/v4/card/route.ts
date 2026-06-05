import { prisma } from "@/lib/prisma";
import { createFlutterwaveV4CardCharge } from "@/lib/flutterwave-v4";
import { isInvoicePayable } from "@/lib/flutterwave";
import { PAYMENT_STATUS_PROCESSING } from "@/lib/wallet";

function cleanCardNumber(cardNumber: string) {
  return cardNumber.replace(/\D/g, "");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const body = await req.json().catch(() => ({}));
  const cardNumber = cleanCardNumber(String(body.cardNumber || ""));
  const expiryMonth = String(body.expiryMonth || "").padStart(2, "0");
  const expiryYear = String(body.expiryYear || "");
  const cvv = String(body.cvv || "");

  if (
    cardNumber.length < 12 ||
    !expiryMonth ||
    !expiryYear ||
    cvv.length < 3
  ) {
    return Response.json(
      { error: "Please enter valid card details" },
      { status: 400 }
    );
  }

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
    return Response.json({ error: "Invoice not found" }, { status: 404 });
  }

  const paymentAccess = isInvoicePayable(invoice);

  if (!paymentAccess.payable) {
    return Response.json(
      { error: paymentAccess.error },
      { status: paymentAccess.status }
    );
  }

  if (invoice.paymentStatus === PAYMENT_STATUS_PROCESSING) {
    return Response.json(
      {
        error:
          "A payment is already processing for this invoice. Please wait before trying again.",
      },
      { status: 409 }
    );
  }

  const lockedInvoice = await prisma.invoice.updateMany({
    where: {
      id: invoice.id,
      status: {
        not: "Paid",
      },
      paymentStatus: {
        not: PAYMENT_STATUS_PROCESSING,
      },
    },
    data: {
      paymentStatus: PAYMENT_STATUS_PROCESSING,
      paymentMethod: "Flutterwave V4 Card",
      checkoutProvider: "Flutterwave V4",
    },
  });

  if (lockedInvoice.count === 0) {
    return Response.json(
      {
        error:
          "A payment is already processing for this invoice. Please wait before trying again.",
      },
      { status: 409 }
    );
  }

  try {
    const charge = await createFlutterwaveV4CardCharge({
      invoice,
      card: {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName: String(body.cardholderName || ""),
        phoneNumber: String(body.phoneNumber || ""),
      },
    });

    await prisma.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        paymentReference: charge.reference,
        paymentMethod: "Flutterwave V4 Card",
        checkoutProvider: charge.chargeId
          ? `Flutterwave V4 #${charge.chargeId}`
          : "Flutterwave V4",
      },
    });

    return Response.json(charge);
  } catch (error) {
    console.log("CREATE FLUTTERWAVE V4 CARD CHARGE ERROR:", error);
    await prisma.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        paymentStatus: "Unpaid",
        paymentReference: null,
        paymentMethod: null,
        checkoutProvider: null,
      },
    });

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Flutterwave V4 card payment could not start",
      },
      { status: 500 }
    );
  }
}
