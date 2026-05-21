"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 400 },
  { month: "Feb", revenue: 700 },
  { month: "Mar", revenue: 500 },
  { month: "Apr", revenue: 900 },
  { month: "May", revenue: 1200 },
];

export default function RevenueChart() {
  return (
    <div
      style={{
        background: "white",
        padding: 24,
        borderRadius: 16,
        marginTop: 30,
        height: 320,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h2>Revenue Overview</h2>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}