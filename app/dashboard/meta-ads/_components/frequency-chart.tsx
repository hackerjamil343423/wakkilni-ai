"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FrequencyBucket } from "../types";
import { formatCurrency, formatNumber } from "../mock-data";
import { AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CHART_METRICS,
  DEFAULT_CHART_METRICS,
  getMetricsForChartType,
  formatMetricValue,
} from "../chart-metrics-config";
import { ChartMetricSelector } from "./chart-metric-selector";

interface FrequencyChartProps {
  data: FrequencyBucket[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="text-sm font-medium text-slate-900 mb-2">
          Frequency: {label}x
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const metricConfig = CHART_METRICS[entry.dataKey];
            const formattedValue = metricConfig
              ? formatMetricValue(entry.value, metricConfig.format)
              : entry.value;

            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-slate-600">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function FrequencyChart({ data }: FrequencyChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<[string, string]>([
    DEFAULT_CHART_METRICS.frequencyChart[0],
    DEFAULT_CHART_METRICS.frequencyChart[1],
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("meta-ads-frequency-chart-metrics");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedMetrics([parsed[0] || "reach", parsed[1] || "cpa"]);
    }
  }, []);

  const metric1Config = CHART_METRICS[selectedMetrics[0]];
  const metric2Config = CHART_METRICS[selectedMetrics[1]];

  const availableMetrics = useMemo(
    () => getMetricsForChartType("bar"),
    []
  );

  const handleMetricsChange = (metrics: string | string[]) => {
    const metricsArray = Array.isArray(metrics) ? metrics : [metrics];
    const selected = [
      metricsArray[0] || selectedMetrics[0],
      metricsArray[1] || selectedMetrics[1],
    ] as [string, string];
    setSelectedMetrics(selected);
    localStorage.setItem(
      "meta-ads-frequency-chart-metrics",
      JSON.stringify(selected)
    );
  };

  const colorMap: Record<string, string> = {
    reach: "#6366f1",
    impressions: "#8b5cf6",
    clicks: "#3b82f6",
    leads: "#0ea5e9",
    conversions: "#14b8a6",
    cpa: "#f97316",
    spend: "#ec4899",
    revenue: "#f59e0b",
  };

  const metric1Color = colorMap[selectedMetrics[0]] || "#6366f1";
  const metric2Color = colorMap[selectedMetrics[1]] || "#f97316";

  if (!metric1Config || !metric2Config) {
    return null;
  }

  // Calculate insights for metric2 if it's "cpa" (cost metric)
  const metric2Values = data.map(
    (d) => d[selectedMetrics[1] as keyof FrequencyBucket] as number
  );
  const metric2LowAvg = (metric2Values[0] + metric2Values[1]) / 2;
  const metric2HighAvg = (metric2Values[3] + metric2Values[4]) / 2;
  const metric2Difference =
    ((metric2HighAvg - metric2LowAvg) / metric2LowAvg) * 100;

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Frequency Analysis
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Ad frequency impact on performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ChartMetricSelector
              availableMetrics={availableMetrics}
              selectedMetrics={selectedMetrics}
              onMetricsChange={handleMetricsChange}
              mode="multiple"
              maxSelections={2}
              label="Metrics"
              showCategories={false}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="frequency"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) => `${value}x`}
            />
            <YAxis
              yAxisId="left"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) =>
                metric1Config.format === "currency"
                  ? `$${value}`
                  : formatNumber(value)
              }
              width={50}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) =>
                metric2Config.format === "currency"
                  ? `$${value}`
                  : formatNumber(value)
              }
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-slate-600">{value}</span>
              )}
            />
            <Bar
              yAxisId="left"
              dataKey={selectedMetrics[0]}
              name={metric1Config.label}
              fill={metric1Color}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="right"
              dataKey={selectedMetrics[1]}
              name={metric2Config.label}
              fill={metric2Color}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Insight Card */}
        {metric2Difference > 10 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <p className="text-xs text-slate-500 mb-1">Frequency Impact</p>
                <p className="text-sm font-medium text-slate-900">
                  {metric2Config.label} increases by{" "}
                  <span
                    className={
                      metric2Difference > 0
                        ? "text-red-500 font-bold"
                        : "text-emerald-600 font-bold"
                    }
                  >
                    {metric2Difference.toFixed(0)}%
                  </span>{" "}
                  at high frequency
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Optimal Range</p>
                <p className="text-sm font-bold text-emerald-600">1-2x</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
