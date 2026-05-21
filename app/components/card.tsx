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
        background: darkMode ? "#0f172a" : "white",
        color: darkMode ? "white" : "#0f172a",
        padding: 24,
        borderRadius: 16,
        width: width || "auto",
        boxShadow: darkMode
          ? "0 2px 8px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}