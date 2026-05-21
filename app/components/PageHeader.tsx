import React from "react";

export default function PageHeader({
  title,
}: {
  title: string;
}) {
  return (
    <div
      style={{
        marginBottom: 30,
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: "bold",
        }}
      >
        {title}
      </h1>
    </div>
  );
}