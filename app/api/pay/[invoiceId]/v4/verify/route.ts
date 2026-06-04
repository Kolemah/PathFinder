import { markInvoicePaidFromFlutterwaveV4 } from "@/lib/flutterwave";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const { searchParams } = new URL(req.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const status = searchParams.get("status");

  if (status === "cancelled" || status === "failed") {
    return NextResponse.redirect(
      `${appUrl}/pay/${invoiceId}?payment=failed`
    );
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      paymentReference: true,
    },
  });
  const reference =
    searchParams.get("reference") ||
    searchParams.get("tx_ref") ||
    invoice?.paymentReference ||
    "";

  if (!reference) {
    return NextResponse.redirect(
      `${appUrl}/pay/${invoiceId}?payment=failed`
    );
  }

  try {
    await markInvoicePaidFromFlutterwaveV4({
      invoiceId,
      reference,
    });

    return NextResponse.redirect(
      `${appUrl}/pay/${invoiceId}?payment=success`
    );
  } catch (error) {
    console.log("FLUTTERWAVE V4 VERIFY ERROR:", error);

    return NextResponse.redirect(
      `${appUrl}/pay/${invoiceId}?payment=failed`
    );
  }
}
