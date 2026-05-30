"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import RevenueChart from "../components/RevenueChart";
import PageHeader from "../components/PageHeader";
import Transactions from "../components/Transactions";
import Card from "../components/card";
import Button from "../components/button";
import { useAppContext } from "../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";
import { formatNaira } from "@/lib/wallet";

export default function Home() {
const {
  balance,
  transactions,
  invoices,
  addNotification,
  saveBalance,
  createTransaction,
  markInvoicePaid,
renewExpiredInvoice,
darkMode,
currentUser,
} = useAppContext();
const [kycStatus, setKycStatus] = useState("Not Submitted");
const [sendingVerification, setSendingVerification] = useState(false);

useEffect(() => {
  async function loadKycStatus() {
    if (!currentUser) return;

    const res = await fetch(`/api/kyc?userId=${currentUser.id}`);
    const data = await res.json();

    if (res.ok) {
      setKycStatus(data.verification?.status || "Not Submitted");
    }
  }

  loadKycStatus();
}, [currentUser]);

function formatDueDate(dueDate?: string) {
  if (!dueDate) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(dueDate));
}

async function resendVerificationEmail() {
  if (sendingVerification) return;

  setSendingVerification(true);

  const res = await fetch("/api/resend-verification", {
    method: "POST",
  });
  const data = await res.json();

  setSendingVerification(false);

  addNotification(data.message || data.error || "Verification email updated", res.ok ? "success" : "error", {
    href: "/dashboard",
    notificationType: "system",
  });
}

const paidRevenue = invoices
  .filter((invoice) => getInvoiceStatus(invoice.status, invoice.dueDate) === "Paid")
  .reduce((total, invoice) => total + Number(invoice.amount), 0);

const pendingRevenue = invoices
  .filter((invoice) => getInvoiceStatus(invoice.status, invoice.dueDate) === "Pending")
  .reduce((total, invoice) => total + Number(invoice.amount), 0);

const overdueRevenue = invoices
  .filter((invoice) => getInvoiceStatus(invoice.status, invoice.dueDate) === "Overdue")
  .reduce((total, invoice) => total + Number(invoice.amount), 0);

const totalInvoiceValue = invoices.reduce(
  (total, invoice) => total + Number(invoice.amount),
  0
);

