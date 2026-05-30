"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import Button from "../components/button";
import {
  PAYMENT_STATUS_PENDING_CLEARANCE,
  USD_TO_NGN_RATE,
  calculateWalletAmounts,
  formatNaira,
  formatUsd,
} from "@/lib/wallet";

export default function WalletPage() {
  const {
    balance,
    invoices,
    transactions,
    currentUser,
    refreshUserData,
    addNotification,
  } = useAppContext();
  const [exchangeRate, setExchangeRate] = useState(USD_TO_NGN_RATE);
  const [exchangeRateSource, setExchangeRateSource] = useState("Fallback");
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadExchangeRate() {
      try {
        const res = await fetch("/api/exchange-rate");
        const data = await res.json();

        if (!isMounted || !res.ok) return;

        setExchangeRate(Number(data.rate || USD_TO_NGN_RATE));
        setExchangeRateSource(data.isLive ? data.source : "Fallback rate");
      } catch (error) {
        console.log("LOAD EXCHANGE RATE ERROR:", error);
      }
    }

    loadExchangeRate();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingClearanceInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "Paid" &&
      invoice.paymentStatus === PAYMENT_STATUS_PENDING_CLEARANCE
  );

  const pendingGrossUsd = pendingClearanceInvoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const pendingNetNgn = pendingClearanceInvoices.reduce((total, invoice) => {
    const storedNet = Number(invoice.netAmountNgn || 0);
    return (
      total +
      (storedNet > 0
        ? storedNet
        : calculateWalletAmounts(Number(invoice.amount), exchangeRate)
            .netAmountNgn)
    );
  }, 0);

  const totalPayouts = transactions
    .filter((transaction) => transaction.type.toLowerCase().includes("payout"))
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const recentWalletActivity = transactions.slice(0, 8);

  async function requestPayout() {
    if (!currentUser || requestingPayout) return;

    const payoutAmount = Number(balance);

    if (payoutAmount < 10000) {
      addNotification("Minimum payout is NGN 10,000", "error", {
        href: "/wallet",
        notificationType: "wallet",
      });
      return;
    }

    setRequestingPayout(true);

    const res = await fetch("/api/payouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        amount: payoutAmount,
      }),
    });
    const data = await res.json();

    setRequestingPayout(false);

    if (!res.ok) {
      addNotification(data.error || "Payout request failed", "error", {
        href: "/wallet",
        notificationType: "wallet",
      });
      return;
    }

    await refreshUserData();
    addNotification(
      data.message || `Payout requested for ${formatNaira(payoutAmount)}`,
      "success",
      {
        href: "/wallet",
        notificationType: "wallet",
      }
    );
  }

  function nextReleaseDate() {
    const nextInvoice = pendingClearanceInvoices
      .filter((invoice) => invoice.paymentAvailableAt)
      .sort(
        (firstInvoice, secondInvoice) =>
          new Date(firstInvoice.paymentAvailableAt || "").getTime() -
          new Date(secondInvoice.paymentAvailableAt || "").getTime()
      )[0];

    if (!nextInvoice?.paymentAvailableAt) return "No pending release";

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(nextInvoice.paymentAvailableAt));
  }

  function formatTransactionAmount(type: string, amount: number) {
    if (type.toLowerCase().includes("pending")) {
      return formatUsd(amount);
    }

    return formatNaira(amount);
  }

  return (
    <div className="page">
      <PageHeader title="Wallet" />

      <div className="wallet-rate">
        <span>Today&apos;s rate</span>
        <strong>1 USD → {formatNaira(exchangeRate)}</strong>
        <small>{exchangeRateSource}</small>
      </div>

      <div className="wallet-summary-cards">
        <div className="wallet-stat-card wallet-stat-available">
          <span>Available Balance</span>
          <strong>{formatNaira(Number(balance))}</strong>
          <p>Cleared naira balance ready for withdrawal.</p>
          <Button onClick={requestPayout} disabled={requestingPayout}>
            {requestingPayout ? "Requesting..." : "Request payout"}
          </Button>
          <small>Minimum payout is NGN 10,000.</small>
        </div>

        <div className="wallet-stat-card wallet-stat-pending">
          <span>Pending Balance</span>
          <strong>{formatUsd(pendingGrossUsd)}</strong>
          <p>Paid invoices held for 3 days before release.</p>
          <small>Expected after fee: {formatNaira(pendingNetNgn)}</small>
        </div>

        <div className="wallet-stat-card wallet-stat-payouts">
          <span>Total Payouts</span>
          <strong>{formatNaira(totalPayouts)}</strong>
          <p>Total withdrawn since account creation.</p>
          <small>{pendingClearanceInvoices.length} payment(s) pending.</small>
        </div>
      </div>

      <div className="wallet-clearance-note">
        <strong>Next release:</strong> {nextReleaseDate()}
      </div>

      <div className="wallet-main wallet-main-simple">
        <Card>
          <h2 className="panel-title">Transaction History</h2>

          {recentWalletActivity.length === 0 ? (
            <p className="empty-copy">
              Payments, releases, and payouts will appear here.
            </p>
          ) : (
            <div className="wallet-activity-list">
              {recentWalletActivity.map((transaction) => (
                <div key={transaction.id} className="wallet-activity-row">
                  <div>
                    <strong>{transaction.type}</strong>
                    <span>Wallet transaction</span>
                  </div>

                  <strong>
                    {formatTransactionAmount(
                      transaction.type,
                      Number(transaction.amount)
                    )}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
