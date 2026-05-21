"use client";

import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: darkMode ? "#f8fafc" : "#0f172a",
        color: darkMode ? "#0f172a" : "white",
      }}
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}