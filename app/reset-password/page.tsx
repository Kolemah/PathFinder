"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import {
  passwordPolicyMessage,
  validatePasswordPolicy,
} from "@/lib/password-policy";

function ResetPasswordForm() {
  const { showToast } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!token) {
      showToast("Password reset token is missing", "error");
      return;
    }

    if (!password || password !== confirm) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (!validatePasswordPolicy(password)) {
      showToast(passwordPolicyMessage, "error");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      showToast(data.error || "Failed to reset password", "error");
      return;
    }

    showToast("Password reset successfully", "success");
    router.push("/login?reset=success");
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
        Back to <Link href="/login">Sign in</Link>
      </div>

      <h1>Create New Password</h1>
      <p>Choose a new password for your PathPayX account.</p>

      <div className="auth-card">
        <label>New password</label>
        <div className="auth-password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <p className="auth-helper-text">
          Use more than 8 characters with uppercase, lowercase, number, and
          special character.
        </p>

        <label>Confirm password</label>
        <div className="auth-password-field">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          <button
            type="button"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirm((value) => !value)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="auth-btn" onClick={submit} disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
