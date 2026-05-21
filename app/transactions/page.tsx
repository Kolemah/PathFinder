"use client";

import { useAppContext } from "../context/AppContext";
import Transactions from "../components/Transactions";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";

export default function TransactionsPage() {
  const { transactions } = useAppContext();

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Transactions" />

<div className="summary-grid" style={{ marginBottom: 30 }}>
        <Card>
          <h3>Total Transactions</h3>
          <p style={{ fontSize: 28, fontWeight: "bold" }}>
            {transactions.length}
          </p>
        </Card>

        <Card>
          <h3>Total Credits</h3>
          <p style={{ fontSize: 28, fontWeight: "bold" }}>
            {
              transactions.filter((item) =>
                item.type.toLowerCase().includes("credit") ||
                item.type.toLowerCase().includes("payment")
              ).length
            }
          </p>
        </Card>

        <Card>
          <h3>Total Debits</h3>
          <p style={{ fontSize: 28, fontWeight: "bold" }}>
            {
              transactions.filter((item) =>
                item.type.toLowerCase().includes("debit")
              ).length
            }
          </p>
        </Card>
      </div>

      <Card>
        <Transactions transactions={transactions} />
      </Card>
    </div>
  );
}