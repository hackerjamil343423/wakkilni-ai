"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyMetrics } from "../types";

interface TrendAnalysisChartProps {
  data: DailyMetrics[];
  primaryMetric?: string;
  secondaryMetric?: string;
}

const METRIC_OPTIONS = [
  { id: "spend", label: "Ad Spend", format: "currency", color: "#ea4335" },
  { id: "impressions", label: "Impressions", format: "number", color: "#1a73e8" },
  { id: "clicks", label: "Clicks", format: "number", color: "#4285f4" },
  { id: "conversions", label: "Conversions", format: "number", color: "#34a853" },
  { id: "conversionValue", label: "Conv. Value", format: "currency", color: "#34a853" },
  { id: "ctr", label: "CTR", format: "percentage", color: "#fbbc04" },
  { id: "avgCpc", label: "Avg. CPC", format: "currency", color: "#fbbc04" },
  { id: "cpa", label: "CPA", format: "currency", color: "#ea4335" },
  { id: "roas", label: "ROAS", format: "ratio", color: "#34a853" },
];

export function TrendAnalysisChart({
  data,
  primaryMetric = "spend",
  secondaryMetric = "conversions",
}: TrendAnalysisChartProps) {
  const [selectedPrimary, setSelectedPrimary] = useState(primaryMetric);
  const [selectedSecondary, setSelectedSecondary] = useState(secondaryMetric);

  const primaryConfig = METRIC_OPTIONS.find((m) => m.id === selectedPrimary);
  const secondaryConfig = METRIC_OPTIONS.find((m) => m.id === selectedSecondary);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      [selectedPrimary]: item[selectedPrimary as keyof DailyMetrics],
      [selectedSecondary]: item[selectedSecondary as keyof DailyMetrics],
    }));
  }, [data, selectedPrimary, selectedSecondary]);

  const primaryStats = useMemo(() => {
    if (data.length === 0) return { total: 0, avg: 0, max: 0, min: 0 };

    const values = data.map((d) => d[selectedPrimary as keyof DailyMetrics] as number);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, avg, max, min };
  }, [data, selectedPrimary]);

  const secondaryStats = useMemo(() => {
    if (data.length === 0) return { total: 0, avg: 0, max: 0, min: 0 };

    const values = data.map((d) => d[selectedSecondary as keyof DailyMetrics] as number);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, avg, max, min };
  }, [data, selectedSecondary]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {payload[0]?.payload?.date}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {formatTooltipValue(entry.value, entry.dataKey === selectedPrimary ? primaryConfig?.format : secondaryConfig?.format)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>30-day performance overview</CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPrimary}
              onChange={(e) => setSelectedPrimary(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              {METRIC_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={selectedSecondary}
              onChange={(e) => setSelectedSecondary(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              {METRIC_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryConfig?.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryConfig?.color} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryConfig?.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={secondaryConfig?.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" dark-stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis
                yAxisId="left"
                stroke={primaryConfig?.color}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={secondaryConfig?.color}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />
              <Bar
                yAxisId="left"
                dataKey={selectedPrimary}
                fill={primaryConfig?.color}
                fillOpacity={0.6}
                name={primaryConfig?.label}
                radius={[8, 8, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={selectedSecondary}
                stroke={secondaryConfig?.color}
                strokeWidth={2}
                dot={{ fill: secondaryConfig?.color, r: 4 }}
                activeDot={{ r: 6 }}
                name={secondaryConfig?.label}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Primary Stats */}
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              {primaryConfig?.label} - Total
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: primaryConfig?.color }}
            >
              {formatValue(primaryStats.total, primaryConfig?.format)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              {primaryConfig?.label} - Avg
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: primaryConfig?.color }}
            >
              {formatValue(primaryStats.avg, primaryConfig?.format)}
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              {secondaryConfig?.label} - Total
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: secondaryConfig?.color }}
            >
              {formatValue(secondaryStats.total, secondaryConfig?.format)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              {secondaryConfig?.label} - Avg
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: secondaryConfig?.color }}
            >
              {formatValue(secondaryStats.avg, secondaryConfig?.format)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatValue(value: number, format?: string): string {
  if (!format) return value.toString();

  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: value < 100 ? 2 : 0,
    }).format(value);
  }

  if (format === "percentage") {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (format === "ratio") {
    return `${value.toFixed(2)}x`;
  }

  if (format === "number") {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "k";
    }
  }

  return value.toFixed(1);
}

function formatTooltipValue(value: number, format?: string): string {
  if (!format) return value.toString();

  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (format === "percentage") {
    return `${(value * 100).toFixed(2)}%`;
  }

  if (format === "ratio") {
    return `${value.toFixed(2)}x`;
  }

  if (format === "number") {
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  }

  return value.toFixed(2);
}
