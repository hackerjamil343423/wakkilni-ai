"use client";

import { useMemo } from "react";
import { DemographicPerformance } from "../types";
import { Users, TrendingUp, AlertCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudienceDemographicsProps {
  data: DemographicPerformance[];
}

export function AudienceDemographics({ data }: AudienceDemographicsProps) {
  // Aggregate data by age group
  const ageGroupMetrics = useMemo(() => {
    const ageGroups: Record<
      string,
      {
        impressions: number;
        clicks: number;
        spend: number;
        conversions: number;
        cpa: number;
        conversionRate: number;
        count: number;
      }
    > = {};

    data.forEach((item) => {
      if (!ageGroups[item.age]) {
        ageGroups[item.age] = {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          cpa: 0,
          conversionRate: 0,
          count: 0,
        };
      }
      ageGroups[item.age].impressions += item.impressions;
      ageGroups[item.age].clicks += item.clicks;
      ageGroups[item.age].spend += item.spend;
      ageGroups[item.age].conversions += item.conversions;
      ageGroups[item.age].cpa += item.cpa;
      ageGroups[item.age].conversionRate += item.conversionRate;
      ageGroups[item.age].count += 1;
    });

    // Calculate averages
    Object.keys(ageGroups).forEach((age) => {
      const group = ageGroups[age];
      group.cpa = group.cpa / group.count;
      group.conversionRate = group.conversionRate / group.count;
    });

    return ageGroups;
  }, [data]);

  const totalSpend = data.reduce((sum, d) => sum + d.spend, 0);
  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
  const avgCPA = (totalSpend / (totalConversions || 1)).toFixed(2);

  // Find best and worst performing age groups
  const ageArray = Object.entries(ageGroupMetrics);
  const bestPerformer = ageArray.reduce((best, current) =>
    current[1].cpa < best[1].cpa ? current : best
  );
  const worstPerformer = ageArray.reduce((worst, current) =>
    current[1].cpa > worst[1].cpa ? current : worst
  );

  const getCPAColor = (cpa: number, avgCPA: number): string => {
    const ratio = cpa / parseFloat(avgCPA);
    if (ratio <= 0.8) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
    if (ratio <= 1) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
    if (ratio <= 1.2) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
  };

  const getConversionRateColor = (rate: number): string => {
    if (rate >= 0.05) return "text-emerald-600 dark:text-emerald-400";
    if (rate >= 0.03) return "text-blue-600 dark:text-blue-400";
    if (rate >= 0.02) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Audience Demographics
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Performance by age segment
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
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
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg CPA</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">${avgCPA}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Age Groups</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{Object.keys(ageGroupMetrics).length}</div>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Best & Worst Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                  Best Performer
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  Age {bestPerformer[0]}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  CPA: <span className="font-semibold">${bestPerformer[1].cpa.toFixed(0)}</span> ({((bestPerformer[1].cpa / parseFloat(avgCPA) - 1) * 100).toFixed(0)}% below avg)
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  CR: <span className="font-semibold">{(bestPerformer[1].conversionRate * 100).toFixed(2)}%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-900 dark:text-red-300 text-sm">
                  Needs Optimization
                </p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400 mt-1">
                  Age {worstPerformer[0]}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 tabular-nums">
                  CPA: <span className="font-semibold">${worstPerformer[1].cpa.toFixed(0)}</span> ({((worstPerformer[1].cpa / parseFloat(avgCPA) - 1) * 100).toFixed(0)}% above avg)
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 tabular-nums">
                  CR: <span className="font-semibold">{(worstPerformer[1].conversionRate * 100).toFixed(2)}%</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Age Group Performance Table */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Performance by Age Group
          </h4>
          <div className="space-y-3">
            {ageArray.map(([age, metrics]) => {
              const cpaRatio = metrics.cpa / parseFloat(avgCPA);
              const barWidth = Math.min(100, (metrics.conversions / Math.max(...ageArray.map(a => a[1].conversions))) * 100);

              return (
                <div key={age}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">
                      Age {age}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400 tabular-nums">
                        {metrics.conversions} conv
                      </span>
                      <span className={cn("font-semibold tabular-nums", cpaRatio <= 0.8 ? "text-emerald-600 dark:text-emerald-400" : cpaRatio <= 1.2 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
                        ${metrics.cpa.toFixed(0)} CPA
                      </span>
                      <span className={cn("font-semibold tabular-nums", getConversionRateColor(metrics.conversionRate))}>
                        {(metrics.conversionRate * 100).toFixed(2)}% CR
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* Conversion bar */}
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          metrics.conversions > 0
                            ? cpaRatio <= 0.8
                              ? "bg-emerald-500"
                              : cpaRatio <= 1
                                ? "bg-blue-500"
                                : cpaRatio <= 1.2
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            : "bg-zinc-400"
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    {/* CPA indicator */}
                    <div className={cn(
                      "text-[10px] font-semibold w-10 text-right tabular-nums",
                      cpaRatio >= 1.2 ? "text-red-500" : cpaRatio <= 0.8 ? "text-emerald-500" : "text-zinc-400"
                    )}>
                      {cpaRatio >= 1.2 ? "High" : cpaRatio <= 0.8 ? "Low" : "Mid"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demographic Insights */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-sky-900 dark:text-sky-300 mb-3">
            Optimization Recommendations
          </h4>
          <ul className="text-xs space-y-2 text-sky-800 dark:text-sky-400">
            <li className="flex gap-2">
              <span className="text-sky-600 dark:text-sky-400 font-semibold flex-shrink-0">•</span>
              <span>
                Increase bids for <span className="font-semibold">Age {bestPerformer[0]}</span> by {Math.max(10, Math.round((parseFloat(avgCPA) / bestPerformer[1].cpa - 1) * 100))}%
              </span>
            </li>
            {worstPerformer[1].cpa > parseFloat(avgCPA) * 1.3 && (
              <li className="flex gap-2">
                <span className="text-sky-600 dark:text-sky-400 font-semibold flex-shrink-0">•</span>
                <span>
                  Reduce bids for <span className="font-semibold">Age {worstPerformer[0]}</span> by 20-30%
                </span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-sky-600 dark:text-sky-400 font-semibold flex-shrink-0">•</span>
              <span>
                Exclude ages with CPA above ${Math.round(parseFloat(avgCPA) * 1.5)}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-sky-600 dark:text-sky-400 font-semibold flex-shrink-0">•</span>
              <span>
                Create dedicated campaigns for high-performing demographics
              </span>
            </li>
          </ul>
        </div>

        {/* Distribution Visualization */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Spend Distribution by Age
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ageArray.map(([age, metrics]) => {
              const spendPct = (metrics.spend / totalSpend) * 100;
              const cpaRatio = metrics.cpa / parseFloat(avgCPA);
              return (
                <div key={age} className={cn(
                  "border rounded-lg p-3 text-center",
                  cpaRatio <= 0.8
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : cpaRatio >= 1.2
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                )}>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Age {age}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold tabular-nums",
                    cpaRatio <= 0.8 ? "text-emerald-600 dark:text-emerald-400" : cpaRatio >= 1.2 ? "text-red-600 dark:text-red-400" : "text-sky-600 dark:text-sky-400"
                  )}>
                    {spendPct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 tabular-nums">
                    ${(metrics.spend / 1000).toFixed(1)}k
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
