"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function ForgotPasswordPage() {
  const { showToast } = useAppContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email) {
      showToast("Enter your email address", "error");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      showToast(data.error || "Failed to send reset link", "error");
      return;
    }

    showToast(data.message, "success");
  }

  return (
    <div className="auth-page">
      <Image
        src="/logo-pathpayx-brand.png"
        className="auth-logo"
        alt="PathPayX"
        width={170}
        height={64}
      />

      <div className="auth-switch">
        Remembered it? <Link href="/login">Sign in</Link>
      </div>

      <h1>Reset Password</h1>
      <p>Enter your email and we&apos;ll send a reset link.</p>

      <div className="auth-card">
        <label>Email address</label>
        <input
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button className="auth-btn" onClick={submit} disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </div>
    </div>
  );
}
