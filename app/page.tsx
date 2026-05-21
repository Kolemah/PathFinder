import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "Arial",
        padding: 40,
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 100,
        }}
      >
        <h2 style={{ fontSize: 28 }}>PathFinder</h2>

        <div style={{ display: "flex", gap: 15 }}>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      </nav>

      <section
        style={{
          maxWidth: 700,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 52,
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Manage invoices, wallet, and payments in one place.
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#64748b",
            marginBottom: 30,
          }}
        >
          PathFinder helps freelancers track payments, create invoices,
          manage wallet balance, and view transactions from one dashboard.
        </p>

        <Link
          href="/register"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "14px 22px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}