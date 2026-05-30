"use client";

import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import Transactions from "../components/Transactions";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";

export default function TransactionsPage() {
  const { transactions } = useAppContext();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredTransactions = transactions.filter((transaction) => {
    const type = transaction.type.toLowerCase();
    const matchesSearch =
      type.includes(search.toLowerCase()) ||
      String(transaction.amount).includes(search);
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Credit" &&
        (type.includes("credit") || type.includes("payment"))) ||
      (typeFilter === "Debit" && type.includes("debit"));

    return matchesSearch && matchesType;
  });

  return (
    <div className="page">
      <PageHeader title="Transactions" />

      <div className="filter-bar">
        <input
          placeholder="Search transactions..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="All">All types</option>
          <option value="Credit">Credits</option>
          <option value="Debit">Debits</option>
        </select>
      </div>

      <Card>
        {filteredTransactions.length === 0 ? (
          <p className="empty-copy">
            No transactions match your current filters.
          </p>
        ) : (
          <Transactions transactions={filteredTransactions} />
        )}
      </Card>

      <div className="summary-grid transaction-summary-grid">
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
              transactions.filter(
                (item) =>
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
    </div>
  );
}
