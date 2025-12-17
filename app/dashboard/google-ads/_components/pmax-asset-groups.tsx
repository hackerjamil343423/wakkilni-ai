"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AssetGroup, AdStrength } from "../types";
import { ArrowRight, Zap, ChevronDown, Star, Check, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PMaxAssetGroupsProps {
  data: AssetGroup[];
}

const SORT_OPTIONS = [
  { id: "roas", label: "ROAS" },
  { id: "spend", label: "Spend" },
  { id: "conversions", label: "Conversions" },
] as const;

export function PMaxAssetGroups({ data }: PMaxAssetGroupsProps) {
  const [sortBy, setSortBy] = useState<"roas" | "spend" | "conversions">("roas");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === "roas") return b.roas - a.roas;
      if (sortBy === "spend") return b.spend - a.spend;
      return b.conversions - a.conversions;
    });
  }, [data, sortBy]);

  const getAdStrengthBadge = (strength: AdStrength) => {
    const configs = {
      EXCELLENT: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", label: "Excellent", Icon: Star },
      GOOD: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", label: "Good", Icon: Check },
      AVERAGE: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "Average", Icon: AlertTriangle },
      POOR: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", label: "Poor", Icon: X },
    };

    const config = configs[strength];
    const Icon = config.Icon;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", config.bg, config.text)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getRoasColor = (roas: number): string => {
    if (roas >= 3) return "text-emerald-600 dark:text-emerald-400";
    if (roas >= 2) return "text-blue-600 dark:text-blue-400";
    if (roas >= 1) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const avgRoas = (data.reduce((sum, ag) => sum + ag.roas, 0) / (data.length || 1)).toFixed(2);
  const totalSpend = data.reduce((sum, ag) => sum + ag.spend, 0);
  const totalConversions = data.reduce((sum, ag) => sum + ag.conversions, 0);
  const excellentCount = data.filter((ag) => ag.adStrength === "EXCELLENT").length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Performance Max Asset Groups
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ad strength and performance metrics
              </p>
            </div>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "roas" | "spend" | "conversions")}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border-0 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-2 focus:ring-amber-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Asset Groups</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{data.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Spend</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
            ${(totalSpend / 1000).toFixed(1)}k
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Conversions</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{totalConversions}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg ROAS</div>
          <div className={cn("text-xl font-semibold tabular-nums", getRoasColor(parseFloat(avgRoas)))}>{avgRoas}x</div>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Asset Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedData.map((assetGroup) => {
            const performanceScore = Math.min(100, Math.round((assetGroup.roas / 5) * 100));
            return (
              <div
                key={assetGroup.id}
                className={cn(
                  "group relative border rounded-xl p-4 transition-all hover:shadow-md",
                  assetGroup.adStrength === "EXCELLENT"
                    ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/10"
                    : assetGroup.adStrength === "POOR"
                      ? "border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-900/10"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                      {assetGroup.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          assetGroup.status === "ENABLED"
                            ? "bg-emerald-500"
                            : assetGroup.status === "PAUSED"
                              ? "bg-amber-500"
                              : "bg-zinc-400"
                        )}
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {assetGroup.status === "ENABLED" ? "Active" : assetGroup.status === "PAUSED" ? "Paused" : "Removed"}
                      </span>
                    </div>
                  </div>
                  {getAdStrengthBadge(assetGroup.adStrength)}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">Spend</div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                      ${assetGroup.spend.toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">Conv</div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                      {assetGroup.conversions}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">Value</div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                      ${(assetGroup.conversionValue / 100).toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase">ROAS</div>
                    <div className={cn("text-sm font-semibold tabular-nums", getRoasColor(assetGroup.roas))}>
                      {assetGroup.roas.toFixed(2)}x
                    </div>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Performance</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {performanceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        assetGroup.roas >= 3
                          ? "bg-emerald-500"
                          : assetGroup.roas >= 2
                            ? "bg-blue-500"
                            : assetGroup.roas >= 1
                              ? "bg-amber-500"
                              : "bg-red-500"
                      )}
                      style={{ width: `${performanceScore}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  View Assets
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Ad Strength Distribution */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Ad Strength Distribution
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {(
              [
                { strength: "EXCELLENT" as AdStrength, label: "Excellent", color: "emerald" },
                { strength: "GOOD" as AdStrength, label: "Good", color: "blue" },
                { strength: "AVERAGE" as AdStrength, label: "Average", color: "amber" },
                { strength: "POOR" as AdStrength, label: "Poor", color: "red" },
              ]
            ).map((item) => {
              const count = data.filter((ag) => ag.adStrength === item.strength).length;
              const percentage = (count / data.length) * 100;
              const colorMap = {
                emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
              };

              return (
                <div key={item.strength} className={cn("rounded-lg p-3 text-center border", colorMap[item.color as keyof typeof colorMap])}>
                  <div className="text-2xl font-bold tabular-nums">{count}</div>
                  <div className="text-xs font-medium mt-1">{item.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{percentage.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
