import React from "react";

function buttonColor(color: string) {
  const normalized = color.toLowerCase();

  if (normalized === "green" || normalized === "#16a34a") return "#0f766e";
  if (normalized === "red") return "#dc2626";
  if (normalized === "#2563eb") return "#2563eb";
  if (normalized === "#64748b") return "#607089";
  if (normalized === "#0f172a") return "#102033";

  return color;
}

export default function Button({
  children,
  onClick,
  color = "#0f766e",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 18px",
        background: buttonColor(color),
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        fontWeight: 700,
        boxShadow: disabled ? "none" : "0 10px 22px rgba(15, 118, 110, 0.16)",
      }}
    >
      {children}
    </button>
  );
}
