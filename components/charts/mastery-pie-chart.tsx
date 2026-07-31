"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, getChartColors } from "./chart-container";
import { dummyChartData } from "@/lib/dummy-data";

interface MasteryPieChartProps {
  title?: string;
  description?: string;
}

export function MasteryPieChart({
  title = "Topic Distribution",
  description = "Status of all topics",
}: MasteryPieChartProps) {
  const data = dummyChartData.topicDistribution;

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

