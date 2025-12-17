"use client";

import { useMemo } from "react";
import { Campaign, KPIMetric, Keyword } from "../types";
import { TrendingUp, TrendingDown, DollarSign, Target, Percent, Award, Eye, BarChart3 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface KPIScorecardProps {
  campaigns: Campaign[];
  keywords?: Keyword[];
}

const KPI_ICONS: Record<string, React.ElementType> = {
  "Total Spend": DollarSign,
  "ROAS": BarChart3,
  "CPA": Target,
  "Conversions": Award,
  "Search Impr. Share": Eye,
  "Avg. Quality Score": Percent,
};

export function KPIScorecard({ campaigns, keywords = [] }: KPIScorecardProps) {
  const kpis = useMemo(() => {
    const metrics: KPIMetric[] = [];

    // Total Spend
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const prevSpend = totalSpend * 0.85;
    metrics.push({
      title: "Total Spend",
      value: totalSpend,
      change: ((totalSpend - prevSpend) / prevSpend) * 100,
      trend: totalSpend >= prevSpend ? "up" : "down",
      format: "currency",
      sparklineData: generateSparkline(totalSpend),
      isGood: true,
    });

    // ROAS
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalConversionValue = campaigns.reduce((sum, c) => sum + c.conversionValue, 0);
    const roas = totalConversions > 0 ? totalConversionValue / totalSpend : 0;
    const prevRoas = roas * 0.95;
    metrics.push({
      title: "ROAS",
      value: roas,
      change: ((roas - prevRoas) / prevRoas) * 100,
      trend: roas >= prevRoas ? "up" : "down",
      format: "ratio",
      sparklineData: generateSparkline(roas),
      isGood: roas >= 2,
    });

    // CPA
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const prevCpa = cpa * 1.05;
    metrics.push({
      title: "CPA",
      value: cpa,
      change: ((prevCpa - cpa) / cpa) * 100,
      trend: cpa <= prevCpa ? "up" : "down",
      format: "currency",
      sparklineData: generateSparkline(cpa),
      isGood: cpa < 50,
    });

    // Conversions
    const prevConversions = totalConversions * 0.92;
    metrics.push({
      title: "Conversions",
      value: totalConversions,
      change: ((totalConversions - prevConversions) / prevConversions) * 100,
      trend: totalConversions >= prevConversions ? "up" : "down",
      format: "number",
      sparklineData: generateSparkline(totalConversions),
      isGood: true,
    });

    // Search Impression Share
    const impressionShare =
      campaigns
        .filter((c) => c.searchImpressionShare)
        .reduce((sum, c) => sum + (c.searchImpressionShare || 0), 0) /
      campaigns.filter((c) => c.searchImpressionShare).length || 0;
    const prevIS = impressionShare * 0.98;
    metrics.push({
      title: "Search Impr. Share",
      value: impressionShare,
      change: ((impressionShare - prevIS) / prevIS) * 100,
      trend: impressionShare >= prevIS ? "up" : "down",
      format: "percentage",
      sparklineData: generateSparkline(impressionShare),
      isGood: impressionShare > 0.5,
    });

    // Average Quality Score
    const avgQS =
      keywords.length > 0
        ? keywords.reduce((sum, k) => sum + k.qualityScore, 0) / keywords.length
        : 7;
    const prevQS = avgQS * 0.99;
    metrics.push({
      title: "Avg. Quality Score",
      value: avgQS,
      change: avgQS - prevQS,
      trend: avgQS >= prevQS ? "up" : "down",
      format: "number",
      sparklineData: generateSparkline(avgQS),
      isGood: avgQS >= 6,
    });

    return metrics;
  }, [campaigns, keywords]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = KPI_ICONS[kpi.title] || BarChart3;
        const sparklineColor = kpi.isGood ? "#10b981" : "#ef4444";
        const sparklineData = kpi.sparklineData.map((value, i) => ({ value, index: i }));

        return (
          <div
            key={kpi.title}
            className={cn(
              "relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5",
              "hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200",
              "group"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            {/* Background Sparkline */}
            <div className="absolute inset-x-0 bottom-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
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

            {/* Content */}
            <div className="relative z-10">
              {/* Header with Icon */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg",
                  kpi.isGood
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                )}>
                  <Icon className={cn(
                    "h-3.5 w-3.5",
                    kpi.isGood
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )} />
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
              </div>

              {/* Value with tabular numbers */}
              <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums mb-2">
                {formatValue(kpi.value, kpi.format)}
              </div>

              {/* Change Badge */}
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                kpi.isGood
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              )}>
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="tabular-nums">
                  {kpi.change > 0 ? "+" : ""}{kpi.change.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function generateSparkline(baseValue: number, points: number = 14): number[] {
  const data: number[] = [];
  let value = baseValue * 0.85;

  for (let i = 0; i < points; i++) {
    const trend = Math.random() - 0.4;
    value = Math.max(baseValue * 0.6, Math.min(baseValue * 1.2, value + trend * baseValue * 0.08));
    data.push(value);
  }

  // Ensure the last value trends toward the base value
  data[data.length - 1] = baseValue;
  return data;
}

function formatValue(value: number, format: string): string {
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
      return (value / 1000).toFixed(1) + "K";
    }
  }

  return value.toFixed(1);
}
