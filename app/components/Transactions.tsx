"use client";

import { useAppContext } from "../context/AppContext";

type Transaction = {
  id: number;
  type: string;
  amount: number;
};

export default function Transactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { darkMode } = useAppContext();

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Transactions</h2>

      <div style={{ marginTop: 20 }}>
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            style={{
              background: darkMode ? "#1e293b" : "white",
              color: darkMode ? "white" : "#0f172a",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              border: darkMode ? "1px solid #334155" : "none",
            }}
          >
            <span>{transaction.type}</span>
            <span>${transaction.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}