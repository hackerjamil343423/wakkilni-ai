"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { KPIMetric, DailyMetrics } from "../types";
import { formatCurrency, formatPercentage, calculateKPIForMetric } from "../mock-data";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3, TrendingDownIcon } from "lucide-react";
import {
  CHART_METRICS,
  DEFAULT_CHART_METRICS,
  getMetricsForChartType,
} from "../chart-metrics-config";
import { ChartMetricSelector } from "./chart-metric-selector";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

interface MetricCardProps {
  metric: KPIMetric;
  index: number;
}

const MetricCard = ({ metric, index }: MetricCardProps) => {
  const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;

  const getIcon = () => {
    const title = metric.title.toLowerCase();

    if (title.includes("spend") || title.includes("cost") || title.includes("cpa") || title.includes("cpc")) {
      return DollarSign;
    }
    if (title.includes("roas") || title.includes("roi")) {
      return TrendingUp;
    }
    if (title.includes("mrr") || title.includes("revenue")) {
      return BarChart3;
    }
    if (title.includes("lead") || title.includes("acquisition") || title.includes("cac")) {
      return Target;
    }
    return Users;
  };

  const Icon = getIcon();

  const formatValue = (value: number) => {
    switch (metric.format) {
      case "currency":
        return formatCurrency(value);
      case "ratio":
        return `${value.toFixed(2)}x`;
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  // Determine trend color based on metric type and direction
  const getTrendColor = () => {
    if (metric.isGood) {
      return metric.trend === "up" ? "text-emerald-600" : "text-emerald-600";
    }
    return metric.trend === "up" ? "text-red-500" : "text-red-500";
  };

  const getTrendBgColor = () => {
    if (metric.isGood) {
      return "bg-emerald-50";
    }
    return "bg-red-50";
  };

  // Sparkline color based on performance
  const sparklineColor = metric.isGood ? "#10b981" : "#ef4444";

  // Format sparkline data for chart
  const sparklineData = metric.sparklineData.map((value, i) => ({
    value,
    index: i,
  }));

  return (
    <Card
      className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.5s ease-out forwards",
        opacity: 0,
      }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">
                {metric.title}
              </span>
            </div>

            {/* Value */}
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatValue(metric.value)}
              </span>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-2 mt-2">
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  getTrendBgColor(),
                  getTrendColor()
                )}
              >
                <TrendIcon className="w-3 h-3" />
                <span>{formatPercentage(metric.change)}</span>
              </div>
              <span className="text-xs text-slate-400">vs last period</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="w-20 h-12 -mr-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={sparklineColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor}
                  strokeWidth={1.5}
                  fill={`url(#gradient-${index})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface KPIGridProps {
  dailyMetrics: DailyMetrics[];
  metrics?: KPIMetric[]; // Keep for backward compatibility
}

export function KPIGrid({ dailyMetrics, metrics }: KPIGridProps) {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(DEFAULT_CHART_METRICS.kpiGrid);

  useEffect(() => {
    const saved = localStorage.getItem("meta-ads-kpi-grid-metrics");
    if (saved) {
      setSelectedKPIs(JSON.parse(saved));
    }
  }, []);

  const availableMetrics = useMemo(
    () => getMetricsForChartType("kpi"),
    []
  );

  const handleKPIsChange = (kpis: string | string[]) => {
    const kpisArray = Array.isArray(kpis) ? kpis : [kpis];
    const selected = kpisArray.slice(0, 8);
    setSelectedKPIs(selected);
    localStorage.setItem("meta-ads-kpi-grid-metrics", JSON.stringify(selected));
  };

  // Calculate KPI data for selected metrics
  const calculatedKPIs = useMemo(() => {
    return selectedKPIs
      .map((kpiId) => {
        const config = CHART_METRICS[kpiId];
        if (!config) return null;
        return calculateKPIForMetric(kpiId, dailyMetrics, config.label);
      })
      .filter((kpi) => kpi !== null) as KPIMetric[];
  }, [selectedKPIs, dailyMetrics]);

  // Use calculated KPIs or fallback to passed metrics for backward compatibility
  const displayMetrics = calculatedKPIs.length > 0 ? calculatedKPIs : metrics || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-slate-900">
          Key Performance Indicators
        </h2>
        <ChartMetricSelector
          availableMetrics={availableMetrics}
          selectedMetrics={selectedKPIs}
          onMetricsChange={handleKPIsChange}
          mode="multiple"
          maxSelections={8}
          label="Customize"
          showCategories={false}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, index) => (
          <MetricCard key={metric.title} metric={metric} index={index} />
        ))}
      </div>
    </div>
  );
}
