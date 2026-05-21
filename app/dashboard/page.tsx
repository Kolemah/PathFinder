"use client";

import React from "react";
import RevenueChart from "../components/RevenueChart";
import PageHeader from "../components/PageHeader";
import Transactions from "../components/Transactions";
import InvoiceForm from "../components/InvoiceForm";
import Card from "../components/card";
import Button from "../components/button";
import { useAppContext } from "../context/AppContext";

export default function Home() {
const {
  balance,
  setBalance,
  transactions,
  setTransactions,
  invoices,
  setInvoices,
  addNotification,
} = useAppContext();
  return (
    <div className="page">
      <PageHeader title="Dashboard" />

<div style={{ marginBottom: 40 }}>
  <RevenueChart />
</div>
      {/* SUMMARY */}
      <div className="summary-grid" style={{ marginTop: 30 }}>
        <Card>
          <h3>Total Balance</h3>
          <p style={numberStyle}>${balance}</p>
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
                  invoice.status === "Pending"
              ).length
            }
          </p>
        </Card>
      </div>

      {/* WALLET */}
      <div style={{ marginTop: 30 }}>
        <Card width={280}>
          <h3 style={{ color: "#64748b" }}>
            Wallet Balance
          </h3>

          <p
            style={{
              fontSize: 34,
              fontWeight: "bold",
            }}
          >
            ${balance}
          </p>

          <div style={{ marginTop: 20 }}>
            <Button
             onClick={() => {
  setBalance(balance + 100);

  setTransactions([
    {
      id: Date.now(),
      type: "Credit",
      amount: 100,
    },
    ...transactions,
  ]);

  addNotification(
    "Wallet funded +$100"
  );
}}
            >
              Add $100
            </Button>
          </div>
        </Card>
      </div>

      <Transactions transactions={transactions} />

      <InvoiceForm
       onCreate={(invoice) => {
  setInvoices([
    invoice,
    ...invoices,
  ]);

  addNotification(
    `Invoice created for ${invoice.name}`
  );
}}
      />

      <div style={{ marginTop: 30 }}>
        <h2>Invoices</h2>

        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            style={{
              background: "white",
              padding: 15,
              borderRadius: 10,
              marginTop: 10,
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <span>{invoice.name}</span>
            <span>${invoice.amount}</span>
            <span>{invoice.status}</span>

            {invoice.status ===
              "Pending" && (
              <Button
                color="green"
                onClick={() => {
                  setBalance(
                    balance +
                      Number(
                        invoice.amount
                      )
                  );

                  setTransactions([
                    {
                      id: Date.now(),
                      type:
                        "Invoice Payment",
                      amount:
                        Number(
                          invoice.amount
                        ),
                    },
                    ...transactions,
                  ]);

                  setInvoices(
                    invoices.map(
                      (item) =>
                        item.id ===
                        invoice.id
                          ? {
                              ...item,
                              status:
                                "Paid",
                            }
                          : item
                    )
                  );
                }}
              >
                Pay
              </Button>
            )}
          </div>
        ))}
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