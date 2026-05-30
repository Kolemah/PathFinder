"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "../context/AppContext";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useAppContext();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      if (!firstName || !lastName || !email || !password || !confirm) {
        showToast("Please fill all fields", "error");
        return;
      }

      if (password !== confirm) {
        showToast("Passwords do not match", "error");
        return;
      }

      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          password,
        }),
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.log("SERVER RESPONSE:", text);
        showToast("Server returned an error page. Check terminal.", "error");
        return;
      }
      if (!res.ok) {
        showToast(data.error || "Registration failed", "error");
        return;
      }

      localStorage.setItem("pathfinderUser", JSON.stringify(data.user));
      localStorage.setItem("pathfinderLoggedIn", "true");
      showToast(data.message || "Account created successfully", "success");

      router.push("/dashboard");

    } catch (error) {
      showToast("Something went wrong", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function googleRegister() {
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
        Existing user?{" "}
        <Link href="/login">
          Sign in
        </Link>
      </div>

      <h1>Welcome to PathPayX</h1>

      <p>
        Sign up and manage your business better
      </p>

      <div className="auth-card">

        <button
          className="google-btn"
          onClick={googleRegister}
        >
          Sign up with Google
        </button>

        <div className="divider">
          OR
        </div>

        <label>First name</label>

        <input
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) =>
            setFirstName(e.target.value)
          }
        />

        <label>Last name</label>

        <input
          placeholder="Enter your last name"
          value={lastName}
          onChange={(e) =>
            setLastName(e.target.value)
          }
        />

        <label>Email address</label>

        <input
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <label>Create password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <label>Confirm password</label>

        <input
          type="password"
          placeholder="Confirm your password"
          value={confirm}
          onChange={(e) =>
            setConfirm(e.target.value)
          }
        />

        <button
          className="auth-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Sign up"}
        </button>

      </div>
    </div>
  );
}
