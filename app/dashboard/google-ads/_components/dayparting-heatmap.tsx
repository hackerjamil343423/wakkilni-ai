"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HourlyPerformance } from "../types";
import { Calendar, AlertTriangle } from "lucide-react";

interface DaypartingHeatmapProps {
  data: HourlyPerformance[];
}

export function DaypartingHeatmap({ data }: DaypartingHeatmapProps) {
  const [selectedMetric, setSelectedMetric] = useState<"conversions" | "spend" | "cpa" | "roas">(
    "conversions"
  );

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create 7x24 grid
  const heatmapGrid = useMemo(() => {
    const grid: Record<number, Record<number, HourlyPerformance | null>> = {};

    // Initialize grid
    for (let day = 0; day < 7; day++) {
      grid[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        const found = data.find((d) => d.dayOfWeek === day && d.hour === hour);
        grid[day][hour] = found || null;
      }
    }

    return grid;
  }, [data]);

  // Calculate metrics for color intensity
  const getMetricValue = (performance: HourlyPerformance | null) => {
    if (!performance) return 0;
    if (selectedMetric === "conversions") return performance.conversions;
    if (selectedMetric === "spend") return performance.spend / 10; // Scale down
    if (selectedMetric === "cpa") return 100 - Math.min(100, performance.cpa); // Inverse (lower is better)
    if (selectedMetric === "roas") {
      // Calculate ROAS from the data
      return performance.spend > 0 ? (performance.conversions * 50) / performance.spend : 0; // Approximate
    }
    return 0;
  };

  // Find max value for color scaling
  const allMetrics = data.map((p) => getMetricValue(p));
  const maxMetric = Math.max(...allMetrics, 1);

  const getHeatmapColor = (value: number): string => {
    const intensity = value / maxMetric;

    if (intensity === 0) {
      return "bg-gray-100 dark:bg-gray-800";
    }

    if (selectedMetric === "cpa" || selectedMetric === "roas") {
      // For metrics where higher is better
      if (intensity >= 0.8) return "bg-emerald-500";
      if (intensity >= 0.6) return "bg-emerald-400";
      if (intensity >= 0.4) return "bg-yellow-400";
      if (intensity >= 0.2) return "bg-orange-400";
      return "bg-red-400";
    }

    // For conversions and spend (higher is higher activity)
    if (intensity >= 0.8) return "bg-blue-700 dark:bg-blue-600";
    if (intensity >= 0.6) return "bg-blue-500 dark:bg-blue-500";
    if (intensity >= 0.4) return "bg-blue-400 dark:bg-blue-400";
    if (intensity >= 0.2) return "bg-blue-300 dark:bg-blue-300";
    return "bg-blue-100 dark:bg-blue-900";
  };

  // Find dead hours
  const deadZones = data.filter((p) => p.spend > 50 && p.conversions === 0);

  // Calculate hourly insights
  const hourlyAggregates = useMemo(() => {
    const agg: Record<number, { spend: number; conversions: number; hours: number }> = {};
    for (let hour = 0; hour < 24; hour++) {
      agg[hour] = { spend: 0, conversions: 0, hours: 0 };
    }

    data.forEach((p) => {
      agg[p.hour].spend += p.spend;
      agg[p.hour].conversions += p.conversions;
      agg[p.hour].hours += 1;
    });

    return agg;
  }, [data]);

  const topConversionHour = hours.reduce((best, hour) =>
    hourlyAggregates[hour].conversions > hourlyAggregates[best].conversions ? hour : best
  );

  const totalSpend = data.reduce((sum, p) => sum + p.spend, 0);
  const totalConversions = data.reduce((sum, p) => sum + p.conversions, 0);

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Day-Parting Heatmap
            </CardTitle>
            <CardDescription>
              24x7 performance grid to identify optimal ad scheduling windows
            </CardDescription>
          </div>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as "conversions" | "spend" | "cpa" | "roas")}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="conversions">Conversions</option>
            <option value="spend">Spend</option>
            <option value="cpa">CPA (Inverted)</option>
            <option value="roas">ROAS</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Hour labels */}
            <div className="flex mb-2">
              <div className="w-24 flex-shrink-0" />
              <div className="flex">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="w-12 text-center text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {/* Day rows */}
            {days.map((dayName, dayIndex) => (
              <div key={dayName} className="flex mb-1">
                <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 pr-2 text-right">
                  {dayName}
                </div>
                <div className="flex gap-1">
                  {hours.map((hour) => {
                    const performance = heatmapGrid[dayIndex][hour];
                    const value = getMetricValue(performance);
                    const color = getHeatmapColor(value);

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={`w-10 h-10 rounded transition-all cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 dark:hover:ring-offset-gray-950 group relative ${color}`}
                        title={
                          performance
                            ? `${dayName} ${hour}:00 - Conversions: ${performance.conversions}, Spend: $${performance.spend.toFixed(0)}, CPA: $${performance.conversions > 0 ? (performance.spend / performance.conversions).toFixed(0) : "—"}`
                            : `${dayName} ${hour}:00 - No data`
                        }
                      >
                        {/* Tooltip on hover */}
                        {performance && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <div className="bg-gray-900 dark:bg-gray-950 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              <div className="font-semibold">{dayName} {hour}:00</div>
                              <div>Conversions: {performance.conversions}</div>
                              <div>Spend: ${performance.spend.toFixed(0)}</div>
                              <div>CPA: {performance.conversions > 0 ? `$${(performance.spend / performance.conversions).toFixed(0)}` : "—"}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Color Intensity Legend
          </h4>
          <div className="flex flex-wrap gap-4">
            {selectedMetric === "cpa" || selectedMetric === "roas" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Excellent (High {selectedMetric.toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Poor (Low {selectedMetric.toUpperCase()})</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-700 dark:bg-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Very High Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Medium Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Low Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No Data</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
              Peak Performance Hour
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {topConversionHour}:00
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1">
              {hourlyAggregates[topConversionHour].conversions} conversions across the week
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Total Metrics (7 days)
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-blue-700 dark:text-blue-400">
                Conversions: <span className="font-bold">{totalConversions}</span>
              </div>
              <div className="text-blue-700 dark:text-blue-400">
                Spend: <span className="font-bold">${(totalSpend / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>

          {deadZones.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                    Dead Zones
                  </div>
                  <p className="text-xs text-orange-800 dark:text-orange-400 mt-1">
                    {deadZones.length} time slots spending ${deadZones.reduce((sum, d) => sum + d.spend, 0).toFixed(0)} with zero conversions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hourly Performance Summary */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Hourly Performance Summary (Average across all days)
          </h4>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {hours.map((hour) => {
              const avg = hourlyAggregates[hour];
              const avgConv = avg.hours > 0 ? avg.conversions / avg.hours : 0;
              const intensity = avgConv > 0 ? (avgConv / Math.max(...Object.values(hourlyAggregates).map(a => a.conversions / (a.hours || 1)))) : 0;

              return (
                <div key={hour} className="text-center">
                  <div
                    className={`w-full aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 dark:hover:ring-offset-gray-950 ${
                      intensity === 0
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        : intensity >= 0.7
                          ? "bg-blue-600 text-white"
                          : intensity >= 0.4
                            ? "bg-blue-400 text-white"
                            : "bg-blue-200 text-gray-800"
                    }`}
                    title={`${hour}:00 - Avg: ${avgConv.toFixed(1)} conversions`}
                  >
                    {hour}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ad Scheduling Recommendations */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Ad Scheduling Recommendations
          </h4>
          <ul className="text-sm space-y-2 text-blue-800 dark:text-blue-400">
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Increase bids by 10-20% during peak hours ({topConversionHour}:00) to maximize conversions
              </span>
            </li>
            {deadZones.length > 0 && (
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
                <span>
                  Reduce bids by 50% or pause ads during {deadZones.length} identified dead zones ({deadZones.slice(0, 2).map(d => `${days[d.dayOfWeek]} ${d.hour}:00`).join(", ")})
                </span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Monitor weekday vs weekend performance (current data shows patterns across both)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
              <span>
                Test bid adjustments and measure impact on next 7-day cycle
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
