"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetGroup, AdStrength } from "../types";
import { ArrowRight, Zap } from "lucide-react";

interface PMaxAssetGroupsProps {
  data: AssetGroup[];
}

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
      EXCELLENT: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", label: "Excellent", icon: "⭐" },
      GOOD: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", label: "Good", icon: "✓" },
      AVERAGE: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-300", label: "Average", icon: "◐" },
      POOR: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300", label: "Poor", icon: "✕" },
    };

    const config = configs[strength];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getRoasColor = (roas: number): string => {
    if (roas >= 3) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
    if (roas >= 2) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
    if (roas >= 1) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
  };

  const avgRoas = (data.reduce((sum, ag) => sum + ag.roas, 0) / (data.length || 1)).toFixed(2);
  const totalSpend = data.reduce((sum, ag) => sum + ag.spend, 0);
  const totalConversions = data.reduce((sum, ag) => sum + ag.conversions, 0);

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Performance Max Asset Groups
            </CardTitle>
            <CardDescription>
              Monitor ad strength and performance metrics across asset groups
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="roas">Sort by ROAS</option>
              <option value="spend">Sort by Spend</option>
              <option value="conversions">Sort by Conversions</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Spend
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${(totalSpend / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Conversions
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalConversions}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg ROAS
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {avgRoas}x
            </div>
          </div>
        </div>

        {/* Asset Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedData.map((assetGroup) => (
            <div
              key={assetGroup.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {assetGroup.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ID: {assetGroup.id}
                  </p>
                </div>
                {getAdStrengthBadge(assetGroup.adStrength)}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    assetGroup.status === "ENABLED"
                      ? "bg-green-500"
                      : assetGroup.status === "PAUSED"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                  }`}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {assetGroup.status === "ENABLED"
                    ? "Active"
                    : assetGroup.status === "PAUSED"
                      ? "Paused"
                      : "Removed"}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Spend
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${assetGroup.spend.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Conversions
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {assetGroup.conversions}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Conv. Value
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${(assetGroup.conversionValue / 100).toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    ROAS
                  </div>
                  <div className={`text-sm font-semibold ${getRoasColor(assetGroup.roas)}`}>
                    {assetGroup.roas.toFixed(2)}x
                  </div>
                </div>
              </div>

              {/* Performance Gauge */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Performance Score
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {Math.min(100, Math.round((assetGroup.roas / 5) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      assetGroup.roas >= 3
                        ? "bg-emerald-500"
                        : assetGroup.roas >= 2
                          ? "bg-blue-500"
                          : assetGroup.roas >= 1
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (assetGroup.roas / 5) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                View Assets
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          ))}
        </div>

        {/* Ad Strength Distribution */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Ad Strength Distribution
          </h4>
          <div className="space-y-2">
            {(
              [
                {
                  strength: "EXCELLENT",
                  count: data.filter((ag) => ag.adStrength === "EXCELLENT").length,
                },
                {
                  strength: "GOOD",
                  count: data.filter((ag) => ag.adStrength === "GOOD").length,
                },
                {
                  strength: "AVERAGE",
                  count: data.filter((ag) => ag.adStrength === "AVERAGE").length,
                },
                {
                  strength: "POOR",
                  count: data.filter((ag) => ag.adStrength === "POOR").length,
                },
              ] as any
            ).map((item) => {
              const percentage = (item.count / data.length) * 100;
              return (
                <div key={item.strength} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {item.strength}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        item.strength === "EXCELLENT"
                          ? "bg-emerald-500"
                          : item.strength === "GOOD"
                            ? "bg-blue-500"
                            : item.strength === "AVERAGE"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
