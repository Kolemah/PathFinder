import { markInvoicePaidFromFlutterwave } from "@/lib/flutterwave";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get("transaction_id");
  const status = searchParams.get("status");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!transactionId || status === "cancelled") {
    return NextResponse.redirect(
      `${appUrl}/pay/${invoiceId}?payment=cancelled`
    );
  }

  try {
    await markInvoicePaidFromFlutterwave({
      invoiceId,
      transactionId,
    });

    return NextResponse.redirect(
      `${appUrl}/pay/${invoiceId}?payment=success`
    );
  } catch (error) {
    console.log("FLUTTERWAVE VERIFY ERROR:", error);

    return NextResponse.redirect(
      `${appUrl}/pay/${invoiceId}?payment=failed`
    );
  }
}
