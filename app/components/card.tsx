"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";

export default function Card({
  children,
  width,
}: {
  children: React.ReactNode;
  width?: number | string;
}) {
  const { darkMode } = useAppContext();

  return (
    <div
      style={{
        background: darkMode ? "#111827" : "white",
        color: darkMode ? "white" : "#102033",
        padding: 24,
        borderRadius: 8,
        width: width || "auto",
        border: darkMode ? "1px solid #263244" : "1px solid #dbe4ee",
        boxShadow: darkMode
          ? "0 14px 34px rgba(0,0,0,0.24)"
          : "0 14px 34px rgba(16,32,51,0.07)",
      }}
    >
      {children}
    </div>
  );
}
