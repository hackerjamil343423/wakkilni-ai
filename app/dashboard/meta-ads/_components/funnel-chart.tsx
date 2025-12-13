"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelStage } from "../types";
import { formatNumber } from "../mock-data";
import { ArrowDown, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FunnelChartProps {
  data: FunnelStage[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as FunnelStage;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[160px]">
        <p className="text-sm font-medium text-slate-900 mb-2">{data.stage}</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Count:</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(data.value)}
            </span>
          </div>
          {data.dropoffRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Drop-off:</span>
              <span className="font-semibold text-red-500">
                -{data.dropoffRate}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Color gradient for funnel stages
const stageColors = [
  "#6366f1", // Indigo - Impressions
  "#8b5cf6", // Purple - Clicks
  "#a855f7", // Violet - Page Views
  "#10b981", // Emerald - Leads
  "#059669", // Green - Customers
];

export function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <Card className="bg-white border border-slate-200 shadow-sm col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Conversion Funnel
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Acquisition funnel analysis
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex gap-4">
          {/* Bar Chart */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={32}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={stageColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Drop-off Rates */}
          <div className="w-24 flex flex-col justify-center py-4">
            {data.map((stage, index) => (
              <div
                key={stage.stage}
                className="h-[56px] flex items-center justify-center"
              >
                {index > 0 && stage.dropoffRate > 0 && (
                  <div className="flex flex-col items-center">
                    <ArrowDown className="w-3 h-3 text-slate-300 -mb-1" />
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium border-0 px-2",
                        stage.dropoffRate > 50
                          ? "bg-red-50 text-red-600"
                          : stage.dropoffRate > 20
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      )}
                    >
                      <TrendingDown className="w-2.5 h-2.5 mr-1" />
                      {stage.dropoffRate}%
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Overall CVR</p>
            <p className="text-lg font-bold text-slate-900">
              {((data[data.length - 1].value / data[0].value) * 100).toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Biggest Drop</p>
            <p className="text-lg font-bold text-red-500">
              {Math.max(...data.map((d) => d.dropoffRate)).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
