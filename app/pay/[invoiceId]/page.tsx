"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Button from "../../components/button";
import { useAppContext } from "../../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";
import {
  PAYMENT_STATUS_PENDING_CLEARANCE,
  formatCurrency,
  formatNaira,
} from "@/lib/wallet";

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
  const [v4Open, setV4Open] = useState(false);
  const [v4Paying, setV4Paying] = useState(false);
  const [v4Card, setV4Card] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    phoneNumber: "",
  });
  const [v4Authorization, setV4Authorization] = useState<{
    chargeId: string;
    type: string;
  } | null>(null);
  const [v4AuthorizationValue, setV4AuthorizationValue] = useState("");
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

  function updateV4Card(field: keyof typeof v4Card, value: string) {
    setV4Card((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleV4ChargeResponse(data: {
    status?: string;
    redirectUrl?: string;
    chargeId?: string;
    authorizationType?: string;
    reference?: string;
    instruction?: string;
    message?: string;
  }) {
    if (data.status === "succeeded") {
      window.location.href = `/api/pay/${params.invoiceId}/v4/verify`;
      return;
    }

    if (data.status === "redirect" && data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    if (
      data.status === "requires_authorization" &&
      data.chargeId &&
      data.authorizationType
    ) {
      setV4Authorization({
        chargeId: data.chargeId,
        type: data.authorizationType,
      });
      setV4AuthorizationValue("");
      showToast(`Flutterwave requires ${data.authorizationType.toUpperCase()}`, "info");
      return;
    }

    if (data.status === "payment_instruction" && data.instruction) {
      showToast(data.instruction, "info");
      return;
    }

    showToast(data.message || "Payment is still pending", "info");
  }

  async function payWithV4Card() {
    if (!v4Card.phoneNumber.trim()) {
      showToast("Phone number is required for Flutterwave V4 card payment", "error");
      return;
    }

    setV4Paying(true);

    try {
      const res = await fetch(`/api/pay/${params.invoiceId}/v4/card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(v4Card),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "V4 card payment failed", "error");
        return;
      }

      handleV4ChargeResponse(data);
    } catch (error) {
      console.log("V4 CARD PAYMENT ERROR:", error);
      showToast("V4 card payment could not start", "error");
    } finally {
      setV4Paying(false);
    }
  }

  async function submitV4Authorization() {
    if (!v4Authorization) return;

    setV4Paying(true);

    try {
      const payload =
        v4Authorization.type === "pin"
          ? { type: "pin", pin: v4AuthorizationValue }
          : v4Authorization.type === "otp"
            ? { type: "otp", otp: v4AuthorizationValue }
            : {
                type: "avs",
                city: invoice?.customer.state || "",
                country: invoice?.customer.country || "",
                line1: invoice?.customer.address || "",
                postalCode: invoice?.customer.zipcode || "",
                state: invoice?.customer.state || "",
              };
      const res = await fetch(`/api/pay/${params.invoiceId}/v4/authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chargeId: v4Authorization.chargeId,
          ...payload,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Authorization failed", "error");
        return;
      }

      handleV4ChargeResponse(data);
    } catch (error) {
      console.log("V4 AUTHORIZATION ERROR:", error);
      showToast("Authorization could not be completed", "error");
    } finally {
      setV4Paying(false);
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
                {formatCurrency(
                  Number(invoice.platformFeeUsd || 0),
                  invoice.currency
                )} platform fee
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
          <Button
            onClick={() => setV4Open(true)}
            disabled={isPaid || isExpired}
          >
            {isPaid
              ? "Invoice Paid"
              : isExpired
              ? "Invoice Expired"
              : "Pay with card"}
          </Button>
          <p>
            {isExpired
              ? "This invoice has passed its due date. Please contact the sender for a new invoice."
              : isPaid && invoice.paymentStatus === PAYMENT_STATUS_PENDING_CLEARANCE
              ? "Payment has been received. The seller's naira balance will update after the 3-day confirmation hold."
              : "Pay securely with Flutterwave V4 card payment."}
          </p>

          {!isPaid && !isExpired && (
            <div className="payment-v4-card">
              <button
                type="button"
                className="payment-v4-toggle"
                onClick={() => setV4Open((current) => !current)}
              >
                {v4Open ? "Hide card form" : "Enter card details"}
              </button>

              {v4Open && (
                <div className="payment-v4-form">
                  <p>
                    Card details are sent securely to Flutterwave for this
                    payment only. PathPayX does not save card details.
                  </p>

                  {!v4Authorization ? (
                    <>
                      <label>
                        Cardholder name
                        <input
                          value={v4Card.cardholderName}
                          onChange={(event) =>
                            updateV4Card("cardholderName", event.target.value)
                          }
                          autoComplete="cc-name"
                        />
                      </label>

                      <label>
                        Card number
                        <input
                          value={v4Card.cardNumber}
                          onChange={(event) =>
                            updateV4Card("cardNumber", event.target.value)
                          }
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="0000 0000 0000 0000"
                        />
                      </label>

                      <div className="payment-v4-grid">
                        <label>
                          Month
                          <input
                            value={v4Card.expiryMonth}
                            onChange={(event) =>
                              updateV4Card("expiryMonth", event.target.value)
                            }
                            inputMode="numeric"
                            autoComplete="cc-exp-month"
                            placeholder="MM"
                          />
                        </label>

                        <label>
                          Year
                          <input
                            value={v4Card.expiryYear}
                            onChange={(event) =>
                              updateV4Card("expiryYear", event.target.value)
                            }
                            inputMode="numeric"
                            autoComplete="cc-exp-year"
                            placeholder="YY"
                          />
                        </label>

                        <label>
                          CVV
                          <input
                            value={v4Card.cvv}
                            onChange={(event) =>
                              updateV4Card("cvv", event.target.value)
                            }
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="123"
                          />
                        </label>
                      </div>

                      <label>
                        Phone number
                        <input
                          value={v4Card.phoneNumber}
                          onChange={(event) =>
                            updateV4Card("phoneNumber", event.target.value)
                          }
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="08012345678"
                        />
                      </label>

                      <Button onClick={payWithV4Card} disabled={v4Paying}>
                        {v4Paying ? "Processing V4..." : "Pay with V4 card"}
                      </Button>

                      <button
                        type="button"
                        className="payment-v3-fallback"
                        onClick={payInvoice}
                        disabled={paying}
                      >
                        {paying ? "Starting hosted checkout..." : "Use old hosted checkout"}
                      </button>
                    </>
                  ) : (
                    <div className="payment-v4-auth">
                      <label>
                        {v4Authorization.type === "otp"
                          ? "Enter OTP"
                          : v4Authorization.type === "avs"
                            ? "Confirm billing address"
                            : "Enter card PIN"}
                        {v4Authorization.type === "avs" ? (
                          <input
                            value={`${invoice.customer.address}, ${invoice.customer.state}`}
                            readOnly
                          />
                        ) : (
                          <input
                            value={v4AuthorizationValue}
                            onChange={(event) =>
                              setV4AuthorizationValue(event.target.value)
                            }
                            inputMode="numeric"
                          />
                        )}
                      </label>

                      <Button onClick={submitV4Authorization} disabled={v4Paying}>
                        {v4Paying ? "Authorizing..." : "Continue payment"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
