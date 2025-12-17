"use client";

import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ZAxis,
  ReferenceLine,
} from "recharts";
import { QualityScoreDataPoint } from "../types";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertCircle, Target } from "lucide-react";

interface QualityScoreMatrixProps {
  data: QualityScoreDataPoint[];
}

const FILTERS = [
  { id: null, label: "All", icon: Target },
  { id: "below_average", label: "Issues", icon: AlertTriangle },
  { id: "high_spend_low_quality", label: "Bleeders", icon: AlertCircle },
  { id: "high_cpa", label: "High CPA", icon: AlertCircle },
] as const;

export function QualityScoreMatrix({ data }: QualityScoreMatrixProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!selectedFilter) return data;

    if (selectedFilter === "below_average") {
      return data.filter(
        (d) =>
          d.expectedCTR === "BELOW_AVERAGE" ||
          d.adRelevance === "BELOW_AVERAGE" ||
          d.landingPageExperience === "BELOW_AVERAGE"
      );
    }

    if (selectedFilter === "high_spend_low_quality") {
      return data.filter((d) => d.spend > 1500 && d.qualityScore < 6);
    }

    if (selectedFilter === "high_cpa") {
      return data.filter((d) => d.cpa > 75);
    }

    return data;
  }, [data, selectedFilter]);

  const stats = useMemo(() => {
    const avgQS = filteredData.reduce((sum, k) => sum + k.qualityScore, 0) / (filteredData.length || 1);
    const avgCPA = filteredData.reduce((sum, k) => sum + k.cpa, 0) / (filteredData.length || 1);
    const totalSpend = filteredData.reduce((sum, k) => sum + k.spend, 0);
    const belowAvgCount = filteredData.filter(
      (d) =>
        d.expectedCTR === "BELOW_AVERAGE" ||
        d.adRelevance === "BELOW_AVERAGE" ||
        d.landingPageExperience === "BELOW_AVERAGE"
    ).length;

    return { avgQS, avgCPA, totalSpend, belowAvgCount };
  }, [filteredData]);

  const getQualityColor = (point: QualityScoreDataPoint): string => {
    const allAboveAverage =
      point.expectedCTR === "ABOVE_AVERAGE" &&
      point.adRelevance === "ABOVE_AVERAGE" &&
      point.landingPageExperience === "ABOVE_AVERAGE";

    const anyBelowAverage =
      point.expectedCTR === "BELOW_AVERAGE" ||
      point.adRelevance === "BELOW_AVERAGE" ||
      point.landingPageExperience === "BELOW_AVERAGE";

    if (allAboveAverage) return "#10b981";
    if (anyBelowAverage) return "#ef4444";
    return "#f59e0b";
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: QualityScoreDataPoint }> }) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0].payload as QualityScoreDataPoint;

    const getStatusIcon = (status: string) => {
      if (status === "ABOVE_AVERAGE") return <CheckCircle className="h-3 w-3 text-emerald-400" />;
      if (status === "BELOW_AVERAGE") return <AlertTriangle className="h-3 w-3 text-red-400" />;
      return <AlertCircle className="h-3 w-3 text-amber-400" />;
    };

    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl min-w-[220px]">
        <p className="text-sm font-semibold text-white mb-3 pb-2 border-b border-zinc-700 truncate">
          {point.keyword}
        </p>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Quality Score</span>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              point.qualityScore >= 7 ? "text-emerald-400" : point.qualityScore >= 5 ? "text-amber-400" : "text-red-400"
            )}>
              {point.qualityScore}/10
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">CPA</span>
            <span className="text-sm font-semibold text-white tabular-nums">${point.cpa.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Spend</span>
            <span className="text-sm font-semibold text-white tabular-nums">${point.spend.toFixed(0)}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-zinc-700 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">Expected CTR</span>
            {getStatusIcon(point.expectedCTR)}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">Ad Relevance</span>
            {getStatusIcon(point.adRelevance)}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">Landing Page</span>
            {getStatusIcon(point.landingPageExperience)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Quality Score Matrix
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              QS vs CPA distribution (bubble = spend)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
          {FILTERS.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id ?? "all"}
                onClick={() => setSelectedFilter(filter.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  isActive
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Keywords</div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{filteredData.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg QS</div>
          <div className={cn(
            "text-lg font-semibold tabular-nums",
            stats.avgQS >= 7 ? "text-emerald-600 dark:text-emerald-400" : stats.avgQS >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
          )}>
            {stats.avgQS.toFixed(1)}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg CPA</div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">${stats.avgCPA.toFixed(0)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Issues</div>
          <div className={cn(
            "text-lg font-semibold tabular-nums",
            stats.belowAvgCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            {stats.belowAvgCount}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e4e4e7"
                className="dark:stroke-zinc-800"
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="qualityScore"
                domain={[1, 10]}
                name="Quality Score"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                label={{ value: "Quality Score", position: "bottom", offset: 5, fontSize: 11, fill: "#71717a" }}
              />
              <YAxis
                type="number"
                dataKey="cpa"
                name="CPA"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                tickFormatter={(value) => `$${value}`}
                width={45}
              />
              <ZAxis
                type="number"
                dataKey="spend"
                range={[40, 300]}
                name="Spend"
              />
              <ReferenceLine x={6} stroke="#d4d4d8" strokeDasharray="4 4" />
              <ReferenceLine y={50} stroke="#d4d4d8" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#d4d4d8", strokeDasharray: "4 4" }} />
              <Scatter
                name="Keywords"
                data={filteredData}
                fillOpacity={0.7}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getQualityColor(entry)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">All Above Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Mixed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Below Avg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
