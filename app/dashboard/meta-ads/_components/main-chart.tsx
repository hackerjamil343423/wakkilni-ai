"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChartData } from "../types";
import { formatCurrency, formatDate } from "../mock-data";
import {
  ComposedChart,
  Area,
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

interface MainChartProps {
  data: TrendChartData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-[200px]">
        <p className="text-sm font-medium text-slate-900 mb-3 pb-2 border-b border-slate-100">
          {formatDate(label || "")}
        </p>
        {payload.map((entry: any, index: number) => {
          const metricConfig = CHART_METRICS[entry.dataKey];
          const formattedValue = metricConfig
            ? formatMetricValue(entry.value, metricConfig.format)
            : entry.value;

          return (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
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
    );
  }
  return null;
};

export function MainChart({ data }: MainChartProps) {
  const [primaryMetric, setPrimaryMetric] = useState<string>(DEFAULT_CHART_METRICS.mainChartPrimary);
  const [secondaryMetric, setSecondaryMetric] = useState<string>(DEFAULT_CHART_METRICS.mainChartSecondary);

  useEffect(() => {
    const savedPrimary = localStorage.getItem("meta-ads-main-chart-primary");
    const savedSecondary = localStorage.getItem("meta-ads-main-chart-secondary");
    if (savedPrimary) setPrimaryMetric(savedPrimary);
    if (savedSecondary) setSecondaryMetric(savedSecondary);
  }, []);

  const primaryConfig = CHART_METRICS[primaryMetric];
  const secondaryConfig = CHART_METRICS[secondaryMetric];

  const availablePrimaryMetrics = useMemo(
    () => getMetricsForChartType("area"),
    []
  );
  const availableSecondaryMetrics = useMemo(
    () => getMetricsForChartType("bar"),
    []
  );

  const handlePrimaryChange = (metric: string | string[]) => {
    const value = Array.isArray(metric) ? metric[0] : metric;
    setPrimaryMetric(value);
    localStorage.setItem("meta-ads-main-chart-primary", value);
  };

  const handleSecondaryChange = (metric: string | string[]) => {
    const value = Array.isArray(metric) ? metric[0] : metric;
    setSecondaryMetric(value);
    localStorage.setItem("meta-ads-main-chart-secondary", value);
  };

  const getGradientColor = (metricId: string): string => {
    const colors: Record<string, string> = {
      spend: "#6366f1",
      impressions: "#8b5cf6",
      clicks: "#3b82f6",
      leads: "#0ea5e9",
      trials: "#06b6d4",
      purchases: "#10b981",
      conversions: "#14b8a6",
      revenue: "#f59e0b",
    };
    return colors[metricId] || "#6366f1";
  };

  const primaryColor = getGradientColor(primaryMetric);
  const secondaryColor = getGradientColor(secondaryMetric);

  if (!primaryConfig || !secondaryConfig) {
    return null;
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Trend Analysis
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Daily metrics comparison
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Primary:</span>
              <ChartMetricSelector
                availableMetrics={availablePrimaryMetrics}
                selectedMetrics={primaryMetric}
                onMetricsChange={handlePrimaryChange}
                mode="single"
                showCategories={false}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Secondary:</span>
              <ChartMetricSelector
                availableMetrics={availableSecondaryMetrics}
                selectedMetrics={secondaryMetric}
                onMetricsChange={handleSecondaryChange}
                mode="single"
                showCategories={false}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={primaryColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="date"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) => formatDate(value)}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) =>
                primaryConfig.format === "currency"
                  ? `$${value}`
                  : value.toString()
              }
              width={60}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-slate-600">{value}</span>
              )}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={primaryMetric}
              name={primaryConfig.label}
              stroke={primaryColor}
              strokeWidth={2}
              fill="url(#primaryGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: primaryColor,
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
            <Bar
              yAxisId="right"
              dataKey={secondaryMetric}
              name={secondaryConfig.label}
              fill={secondaryColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              opacity={0.8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
