"use client";

import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import RevenueChart from "../components/RevenueChart";
import { useAppContext } from "../context/AppContext";

export default function AnalyticsPage() {
  const { balance, transactions, invoices } = useAppContext();

  const totalInvoiceValue = invoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending"
  ).length;

  return (
    <div className="page">
      <PageHeader title="Analytics" />

      <div className="summary-grid">
        <Card>
          <h3>Wallet Balance</h3>
          <p style={numberStyle}>${balance}</p>
        </Card>

        <Card>
          <h3>Total Transactions</h3>
          <p style={numberStyle}>{transactions.length}</p>
        </Card>

        <Card>
          <h3>Total Invoice Value</h3>
          <p style={numberStyle}>${totalInvoiceValue}</p>
        </Card>

        <Card>
          <h3>Paid Invoices</h3>
          <p style={numberStyle}>{paidInvoices}</p>
        </Card>
      </div>

      <div style={{ marginTop: 30 }}>
        <RevenueChart />
      </div>

      <div className="summary-grid" style={{ marginTop: 30 }}>
        <Card>
          <h3>Pending Invoices</h3>
          <p style={numberStyle}>{pendingInvoices}</p>
        </Card>

        <Card>
          <h3>Total Invoices</h3>
          <p style={numberStyle}>{invoices.length}</p>
        </Card>
      </div>
    </div>
  );
}

const numberStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: "bold",
  marginTop: 10,
};