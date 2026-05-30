"use client";

import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import RevenueChart from "../components/RevenueChart";
import { useAppContext } from "../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";
import { formatNaira } from "@/lib/wallet";

export default function AnalyticsPage() {
  const { balance, transactions, invoices } = useAppContext();

  const paidInvoices = invoices.filter(
    (invoice) => getInvoiceStatus(invoice.status, invoice.dueDate) === "Paid"
  );

  const pendingInvoices = invoices.filter(
    (invoice) => getInvoiceStatus(invoice.status, invoice.dueDate) === "Pending"
  );

  const overdueInvoices = invoices.filter(
    (invoice) => getInvoiceStatus(invoice.status, invoice.dueDate) === "Overdue"
  );

  const totalInvoiceValue = invoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const paidRevenue = paidInvoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const pendingRevenue = pendingInvoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const overdueRevenue = overdueInvoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const totalCredits = transactions
    .filter((transaction) =>
      transaction.type.toLowerCase().includes("credit") ||
      transaction.type.toLowerCase().includes("payment")
    )
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalDebits = transactions
    .filter((transaction) =>
      transaction.type.toLowerCase().includes("debit")
    )
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const paidPercent =
    invoices.length > 0
      ? Math.round((paidInvoices.length / invoices.length) * 100)
      : 0;

  const revenueChartData = [
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

  const latestTransactions = transactions.slice(0, 4);

  return (
    <div className="page">
      <PageHeader title="Analytics" />

      <div className="analytics-grid">
        <Card>
          <span className="metric-label">Wallet Balance</span>
          <strong className="metric-value">
            {formatNaira(Number(balance))}
          </strong>
          <p className="metric-note">Available naira funds</p>
        </Card>

        <Card>
          <span className="metric-label">Paid Revenue</span>
          <strong className="metric-value">
            ${paidRevenue.toLocaleString()}
          </strong>
          <p className="metric-note">{paidInvoices.length} paid invoices</p>
        </Card>

        <Card>
          <span className="metric-label">Pending Value</span>
          <strong className="metric-value">
            ${pendingRevenue.toLocaleString()}
          </strong>
          <p className="metric-note">
            {pendingInvoices.length} invoices awaiting payment
          </p>
        </Card>

        <Card>
          <span className="metric-label">Overdue Value</span>
          <strong className="metric-value">
            ${overdueRevenue.toLocaleString()}
          </strong>
          <p className="metric-note">
            {overdueInvoices.length} invoices past due date
          </p>
        </Card>
      </div>

      <div className="analytics-main">
        <div className="analytics-chart">
          <RevenueChart
            title="Invoice Revenue"
            chartData={revenueChartData}
          />
        </div>

        <Card>
          <h2 className="panel-title">Invoice Status</h2>

          {invoices.length === 0 ? (
            <p className="empty-copy">
              Create invoices to see payment performance here.
            </p>
          ) : (
            <div className="status-stack">
              <div className="status-row">
                <span>Paid</span>
                <strong>{paidInvoices.length}</strong>
              </div>

              <div className="status-row">
                <span>Pending</span>
                <strong>{pendingInvoices.length}</strong>
              </div>

              <div className="status-row">
                <span>Overdue</span>
                <strong>{overdueInvoices.length}</strong>
              </div>

              <div className="status-row">
                <span>Total Value</span>
                <strong>${totalInvoiceValue.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="analytics-grid analytics-grid-compact">
        <Card>
          <span className="metric-label">Total Credits</span>
          <strong className="metric-value">
            ${totalCredits.toLocaleString()}
          </strong>
        </Card>

        <Card>
          <span className="metric-label">Total Debits</span>
          <strong className="metric-value">
            ${totalDebits.toLocaleString()}
          </strong>
        </Card>

        <Card>
          <span className="metric-label">Transactions</span>
          <strong className="metric-value">{transactions.length}</strong>
        </Card>

        <Card>
          <span className="metric-label">Completion</span>
          <strong className="metric-value">{paidPercent}%</strong>
        </Card>
      </div>

      <Card>
        <h2 className="panel-title">Latest Transactions</h2>

        {latestTransactions.length === 0 ? (
          <p className="empty-copy">
            Fund your wallet or mark an invoice as paid to create transactions.
          </p>
        ) : (
          <div className="analytics-transactions">
            {latestTransactions.map((transaction) => (
              <div key={transaction.id} className="analytics-transaction-row">
                <span>{transaction.type}</span>
                <strong>${Number(transaction.amount).toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
