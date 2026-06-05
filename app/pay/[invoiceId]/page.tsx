"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import Button from "../../components/button";
import { useAppContext } from "../../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";
import { formatCurrency } from "@/lib/wallet";

type PaymentInvoice = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  paymentAvailableAt: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentStatus: string;
  checkoutProvider: string | null;
  platformFeeUsd: number;
  netAmountUsd: number;
  netAmountNgn: number;
  exchangeRate: number;
  fundsReleasedAt: string | null;
  customer: {
    name: string;
    email: string;
    country: string;
    state: string;
    address: string;
    zipcode: string;
  };
  business: {
    name: string;
    email: string;
  };
};

export default function PayInvoicePage() {
  const params = useParams<{ invoiceId: string }>();
  const { showToast } = useAppContext();
  const [invoice, setInvoice] = useState<PaymentInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const paymentStatusHandled = useRef(false);

  useEffect(() => {
    async function loadInvoice() {
      const res = await fetch(`/api/pay/${params.invoiceId}`);
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Invoice not found", "error");
        setLoading(false);
        return;
      }

      setInvoice(data.invoice);
      setLoading(false);
    }

    loadInvoice();
  }, [params.invoiceId, showToast]);

  useEffect(() => {
    if (paymentStatusHandled.current) return;

    const paymentStatus = new URLSearchParams(window.location.search).get(
      "payment"
    );

    if (!paymentStatus) return;

    paymentStatusHandled.current = true;

    if (paymentStatus === "success") {
      showToast("Payment verified successfully", "success");
    }

    if (paymentStatus === "failed") {
      showToast("Payment could not be verified", "error");
    }

    if (paymentStatus === "cancelled") {
      showToast("Payment was cancelled", "info");
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("payment");
    window.history.replaceState(null, "", nextUrl.toString());
  }, [showToast]);

  async function payInvoice() {
    setPaying(true);

    try {
      const res = await fetch(`/api/pay/${params.invoiceId}`, {
        method: "POST",
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : {};

      if (!res.ok) {
        showToast(data.error || "Payment failed. Please try again.", "error");
        return;
      }

      if (!data.checkoutUrl) {
        showToast("Checkout link was not created", "error");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.log("START PAYMENT ERROR:", error);
      showToast("Payment could not start. Please try again.", "error");
    } finally {
      setPaying(false);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  if (loading) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <p className="empty-copy">Loading invoice...</p>
        </div>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h1>Invoice not found</h1>
          <p>This payment link may be invalid or expired.</p>
        </div>
      </main>
    );
  }

  const displayStatus = getInvoiceStatus(invoice.status, invoice.dueDate);
  const isPaid = displayStatus === "Paid";
  const isExpired = displayStatus === "Overdue";

  if (isPaid) {
    return (
      <main className="payment-page payment-confirmation-page">
        <div className="payment-card payment-confirmation-card">
          <div className="payment-confirmation-icon" aria-hidden="true">
            <CheckCircle size={72} strokeWidth={2.4} />
          </div>

          <h1>Payment Confirmed!</h1>
          <p className="payment-confirmation-copy">
            Your payment has been received and recorded for this invoice.
          </p>

          <div className="payment-confirmation-list">
            <div className="payment-confirmation-row">
              <span>Amount</span>
              <strong>{formatCurrency(Number(invoice.amount), invoice.currency)}</strong>
            </div>

            <div className="payment-confirmation-row">
              <span>Date</span>
              <strong>{formatDate(invoice.paidAt || new Date().toISOString())}</strong>
            </div>

            <div className="payment-confirmation-row">
              <span>Transaction ID</span>
              <strong className="payment-confirmation-id">
                {invoice.paymentReference || "Payment received"}
              </strong>
            </div>
          </div>

          <div className="payment-confirmation-actions">
            <Button onClick={() => (window.location.href = "/")}>Done</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-page">
      <div className="payment-card">
        <div className="payment-header">
          <Image src="/logo-pathpayx-brand.png" alt="PathPayX" width={150} height={56} />
          <span
            className={
              displayStatus === "Overdue"
                ? "payment-overdue"
                : "payment-pending"
            }
          >
            {displayStatus}
          </span>
        </div>

        <h1>{formatCurrency(Number(invoice.amount), invoice.currency)}</h1>
        <p className="payment-description">{invoice.description}</p>

        <div className="payment-details">
          <div>
            <span>From</span>
            <strong>{invoice.business.name}</strong>
            <p>{invoice.business.email}</p>
          </div>

          <div>
            <span>Bill To</span>
            <strong>{invoice.customer.name}</strong>
            <p>{invoice.customer.email}</p>
          </div>

          <div>
            <span>Due Date</span>
            <strong>{formatDate(invoice.dueDate)}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>
              {invoice.customer.country}, {invoice.customer.state}
            </strong>
            <p>
              {invoice.customer.address} {invoice.customer.zipcode}
            </p>
          </div>
        </div>

        <div className="payment-actions">
          <Button onClick={payInvoice} disabled={paying || isPaid || isExpired}>
            {isPaid
              ? "Invoice Paid"
              : isExpired
              ? "Invoice Expired"
              : paying
              ? "Processing..."
              : "Pay Invoice"}
          </Button>
          <p>
            {isExpired
              ? "This invoice has passed its due date. Please contact the sender for a new invoice."
              : "You will be redirected to Flutterwave hosted checkout to complete this payment securely."}
          </p>
        </div>
      </div>
    </main>
  );
}
