"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightEntry } from "@/server/domain/tracking/tracking.service";

interface WeightTrendChartProps {
  data: WeightEntry[];
}

export function WeightTrendChart({ data }: WeightTrendChartProps) {
  const chartData = data.map((entry) => ({
    date: entry.loggedAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    weight: Number(entry.weightKg.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="15%" stopColor="#7ddc3a" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#7ddc3a" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
        <XAxis
          dataKey="date"
          stroke="#ffffff80"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          stroke="#ffffff80"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={36}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#122313",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f2f7f0",
          }}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#7ddc3a"
          strokeWidth={3}
          fill="url(#weightGradient)"
          dot={{ stroke: "#7ddc3a", strokeWidth: 2, r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
