"use client";

import { useMemo, useState } from "react";
import { GeoPerformance } from "../types";
import { Globe, TrendingUp, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeoPerformanceMapProps {
  data: GeoPerformance[];
}

export function GeoPerformanceMap({ data }: GeoPerformanceMapProps) {
  const [sortBy, setSortBy] = useState<"roas" | "spend" | "conversions">(
    "roas"
  );
  const [filterMetric, setFilterMetric] = useState<"all" | "high_performers" | "underperformers">("all");

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply filter
    if (filterMetric === "high_performers") {
      filtered = filtered.filter((country) => country.roas >= 2);
    } else if (filterMetric === "underperformers") {
      filtered = filtered.filter((country) => country.roas < 1);
    }

    // Apply sort
    return filtered.sort((a, b) => {
      if (sortBy === "roas") return b.roas - a.roas;
      if (sortBy === "spend") return b.spend - a.spend;
      return b.conversions - a.conversions;
    });
  }, [data, sortBy, filterMetric]);

  const highPerformers = data.filter((c) => c.roas >= 2);
  const underperformers = data.filter((c) => c.roas < 1);
  const totalSpend = data.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = data.reduce((sum, c) => sum + c.conversions, 0);
  const avgRoas = (data.reduce((sum, c) => sum + c.roas, 0) / (data.length || 1)).toFixed(2);

  const getRoasTextColor = (roas: number): string => {
    if (roas >= 3) return "text-emerald-600 dark:text-emerald-400";
    if (roas >= 2) return "text-blue-600 dark:text-blue-400";
    if (roas >= 1) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Calculate spend concentration
  const topCountriesSpend = data
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3)
    .reduce((sum, c) => sum + c.spend, 0);
  const spendConcentration = ((topCountriesSpend / totalSpend) * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Geographic Performance
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Country-level ROI analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filterMetric}
                onChange={(e) =>
                  setFilterMetric(e.target.value as "all" | "high_performers" | "underperformers")
                }
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border-0 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Countries</option>
                <option value="high_performers">High (ROAS 2x+)</option>
                <option value="underperformers">Low (ROAS &lt;1x)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "roas" | "spend" | "conversions")}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border-0 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-2 focus:ring-teal-500"
              >
                <option value="roas">Sort by ROAS</option>
                <option value="spend">Sort by Spend</option>
                <option value="conversions">Sort by Conversions</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Countries</div>
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
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{totalConversions.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg ROAS</div>
          <div className={cn("text-xl font-semibold tabular-nums", getRoasTextColor(parseFloat(avgRoas)))}>{avgRoas}x</div>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                  High Performers
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  {highPerformers.length} countries with ROAS 2x+
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold tabular-nums">
                  Top: {highPerformers.length > 0 ? highPerformers[0].countryName : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
                  Spend Concentration
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Top 3: <span className="font-semibold tabular-nums">{spendConcentration}%</span> of spend
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Consider diversification
                </p>
              </div>
            </div>
          </div>

          <div className={cn(
            "border rounded-xl p-4",
            underperformers.length > 0
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                underperformers.length > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
              )}>
                <AlertCircle className={cn(
                  "h-4 w-4",
                  underperformers.length > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                )} />
              </div>
              <div>
                <p className={cn(
                  "font-semibold text-sm",
                  underperformers.length > 0 ? "text-red-900 dark:text-red-300" : "text-emerald-900 dark:text-emerald-300"
                )}>
                  Underperformers
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  underperformers.length > 0 ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
                )}>
                  {underperformers.length === 0
                    ? "All countries ROAS 1x+"
                    : `${underperformers.length} countries negative ROAS`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Countries Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Country
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Impr.
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Spend
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Conv.
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  CTR
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredAndSortedData.map((country) => (
                <tr
                  key={country.countryCode}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">
                        {country.countryName}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                        {country.countryCode}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {country.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {country.clicks.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-50 tabular-nums">
                    ${country.spend.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {country.conversions}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {(country.ctr * 100).toFixed(2)}%
                  </td>
                  <td className={cn("py-3 px-4 text-right font-bold tabular-nums", getRoasTextColor(country.roas))}>
                    {country.roas.toFixed(2)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance Distribution */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Performance Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: "3x+",
                sublabel: "Exceptional",
                count: data.filter((c) => c.roas >= 3).length,
                color: "emerald",
              },
              {
                label: "2-3x",
                sublabel: "Strong",
                count: data.filter((c) => c.roas >= 2 && c.roas < 3).length,
                color: "blue",
              },
              {
                label: "1-2x",
                sublabel: "Positive",
                count: data.filter((c) => c.roas >= 1 && c.roas < 2).length,
                color: "amber",
              },
              {
                label: "0-1x",
                sublabel: "Weak",
                count: data.filter((c) => c.roas > 0 && c.roas < 1).length,
                color: "orange",
              },
              {
                label: "<0x",
                sublabel: "Negative",
                count: data.filter((c) => c.roas <= 0).length,
                color: "red",
              },
            ].map((perf) => {
              const percentage = (perf.count / data.length) * 100;
              const colorMap = {
                emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
                red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
              };

              return (
                <div key={perf.label} className={cn("rounded-lg p-3 text-center border", colorMap[perf.color as keyof typeof colorMap])}>
                  <div className="text-2xl font-bold tabular-nums">{perf.count}</div>
                  <div className="text-xs font-medium mt-1">{perf.sublabel}</div>
                  <div className="text-[10px] opacity-75 mt-0.5 tabular-nums">{percentage.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Recommendations */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-teal-900 dark:text-teal-300 mb-3">
            Geographic Optimization
          </h4>
          <ul className="text-xs space-y-2 text-teal-800 dark:text-teal-400">
            {underperformers.length > 0 && (
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-semibold flex-shrink-0">•</span>
                <span>
                  Reduce budgets in {underperformers.slice(0, 2).map(c => c.countryName).join(", ")} or pause
                </span>
              </li>
            )}
            {highPerformers.length > 0 && (
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-semibold flex-shrink-0">•</span>
                <span>
                  Increase budgets for {highPerformers[0].countryName} and similar markets
                </span>
              </li>
            )}
            {parseFloat(spendConcentration) > 60 && (
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-semibold flex-shrink-0">•</span>
                <span>
                  High spend concentration detected - test emerging markets
                </span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-teal-600 dark:text-teal-400 font-semibold flex-shrink-0">•</span>
              <span>
                Monitor {data.filter(c => c.ctr < 0.02).length > 0 ? "low CTR countries" : "CTR trends"} for efficiency
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
