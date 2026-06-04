"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import Button from "../components/button";
import {
  PAYMENT_STATUS_PENDING_CLEARANCE,
  USD_TO_NGN_RATE,
  formatNaira,
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
  const [exchangeRateUpdatedAt, setExchangeRateUpdatedAt] = useState("");
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
        setExchangeRateUpdatedAt(data.lastUpdated || "");
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

  const pendingNetNgn = pendingClearanceInvoices.reduce((total, invoice) => {
    return total + Number(invoice.netAmountNgn || 0);
  }, 0);

  const totalPayouts = transactions
    .filter((transaction) => transaction.type.toLowerCase().includes("payout"))
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const recentWalletActivity = transactions.slice(0, 8);
  const accountRestricted = currentUser?.accountStatus === "Restricted";

  async function requestPayout() {
    if (!currentUser || requestingPayout) return;

    if (accountRestricted) {
      addNotification(
        "Your account is restricted. You cannot request payouts at this time.",
        "error",
        {
          href: "/wallet",
          notificationType: "wallet",
        }
      );
      return;
    }

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
    return formatNaira(amount);
  }

  function exchangeRateMeta() {
    if (!exchangeRateUpdatedAt) return exchangeRateSource;

    return `${exchangeRateSource} • updated ${new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(new Date(exchangeRateUpdatedAt))}`;
  }

  return (
    <div className="page">
      <PageHeader title="Wallet" />

      <div className="wallet-rate">
        <span>Today&apos;s rate</span>
        <strong>1 USD → {formatNaira(exchangeRate)}</strong>
        <small>{exchangeRateMeta()}</small>
      </div>

      <div className="wallet-summary-cards">
        <div className="wallet-stat-card wallet-stat-available">
          <span>Available Balance</span>
          <strong>{formatNaira(Number(balance))}</strong>
          <p>Cleared naira balance ready for withdrawal.</p>
          <Button
            onClick={requestPayout}
            disabled={requestingPayout || accountRestricted}
          >
            {accountRestricted
              ? "Account restricted"
              : requestingPayout
                ? "Requesting..."
                : "Request payout"}
          </Button>
          <small>
            {accountRestricted
              ? "Payout is locked until admin removes the restriction."
              : "Minimum payout is NGN 10,000."}
          </small>
        </div>

        <div className="wallet-stat-card wallet-stat-pending">
          <span>Pending Balance</span>
          <strong>{formatNaira(pendingNetNgn)}</strong>
          <p>Estimated naira value after conversion and 10% fee.</p>
          <small>
            {pendingClearanceInvoices.length} paid invoice(s) pending release.
          </small>
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
