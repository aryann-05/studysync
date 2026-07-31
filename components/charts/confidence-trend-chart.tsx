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
import { ChartContainer, getChartColors } from "./chart-container";
import { dummyConfidenceTrend } from "@/lib/dummy-data";

interface ConfidenceTrendChartProps {
  data?: typeof dummyConfidenceTrend;
  title?: string;
  description?: string;
}

export function ConfidenceTrendChart({
  data = dummyConfidenceTrend,
  title = "Confidence Trend",
  description = "Average confidence score over time",
}: ConfidenceTrendChartProps) {
  const colors = getChartColors();

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.6} />
              <stop offset="95%" stopColor={colors.secondary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="Confidence Score"
            stroke={colors.secondary}
            strokeWidth={2}
            fill="url(#confidenceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

