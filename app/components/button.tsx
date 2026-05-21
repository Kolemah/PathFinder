import React from "react";

export default function Button({
  children,
  onClick,
  color = "#0f172a",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 18px",
        background: color,
        color: "white",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}