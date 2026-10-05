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

interface ProgressChartProps {
  data?: Array<{ month: string; sessions: number; hours: number }>;
  title?: string;
  description?: string;
}

export function ProgressChart({
  data = [
    { month: "Current", sessions: 4, hours: 6 },
  ],
  title = "Progress",
  description = "Monthly study sessions",
}: ProgressChartProps) {
  const colors = getChartColors();

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.5} />
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
          />
          <YAxis
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
            dataKey="sessions"
            name="Sessions"
            stroke={colors.primary}
            strokeWidth={2}
            fill="url(#progressGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

