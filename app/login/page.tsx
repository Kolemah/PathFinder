"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    const savedUser = localStorage.getItem("pathfinderUser");

    if (!savedUser) {
      alert("No account found. Please register first.");
      return;
    }

    const user = JSON.parse(savedUser);

    if (user.email !== email || user.password !== password) {
      alert("Invalid email or password");
      return;
    }

    localStorage.setItem("pathfinderLoggedIn", "true");

    alert("Login successful");
    router.push("/dashboard");}

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1>Login</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <Button onClick={handleLogin}>Login</Button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f1f5f9",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 30,
  borderRadius: 16,
  width: 380,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: 12,
  marginTop: 15,
  marginBottom: 15,
  borderRadius: 8,
  border: "1px solid #ccc",
};