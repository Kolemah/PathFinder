"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleRegister() {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem(
      "pathfinderUser",
      JSON.stringify({
        name,
        email,
        password,
      })
    );

    alert("Account created successfully");
    router.push("/login");
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1>Create Account</h1>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

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

        <Button onClick={handleRegister}>Register</Button>
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