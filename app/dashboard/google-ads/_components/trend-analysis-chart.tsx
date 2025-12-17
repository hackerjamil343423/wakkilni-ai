"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyMetrics } from "../types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";

interface TrendAnalysisChartProps {
  data: DailyMetrics[];
  primaryMetric?: string;
  secondaryMetric?: string;
}

const METRIC_OPTIONS = [
  { id: "spend", label: "Spend", format: "currency", color: "#6366f1" },
  { id: "impressions", label: "Impressions", format: "number", color: "#8b5cf6" },
  { id: "clicks", label: "Clicks", format: "number", color: "#3b82f6" },
  { id: "conversions", label: "Conversions", format: "number", color: "#10b981" },
  { id: "conversionValue", label: "Conv. Value", format: "currency", color: "#059669" },
  { id: "ctr", label: "CTR", format: "percentage", color: "#f59e0b" },
  { id: "avgCpc", label: "Avg. CPC", format: "currency", color: "#f97316" },
  { id: "cpa", label: "CPA", format: "currency", color: "#ef4444" },
  { id: "roas", label: "ROAS", format: "ratio", color: "#22c55e" },
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
    if (data.length === 0) return { total: 0, avg: 0, change: 0 };

    const values = data.map((d) => d[selectedPrimary as keyof DailyMetrics] as number);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    return { total, avg, change };
  }, [data, selectedPrimary]);

  const secondaryStats = useMemo(() => {
    if (data.length === 0) return { total: 0, avg: 0, change: 0 };

    const values = data.map((d) => d[selectedSecondary as keyof DailyMetrics] as number);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    return { total, avg, change };
  }, [data, selectedSecondary]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; dataKey: string }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl min-w-[180px]">
        <p className="text-xs font-medium text-zinc-400 mb-2 pb-2 border-b border-zinc-700">
          {label}
        </p>
        {payload.map((entry, index: number) => {
          const config = entry.dataKey === selectedPrimary ? primaryConfig : secondaryConfig;
          return (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-zinc-300">{entry.name}</span>
              </div>
              <span className="text-xs font-semibold text-white tabular-nums">
                {formatTooltipValue(entry.value, config?.format)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Performance Trends
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              30-day comparative analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Primary Metric Selector */}
            <div className="relative">
              <select
                value={selectedPrimary}
                onChange={(e) => setSelectedPrimary(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border-0 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                {METRIC_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
            </div>
            <span className="text-xs text-zinc-400">vs</span>
            {/* Secondary Metric Selector */}
            <div className="relative">
              <select
                value={selectedSecondary}
                onChange={(e) => setSelectedSecondary(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border-0 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                {METRIC_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <StatCard
            label={`${primaryConfig?.label} Total`}
            value={formatValue(primaryStats.total, primaryConfig?.format)}
            change={primaryStats.change}
            color={primaryConfig?.color || "#6366f1"}
          />
          <StatCard
            label={`${primaryConfig?.label} Avg`}
            value={formatValue(primaryStats.avg, primaryConfig?.format)}
            color={primaryConfig?.color || "#6366f1"}
          />
          <StatCard
            label={`${secondaryConfig?.label} Total`}
            value={formatValue(secondaryStats.total, secondaryConfig?.format)}
            change={secondaryStats.change}
            color={secondaryConfig?.color || "#10b981"}
          />
          <StatCard
            label={`${secondaryConfig?.label} Avg`}
            value={formatValue(secondaryStats.avg, secondaryConfig?.format)}
            color={secondaryConfig?.color || "#10b981"}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 pt-4">
        <div className="w-full h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primaryConfig?.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={primaryConfig?.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e4e4e7"
                className="dark:stroke-zinc-800"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                tickFormatter={(value) =>
                  primaryConfig?.format === "currency"
                    ? `$${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                    : value >= 1000 ? (value / 1000).toFixed(0) + "k" : value.toString()
                }
                width={50}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#d4d4d8", strokeDasharray: "4 4" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey={selectedPrimary}
                name={primaryConfig?.label}
                stroke={primaryConfig?.color}
                strokeWidth={2}
                fill="url(#primaryGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: primaryConfig?.color,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
              <Bar
                yAxisId="right"
                dataKey={selectedSecondary}
                name={secondaryConfig?.label}
                fill={secondaryConfig?.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
                opacity={0.8}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryConfig?.color }} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{primaryConfig?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: secondaryConfig?.color }} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{secondaryConfig?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  color,
}: {
  label: string;
  value: string;
  change?: number;
  color: string;
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-lg font-semibold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
        {change !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function formatValue(value: number, format?: string): string {
  if (!format) return value.toString();

  if (format === "currency") {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
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
      return (value / 1000).toFixed(1) + "K";
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
