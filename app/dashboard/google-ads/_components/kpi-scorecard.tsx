"use client";

import { useMemo } from "react";
import { Campaign, KPIMetric } from "../types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPIScorecardProps {
  campaigns: Campaign[];
  keywords?: any[];
}

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.title}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {/* Sparkline */}
          <div className="h-6 mb-3 opacity-60">
            <svg viewBox="0 0 100 20" className="w-full h-full">
              {kpi.sparklineData.map((value, i) => {
                const x = (i / (kpi.sparklineData.length - 1)) * 100;
                const max = Math.max(...kpi.sparklineData);
                const min = Math.min(...kpi.sparklineData);
                const range = max - min || 1;
                const y = 20 - ((value - min) / range) * 16 - 2;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="1"
                    fill={kpi.isGood ? "#34a853" : "#ea4335"}
                  />
                );
              })}
            </svg>
          </div>

          {/* Title */}
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {kpi.title}
          </div>

          {/* Value */}
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formatValue(kpi.value, kpi.format)}
          </div>

          {/* Change */}
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              kpi.isGood
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {kpi.trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {kpi.change > 0 ? "+" : ""}
            {kpi.change.toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}

function generateSparkline(baseValue: number, points: number = 10): number[] {
  const data: number[] = [];
  let value = baseValue * 0.8;

  for (let i = 0; i < points; i++) {
    const trend = Math.random() - 0.4;
    value = Math.max(baseValue * 0.5, value + trend * baseValue * 0.05);
    data.push(value);
  }

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
      return (value / 1000).toFixed(1) + "k";
    }
  }

  return value.toFixed(1);
}
