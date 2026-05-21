"use client";

import { useAppContext } from "../context/AppContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";

export default function WalletPage() {
  const { balance } = useAppContext();

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Wallet" />

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <Card width={320}>
          <h3
            style={{
              color: "#64748b",
            }}
          >
            Current Balance
          </h3>

          <p
            style={{
              fontSize: 40,
              fontWeight: "bold",
              marginTop: 20,
            }}
          >
            ${balance}
          </p>

          <p
            style={{
              marginTop: 10,
              color: "#64748b",
            }}
          >
            Available funds in your wallet
          </p>
        </Card>

        <Card width={320}>
          <h3
            style={{
              color: "#64748b",
            }}
          >
            Wallet Status
          </h3>

          <p
            style={{
              marginTop: 20,
              fontSize: 24,
              fontWeight: "bold",
              color: "green",
            }}
          >
            Active
          </p>

          <p
            style={{
              marginTop: 10,
              color: "#64748b",
            }}
          >
            Your wallet is operational
          </p>
        </Card>
      </div>
    </div>
  );
}