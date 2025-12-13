"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemographicPerformance } from "../types";
import { Users, TrendingDown, AlertCircle } from "lucide-react";

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
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audience Demographics
            </CardTitle>
            <CardDescription>
              Performance analysis by age group and demographic segments
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              Avg CPA
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${avgCPA}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Age Groups
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {Object.keys(ageGroupMetrics).length}
            </div>
          </div>
        </div>

        {/* Best & Worst Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 transform rotate-180" />
              <div>
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                  ✓ Best Performer
                </h4>
                <div className="text-sm">
                  <p className="text-emerald-800 dark:text-emerald-400 font-semibold">
                    Age {bestPerformer[0]}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    CPA: ${bestPerformer[1].cpa.toFixed(0)} ({((bestPerformer[1].cpa / parseFloat(avgCPA) - 1) * 100).toFixed(0)}% below average)
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Conv Rate: {(bestPerformer[1].conversionRate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                  ⚠️ Needs Optimization
                </h4>
                <div className="text-sm">
                  <p className="text-red-800 dark:text-red-400 font-semibold">
                    Age {worstPerformer[0]}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    CPA: ${worstPerformer[1].cpa.toFixed(0)} ({((worstPerformer[1].cpa / parseFloat(avgCPA) - 1) * 100).toFixed(0)}% above average)
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                    Conv Rate: {(worstPerformer[1].conversionRate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Age Group Performance Table */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Performance by Age Group
          </h4>
          <div className="space-y-3">
            {ageArray.map(([age, metrics]) => {
              const cpaRatio = metrics.cpa / parseFloat(avgCPA);
              const barWidth = Math.min(100, (metrics.conversions / Math.max(...ageArray.map(a => a[1].conversions))) * 100);

              return (
                <div key={age}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      Age {age}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-700 dark:text-gray-300">
                        {metrics.conversions} conversions
                      </span>
                      <span className={`font-semibold ${getCPAColor(metrics.cpa, avgCPA)}`}>
                        ${metrics.cpa.toFixed(0)} CPA
                      </span>
                      <span className={`font-semibold ${getConversionRateColor(metrics.conversionRate)}`}>
                        {(metrics.conversionRate * 100).toFixed(2)}% CR
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Conversion bar */}
                    <div className="flex-1 bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          metrics.conversions > 0
                            ? cpaRatio <= 0.8
                              ? "bg-emerald-500"
                              : cpaRatio <= 1
                                ? "bg-blue-500"
                                : cpaRatio <= 1.2
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    {/* CPA indicator */}
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                      {cpaRatio >= 1.2 ? "↑ High" : cpaRatio <= 0.8 ? "↓ Low" : "→ Mid"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demographic Insights */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Strategic Insights & Optimization Recommendations
          </h4>
          <ul className="text-sm space-y-2 text-blue-800 dark:text-blue-400">
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Increase bid adjustments for <strong>Age {bestPerformer[0]}</strong> to {Math.max(10, Math.round((parseFloat(avgCPA) / bestPerformer[1].cpa - 1) * 100))}% (lower CPA = higher efficiency)
              </span>
            </li>
            {worstPerformer[1].cpa > parseFloat(avgCPA) * 1.3 && (
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
                <span>
                  Reduce bids for <strong>Age {worstPerformer[0]}</strong> by 20-30% or pause campaigns if unprofitable
                </span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Test audience exclusions: Remove ages with CPA {Math.round(parseFloat(avgCPA) * 1.5)}+ to improve overall efficiency
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Create separate campaigns or ad groups for high-performing demographics with unique messaging
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Monitor demographic trends weekly and adjust budgets based on performance changes
              </span>
            </li>
          </ul>
        </div>

        {/* Distribution Visualization */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Spend Distribution by Age Group
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ageArray.map(([age, metrics]) => {
              const spendPct = (metrics.spend / totalSpend) * 100;
              return (
                <div key={age} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Age {age}
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {spendPct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${(metrics.spend / 1000).toFixed(1)}k
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
