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
  { label: "Jan", revenue: 400 },
  { label: "Feb", revenue: 700 },
  { label: "Mar", revenue: 500 },
  { label: "Apr", revenue: 900 },
  { label: "May", revenue: 1200 },
];

type RevenueChartProps = {
  chartData?: {
    label: string;
    revenue: number;
  }[];
  title?: string;
};

export default function RevenueChart({
  chartData,
  title = "Revenue Overview",
}: RevenueChartProps) {
  const displayData = chartData && chartData.length > 0 ? chartData : data;

  return (
    <div
      style={{
        background: "white",
        padding: 24,
        borderRadius: 8,
        marginTop: 30,
        height: 320,
        border: "1px solid #dbe4ee",
        boxShadow: "0 14px 34px rgba(16,32,51,0.07)",
      }}
    >
      <h2>{title}</h2>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={displayData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0f766e"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
