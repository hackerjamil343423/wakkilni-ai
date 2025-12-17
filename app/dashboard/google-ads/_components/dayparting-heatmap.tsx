"use client";

import { useMemo, useState } from "react";
import { HourlyPerformance } from "../types";
import { Calendar, AlertTriangle, ChevronDown, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DaypartingHeatmapProps {
  data: HourlyPerformance[];
}

export function DaypartingHeatmap({ data }: DaypartingHeatmapProps) {
  const [selectedMetric, setSelectedMetric] = useState<"conversions" | "spend" | "cpa">(
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
    return 0;
  };

  // Find max value for color scaling
  const allMetrics = data.map((p) => getMetricValue(p));
  const maxMetric = Math.max(...allMetrics, 1);

  const getHeatmapColor = (value: number): string => {
    const intensity = value / maxMetric;

    if (intensity === 0) {
      return "bg-zinc-100 dark:bg-zinc-800";
    }

    if (selectedMetric === "cpa") {
      // For metrics where lower is better (CPA)
      if (intensity >= 0.8) return "bg-emerald-500";
      if (intensity >= 0.6) return "bg-emerald-400";
      if (intensity >= 0.4) return "bg-amber-400";
      if (intensity >= 0.2) return "bg-orange-400";
      return "bg-red-400";
    }

    // For conversions and spend (higher is higher activity)
    if (intensity >= 0.8) return "bg-violet-600 dark:bg-violet-500";
    if (intensity >= 0.6) return "bg-violet-500 dark:bg-violet-500";
    if (intensity >= 0.4) return "bg-violet-400 dark:bg-violet-400";
    if (intensity >= 0.2) return "bg-violet-300 dark:bg-violet-300";
    return "bg-violet-100 dark:bg-violet-900";
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Day-Parting Heatmap
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                24x7 performance grid
              </p>
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as "conversions" | "spend" | "cpa")}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border-0 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-2 focus:ring-violet-500"
            >
              <option value="conversions">Conversions</option>
              <option value="spend">Spend</option>
              <option value="cpa">CPA (Inverted)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Peak Hour</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{topConversionHour}:00</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Spend</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">${(totalSpend / 1000).toFixed(1)}k</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Conversions</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{totalConversions}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Dead Zones</div>
          <div className={cn("text-xl font-semibold tabular-nums", deadZones.length > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400")}>
            {deadZones.length}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-4">
          <div className="min-w-max">
            {/* Hour labels */}
            <div className="flex mb-2">
              <div className="w-20 flex-shrink-0" />
              <div className="flex">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="w-10 text-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400 tabular-nums"
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {/* Day rows */}
            {days.map((dayName, dayIndex) => (
              <div key={dayName} className="flex mb-1">
                <div className="w-20 flex-shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-400 pr-2 text-right flex items-center justify-end">
                  {dayName.slice(0, 3)}
                </div>
                <div className="flex gap-0.5">
                  {hours.map((hour) => {
                    const performance = heatmapGrid[dayIndex][hour];
                    const value = getMetricValue(performance);
                    const color = getHeatmapColor(value);

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={cn("w-9 h-9 rounded-md transition-all cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-zinc-400 dark:hover:ring-offset-zinc-900 group relative", color)}
                        title={
                          performance
                            ? `${dayName} ${hour}:00 - Conversions: ${performance.conversions}, Spend: $${performance.spend.toFixed(0)}, CPA: $${performance.conversions > 0 ? (performance.spend / performance.conversions).toFixed(0) : "—"}`
                            : `${dayName} ${hour}:00 - No data`
                        }
                      >
                        {/* Tooltip on hover */}
                        {performance && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <div className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                              <div className="font-semibold border-b border-zinc-700 pb-1 mb-1">{dayName} {hour}:00</div>
                              <div className="space-y-0.5 text-zinc-300">
                                <div>Conv: <span className="text-white font-medium">{performance.conversions}</span></div>
                                <div>Spend: <span className="text-white font-medium">${performance.spend.toFixed(0)}</span></div>
                                <div>CPA: <span className="text-white font-medium">{performance.conversions > 0 ? `$${(performance.spend / performance.conversions).toFixed(0)}` : "—"}</span></div>
                              </div>
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
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {selectedMetric === "cpa" ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Low CPA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">High CPA</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Very High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-200" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">No Data</span>
              </div>
            </>
          )}
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                  Peak Hour
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {topConversionHour}:00
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  {hourlyAggregates[topConversionHour].conversions} conversions/week
                </p>
              </div>
            </div>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-violet-900 dark:text-violet-300 text-sm">
                  Weekly Totals
                </p>
                <p className="text-xs text-violet-700 dark:text-violet-400 mt-1 tabular-nums">
                  <span className="font-semibold">{totalConversions}</span> conversions
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5 tabular-nums">
                  <span className="font-semibold">${(totalSpend / 1000).toFixed(1)}k</span> spend
                </p>
              </div>
            </div>
          </div>

          {deadZones.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-300 text-sm">
                    Dead Zones
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                    {deadZones.length} slots with $0 return
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 tabular-nums">
                    ${deadZones.reduce((sum, d) => sum + d.spend, 0).toFixed(0)} wasted
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hourly Performance Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Hourly Performance (Avg)
          </h4>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {hours.map((hour) => {
              const avg = hourlyAggregates[hour];
              const avgConv = avg.hours > 0 ? avg.conversions / avg.hours : 0;
              const intensity = avgConv > 0 ? (avgConv / Math.max(...Object.values(hourlyAggregates).map(a => a.conversions / (a.hours || 1)))) : 0;

              return (
                <div key={hour} className="text-center">
                  <div
                    className={cn(
                      "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all hover:ring-2 hover:ring-offset-1 hover:ring-zinc-400 dark:hover:ring-offset-zinc-900 tabular-nums",
                      intensity === 0
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                        : intensity >= 0.7
                          ? "bg-violet-600 text-white"
                          : intensity >= 0.4
                            ? "bg-violet-400 text-white"
                            : "bg-violet-200 text-zinc-700 dark:text-zinc-800"
                    )}
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
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-300 mb-3">
            Scheduling Recommendations
          </h4>
          <ul className="text-xs space-y-2 text-violet-800 dark:text-violet-400">
            <li className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-400 font-semibold flex-shrink-0">•</span>
              <span>
                Increase bids 10-20% during peak hours (<span className="font-semibold tabular-nums">{topConversionHour}:00</span>)
              </span>
            </li>
            {deadZones.length > 0 && (
              <li className="flex gap-2">
                <span className="text-violet-600 dark:text-violet-400 font-semibold flex-shrink-0">•</span>
                <span>
                  Reduce/pause ads in {deadZones.length} dead zones ({deadZones.slice(0, 2).map(d => `${days[d.dayOfWeek].slice(0, 3)} ${d.hour}:00`).join(", ")})
                </span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-400 font-semibold flex-shrink-0">•</span>
              <span>
                Monitor weekday vs weekend performance patterns
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-400 font-semibold flex-shrink-0">•</span>
              <span>
                Test bid adjustments and measure impact over 7-day cycles
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
