"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Button from "../../components/button";
import { useAppContext } from "../../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";
import {
  PAYMENT_STATUS_PENDING_CLEARANCE,
  formatNaira,
  formatUsd,
} from "@/lib/wallet";

type PaymentInvoice = {
  id: string;
  description: string;
  amount: number;
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

  async function payInvoice() {
    setPaying(true);

    const res = await fetch(`/api/pay/${params.invoiceId}`, {
      method: "POST",
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Payment failed", "error");
      setPaying(false);
      return;
    }

    setInvoice(data.invoice);
    showToast(data.message || "Payment successful", "success");
    setPaying(false);
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

  return (
    <main className="payment-page">
      <div className="payment-card">
        <div className="payment-header">
          <Image src="/logo-pathpayx-brand.png" alt="PathPayX" width={150} height={56} />
          <span
            className={
              isPaid
                ? "payment-paid"
                : displayStatus === "Overdue"
                ? "payment-overdue"
                : "payment-pending"
            }
          >
            {displayStatus}
          </span>
        </div>

        <h1>{formatUsd(Number(invoice.amount))}</h1>
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

          {isPaid && invoice.paidAt && (
            <div>
              <span>Paid At</span>
              <strong>{formatDate(invoice.paidAt)}</strong>
              <p>{invoice.paymentMethod || "Payment received"}</p>
            </div>
          )}

          {isPaid && invoice.paymentReference && (
            <div>
              <span>Payment Reference</span>
              <strong>{invoice.paymentReference}</strong>
              <p>{invoice.checkoutProvider || invoice.paymentStatus}</p>
            </div>
          )}

          {isPaid && (
            <div>
              <span>Seller Receives</span>
              <strong>{formatNaira(Number(invoice.netAmountNgn || 0))}</strong>
              <p>
                {formatUsd(Number(invoice.platformFeeUsd || 0))} platform fee
              </p>
            </div>
          )}

          {isPaid &&
            invoice.paymentStatus === PAYMENT_STATUS_PENDING_CLEARANCE &&
            invoice.paymentAvailableAt && (
              <div>
                <span>Wallet Release</span>
                <strong>{formatDate(invoice.paymentAvailableAt)}</strong>
                <p>Held for 3 days for buyer confirmation</p>
              </div>
            )}

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
              : isPaid && invoice.paymentStatus === PAYMENT_STATUS_PENDING_CLEARANCE
              ? "Payment has been received. The seller's naira balance will update after the 3-day confirmation hold."
              : "This is a test payment action. A real checkout provider can replace it later."}
          </p>
        </div>
      </div>
    </main>
  );
}
