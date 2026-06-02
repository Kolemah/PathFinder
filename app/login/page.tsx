"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      if (!email || !password) {
        showToast("Please enter your email and password", "error");
        return;
      }

      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Login failed", "error");
        return;
      }

      localStorage.setItem("pathfinderUser", JSON.stringify(data.user));
      localStorage.setItem("pathfinderLoggedIn", "true");
      showToast("Login successful", "success");
      router.push("/dashboard");
    } catch (error) {
      showToast("Something went wrong", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function googleLogin() {
    showToast("Redirecting to Google...", "info");
    window.location.href = "/api/auth/google";
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
        New user? <Link href="/register">Create account</Link>
      </div>

      <h1>Welcome Back</h1>
      <p>Log in to access your dashboard</p>

      {searchParams.get("email") === "verified" ? (
        <div className="auth-notice auth-notice-success">
          Email verified successfully. You can now log in.
        </div>
      ) : null}

      {searchParams.get("reset") === "success" ? (
        <div className="auth-notice auth-notice-success">
          Password reset successfully. Log in with your new password.
        </div>
      ) : null}

      {["expired", "missing-token"].includes(searchParams.get("email") || "") ? (
        <div className="auth-notice auth-notice-error">
          Verification link is invalid or expired.
        </div>
      ) : null}

      {searchParams.get("account") === "terminated" ? (
        <div className="auth-notice auth-notice-error">
          Your account has been suspended permanently for violating PathPayX
          platform rules.
        </div>
      ) : null}

      <div className="auth-card">
        <button className="google-btn" onClick={googleLogin}>
          Sign in with Google
        </button>

        <div className="divider">OR</div>

        <label>Email address</label>
        <input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <div className="auth-password-field">
          <input
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Link href="/forgot-password" className="auth-small-link">
          Forgot password?
        </Link>

        <button className="auth-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
