"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, getChartColors } from "./chart-container";
import type { WeeklyHours } from "@/types";

const DEFAULT_WEEKLY_HOURS: WeeklyHours[] = [
  { day: "Mon", hours: 0, target: 4 },
  { day: "Tue", hours: 0, target: 4 },
  { day: "Wed", hours: 0, target: 4 },
  { day: "Thu", hours: 0, target: 4 },
  { day: "Fri", hours: 0, target: 4 },
  { day: "Sat", hours: 0, target: 4 },
  { day: "Sun", hours: 0, target: 4 },
];

interface WeeklyHoursChartProps {
  data?: WeeklyHours[];
  title?: string;
  description?: string;
}

export function WeeklyHoursChart({
  data = DEFAULT_WEEKLY_HOURS,
  title = "Weekly Study Hours",
  description = "Hours studied vs. daily target",
}: WeeklyHoursChartProps) {
  const colors = getChartColors();

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            vertical={false}
          />
          <XAxis
            dataKey="day"
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
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="hours"
            name="Hours Studied"
            fill={colors.primary}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="target"
            name="Daily Target"
            fill={colors.accent}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

