"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { OpportunityData } from "../types";

interface OpportunityHeatmapProps {
  data: OpportunityData[];
}

export function OpportunityHeatmap({ data }: OpportunityHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance vs. Potential</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current performance compared to estimated potential
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="category"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              name="Current Performance"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="potential"
              fill="hsl(var(--muted-foreground))"
              name="Potential"
              radius={[4, 4, 0, 0]}
              opacity={0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
