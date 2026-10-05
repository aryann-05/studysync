"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, getChartColors } from "./chart-container";

interface TopicsBarChartProps {
  data?: Array<{ subject: string; hours: number; color: string }>;
  title?: string;
  description?: string;
}

export function TopicsBarChart({
  data = [
    { subject: "General", hours: 4, color: "var(--primary)" },
  ],
  title = "Study Hours by Subject",
  description = "Total hours per subject",
}: TopicsBarChartProps) {
  const colors = getChartColors();

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="subject"
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="hours" name="Hours" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {data.map((entry) => (
              <Cell key={entry.subject} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

