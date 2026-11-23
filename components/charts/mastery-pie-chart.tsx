"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, getChartColors } from "./chart-container";

interface MasteryPieChartProps {
  data?: Array<{ name: string; value: number; color: string }>;
  title?: string;
  description?: string;
}

export function MasteryPieChart({
  data = [
    { name: "Active", value: 1, color: "var(--primary)" },
  ],
  title = "Topic Distribution",
  description = "Status of all topics",
}: MasteryPieChartProps) {

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

