"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GeoPerformance } from "../types";
import { Globe, TrendingUp, AlertCircle } from "lucide-react";

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

  const getRoasColor = (roas: number): string => {
    if (roas >= 3) return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300";
    if (roas >= 2) return "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300";
    if (roas >= 1) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300";
    return "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300";
  };

  const getRoasTextColor = (roas: number): string => {
    if (roas >= 3) return "text-emerald-600 dark:text-emerald-400";
    if (roas >= 2) return "text-blue-600 dark:text-blue-400";
    if (roas >= 1) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceStatus = (roas: number): string => {
    if (roas >= 3) return "Exceptional";
    if (roas >= 2) return "Strong";
    if (roas >= 1) return "Positive";
    if (roas > 0) return "Weak";
    return "Negative ROI";
  };

  // Calculate spend concentration
  const topCountriesSpend = data
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3)
    .reduce((sum, c) => sum + c.spend, 0);
  const spendConcentration = ((topCountriesSpend / totalSpend) * 100).toFixed(1);

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Performance
            </CardTitle>
            <CardDescription>
              Country-level campaign performance and ROI analysis
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterMetric}
              onChange={(e) =>
                setFilterMetric(e.target.value as any)
              }
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Countries</option>
              <option value="high_performers">High Performers (ROAS &gt;= 2x)</option>
              <option value="underperformers">Underperformers (ROAS &lt; 1x)</option>
            </select>
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
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Countries Active
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.length}
            </div>
          </div>
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
              {totalConversions.toLocaleString()}
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

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                  High Performers
                </h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-400 mt-1">
                  {highPerformers.length} countries with ROAS ≥ 2x
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                  Top: {highPerformers.length > 0 ? highPerformers[0].countryName : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
                  Spend Concentration
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  Top 3 countries: {spendConcentration}% of total spend
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 font-medium">
                  Consider geographic diversification
                </p>
              </div>
            </div>
          </div>

          <div className={`border-l-4 rounded-lg p-4 ${
            underperformers.length > 0
              ? "bg-red-50 dark:bg-red-900/20 border-red-500"
              : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                underperformers.length > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`} />
              <div>
                <h4 className={`font-semibold text-sm ${
                  underperformers.length > 0
                    ? "text-red-900 dark:text-red-300"
                    : "text-emerald-900 dark:text-emerald-300"
                }`}>
                  Underperformers
                </h4>
                <p className={`text-sm mt-1 ${
                  underperformers.length > 0
                    ? "text-red-800 dark:text-red-400"
                    : "text-emerald-800 dark:text-emerald-400"
                }`}>
                  {underperformers.length === 0
                    ? "All countries performing well (ROAS ≥ 1x)"
                    : `${underperformers.length} countries with negative ROAS`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Countries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Country
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Impressions
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Clicks
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Spend
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Conversions
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  CTR
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((country) => (
                <tr
                  key={country.countryCode}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {country.countryName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {country.countryCode}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                    {country.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                    {country.clicks.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                    ${country.spend.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                    {country.conversions}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                    {(country.ctr * 100).toFixed(2)}%
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${getRoasTextColor(
                    country.roas
                  )}`}>
                    {country.roas.toFixed(2)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance Distribution */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Performance Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: "Exceptional (≥3x)",
                count: data.filter((c) => c.roas >= 3).length,
                color: "emerald",
              },
              {
                label: "Strong (2-3x)",
                count: data.filter((c) => c.roas >= 2 && c.roas < 3).length,
                color: "blue",
              },
              {
                label: "Positive (1-2x)",
                count: data.filter((c) => c.roas >= 1 && c.roas < 2).length,
                color: "yellow",
              },
              {
                label: "Weak (0-1x)",
                count: data.filter((c) => c.roas > 0 && c.roas < 1).length,
                color: "orange",
              },
              {
                label: "Negative",
                count: data.filter((c) => c.roas <= 0).length,
                color: "red",
              },
            ].map((perf) => {
              const percentage = (perf.count / data.length) * 100;
              const colorMap = {
                emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300",
                blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300",
                yellow: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-300",
                orange: "bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-300",
                red: "bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-300",
              };

              return (
                <div key={perf.label} className={`rounded-lg p-3 ${colorMap[perf.color as keyof typeof colorMap]}`}>
                  <div className="text-xs font-medium mb-1">{perf.label}</div>
                  <div className="text-lg font-bold">{perf.count}</div>
                  <div className="text-xs opacity-75">{percentage.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Recommendations */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Geographic Optimization Recommendations
          </h4>
          <ul className="text-sm space-y-2 text-blue-800 dark:text-blue-400">
            {underperformers.length > 0 && (
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
                <span>
                  Consider reducing budgets in {underperformers.slice(0, 2).map(c => c.countryName).join(", ")} or pausing campaigns entirely
                </span>
              </li>
            )}
            {highPerformers.length > 0 && (
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
                <span>
                  Increase budgets for {highPerformers[0].countryName} and similar high-performing markets
                </span>
              </li>
            )}
            {parseFloat(spendConcentration) > 60 && (
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
                <span>
                  High spend concentration detected. Test expansion into emerging markets to reduce risk
                </span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Monitor {data.filter(c => c.ctr < 0.02).length > 0 ? "low CTR countries" : "CTR trends"} for targeting efficiency
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