const dashboardChartData = [
  {
    label: "Paid",
    revenue: paidRevenue,
  },
  {
    label: "Pending",
    revenue: pendingRevenue,
  },
  {
    label: "Overdue",
    revenue: overdueRevenue,
  },
  {
    label: "Total",
    revenue: totalInvoiceValue,
  },
];

  return (
    <div className="page">
      <PageHeader title="Dashboard" />

      {currentUser && !currentUser.emailVerified && (
        <div className="dashboard-kyc-prompt">
          <Card>
            <div className="dashboard-cta-card">
              <div>
                <span className="metric-label">Email Verification</span>
                <h2>Verify your email address</h2>
                <p className="empty-copy">
                  We sent a verification link to {currentUser.email}. Verify your
                  email so PathPayX can send important account and payment updates.
                </p>
              </div>

              <button
                className="customer-view-link"
                type="button"
                onClick={resendVerificationEmail}
                disabled={sendingVerification}
              >
                {sendingVerification ? "Sending..." : "Resend email"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {kycStatus !== "Verified" && (
        <div className="dashboard-kyc-prompt">
          <Card>
            <div className="dashboard-cta-card">
              <div>
                <span className="metric-label">Verification Required</span>
                <h2>
                  {kycStatus === "Pending"
                    ? "KYC verification is pending"
                    : "Complete your KYC"}
                </h2>
                <p className="empty-copy">
                  You can use PathPayX now, but payouts stay locked until Smile ID
                  verification is completed.
                </p>
              </div>

              <Link href="/kyc" className="customer-view-link">
                {kycStatus === "Pending" ? "View KYC" : "Complete KYC"}
              </Link>
            </div>
          </Card>
        </div>
      )}

      <div className="dashboard-chart">
        <RevenueChart
          title="Invoice Revenue"
          chartData={dashboardChartData}
        />
      </div>

      {/* SUMMARY */}
      <div className="summary-grid dashboard-summary">
        <Card>
          <h3>Total Balance</h3>
          <p style={numberStyle}>{formatNaira(Number(balance))}</p>
        </Card>

        <Card>
          <h3>Total Transactions</h3>
          <p style={numberStyle}>
            {transactions.length}
          </p>
        </Card>

        <Card>
          <h3>Total Invoices</h3>
          <p style={numberStyle}>
            {invoices.length}
          </p>
        </Card>

        <Card>
          <h3>Pending Invoices</h3>
          <p style={numberStyle}>
            {
              invoices.filter(
                (invoice) =>
                  getInvoiceStatus(invoice.status, invoice.dueDate) === "Pending"
              ).length
            }
          </p>
        </Card>

        <Card>
          <h3>Overdue Invoices</h3>
          <p style={numberStyle}>
            {
              invoices.filter(
                (invoice) =>
                  getInvoiceStatus(invoice.status, invoice.dueDate) === "Overdue"
              ).length
            }
          </p>
        </Card>
      </div>

      {/* WALLET */}
      <div className="dashboard-wallet">
        <Card>
          <h3 style={{ color: "#64748b" }}>
            Wallet Balance
          </h3>

          <p
            style={{
              fontSize: 34,
              fontWeight: "bold",
            }}
          >
            {formatNaira(Number(balance))}
          </p>

          <div style={{ marginTop: 20 }}>
            <Button
              onClick={async () => {
                await saveBalance(balance + 1000);
                await createTransaction("Test Naira Credit", 1000);
                addNotification("Wallet funded +₦1,000", "success", {
                  href: "/wallet",
                  notificationType: "wallet",
                });
              }}
            >
              Add Test ₦1,000
            </Button>
          </div>
        </Card>
      </div>

      <Transactions transactions={transactions} />

      <div className="dashboard-invoice-cta">
        <Card>
          <div className="dashboard-cta-card">
            <div>
              <span className="metric-label">Invoices</span>
              <h2>Create and manage invoices</h2>
              <p className="empty-copy">
                Keep the dashboard for quick insight. Create new invoices,
                copy payment links, download PDFs, and renew expired invoices
                from the invoices page.
              </p>
            </div>

            <Link href="/invoices" className="customer-view-link">
              Go to Invoices
            </Link>
          </div>
        </Card>
      </div>

      <div className="dashboard-invoices">
        <div className="dashboard-section-header">
          <div>
            <h2>Recent Invoices</h2>
            <p className="empty-copy">A quick look at your latest invoices.</p>
          </div>

          <Link href="/invoices" className="customer-view-link">
            View All
          </Link>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <p className="empty-copy">
              No invoices yet. Create your first invoice on the invoices page.
            </p>
          </Card>
        ) : invoices.slice(0, 5).map((invoice) => {
          const displayStatus = getInvoiceStatus(invoice.status, invoice.dueDate);

          return (
          <div
            key={invoice.id}
            className={`dashboard-invoice-row ${
              darkMode ? "dashboard-invoice-row-dark" : ""
            }`}
          >
            <div>
              <strong>{invoice.name}</strong>
              <span>
                {displayStatus} - Due {formatDueDate(invoice.dueDate)}
              </span>
            </div>

            <strong>${Number(invoice.amount).toLocaleString()}</strong>

            {displayStatus === "Pending" && (
              <Button
                color="green"
                onClick={() => markInvoicePaid(invoice.id)}
              >
                Pay
              </Button>
            )}

            {displayStatus === "Overdue" && (
              <Button
                color="#0f766e"
                onClick={() => renewExpiredInvoice(invoice.id)}
              >
                Renew
              </Button>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

const numberStyle: React.CSSProperties =
{
  fontSize: 28,
  fontWeight: "bold",
  marginTop: 10,
};
