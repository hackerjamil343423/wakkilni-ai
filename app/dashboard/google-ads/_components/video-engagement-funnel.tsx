"use client";

import { useMemo } from "react";
import { VideoPerformance } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Film, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoEngagementFunnelProps {
  data: VideoPerformance[];
}

export function VideoEngagementFunnel({ data }: VideoEngagementFunnelProps) {
  const funnelData = useMemo(() => {
    if (data.length === 0) return [];

    // Calculate aggregate funnel across all videos
    const totalImpressions = data.reduce((sum, v) => sum + v.impressions, 0);
    const totalViews = data.reduce((sum, v) => sum + v.views, 0);
    const total25 = data.reduce((sum, v) => sum + v.quartile25, 0);
    const total50 = data.reduce((sum, v) => sum + v.quartile50, 0);
    const total75 = data.reduce((sum, v) => sum + v.quartile75, 0);
    const total100 = data.reduce((sum, v) => sum + v.quartile100, 0);

    return [
      {
        name: "Impressions",
        value: totalImpressions,
        percentage: 100,
        retention: 100,
      },
      {
        name: "Views (30s+)",
        value: totalViews,
        percentage: (totalViews / totalImpressions) * 100,
        retention: (totalViews / totalImpressions) * 100,
      },
      {
        name: "25% Complete",
        value: total25,
        percentage: (total25 / totalImpressions) * 100,
        retention: (total25 / totalViews) * 100,
      },
      {
        name: "50% Complete",
        value: total50,
        percentage: (total50 / totalImpressions) * 100,
        retention: (total50 / total25) * 100,
      },
      {
        name: "75% Complete",
        value: total75,
        percentage: (total75 / totalImpressions) * 100,
        retention: (total75 / total50) * 100,
      },
      {
        name: "100% Complete",
        value: total100,
        percentage: (total100 / totalImpressions) * 100,
        retention: (total100 / total75) * 100,
      },
    ];
  }, [data]);

  const topVideos = useMemo(() => {
    return [...data]
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
  }, [data]);

  const getRetentionColor = (retention: number): string => {
    if (retention >= 80) return "#34a853"; // Green
    if (retention >= 60) return "#fbbc04"; // Yellow
    if (retention >= 40) return "#f57c00"; // Orange
    return "#ea4335"; // Red
  };

  const getRetentionStatus = (retention: number): string => {
    if (retention >= 80) return "Excellent";
    if (retention >= 60) return "Good";
    if (retention >= 40) return "Fair";
    return "Poor - Video too long or weak CTA";
  };

  const totalVideos = data.length;
  const avgViewRate = (data.reduce((sum, v) => sum + v.viewRate, 0) / (data.length || 1)) * 100;
  const totalSpend = data.reduce((sum, v) => sum + v.spend, 0);
  const avgRoas = data.reduce((sum, v) => sum + (v.conversions > 0 ? (v.conversionValue / v.spend) : 0), 0) / (data.length || 1);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
            <Film className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Video Engagement Funnel
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Quartile completion analysis
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Videos</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{totalVideos}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg View Rate</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{avgViewRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Spend</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">${(totalSpend / 1000).toFixed(1)}k</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg ROAS</div>
          <div className={cn("text-xl font-semibold tabular-nums", avgRoas >= 2 ? "text-emerald-600 dark:text-emerald-400" : avgRoas >= 1 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
            {avgRoas.toFixed(2)}x
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Main Funnel Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <defs>
                <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e4e4e7"
                className="dark:stroke-zinc-800"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl min-w-[180px]">
                      <p className="font-semibold text-white text-sm mb-2 pb-2 border-b border-zinc-700">
                        {data.name}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-zinc-400">Views</span>
                          <span className="text-xs font-semibold text-white tabular-nums">{data.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-zinc-400">Percentage</span>
                          <span className="text-xs font-semibold text-white tabular-nums">{data.percentage.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-zinc-400">Retention</span>
                          <span className="text-xs font-semibold text-white tabular-nums">{data.retention.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" fill="url(#colorFunnel)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Details Table */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Funnel Metrics
          </h4>
          <div className="space-y-3">
            {funnelData.map((stage, index) => (
              <div key={stage.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                      {stage.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 w-16 text-right tabular-nums">
                      {stage.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${stage.percentage}%`,
                        backgroundColor: getRetentionColor(stage.retention),
                      }}
                    />
                  </div>
                  {index > 0 && (
                    <span
                      className="text-xs font-semibold w-12 text-right tabular-nums"
                      style={{ color: getRetentionColor(stage.retention) }}
                    >
                      {stage.retention.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funnelData[2] && (
            <div
              className={cn(
                "border rounded-xl p-4",
                funnelData[2].retention >= 80
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : funnelData[2].retention >= 60
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : funnelData[2].retention >= 40
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              )}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={cn(
                  "h-4 w-4 flex-shrink-0 mt-0.5",
                  funnelData[2].retention >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )} />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Hook Performance</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    First 5 seconds: <span className="font-semibold tabular-nums">{funnelData[2].retention.toFixed(1)}%</span> retention
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {getRetentionStatus(funnelData[2].retention)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {funnelData[4] && funnelData[5] && (
            <div
              className={cn(
                "border rounded-xl p-4",
                funnelData[5].retention >= 50
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              )}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={cn(
                  "h-4 w-4 flex-shrink-0 mt-0.5",
                  funnelData[5].retention >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )} />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">CTA Performance</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Final segment: <span className="font-semibold tabular-nums">{funnelData[5].retention.toFixed(1)}%</span> retention
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {funnelData[5].retention < 50 ? "Consider shorter format" : "Good completion rate"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Videos by Spend */}
        {topVideos.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Top Videos by Spend
            </h4>
            <div className="space-y-2">
              {topVideos.map((video) => (
                <div key={video.videoId} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {video.title}
                    </p>
                    <div className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <span className="tabular-nums">{video.impressions.toLocaleString()} impr</span>
                      <span className="tabular-nums">{video.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                      ${video.spend.toFixed(0)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {(video.viewRate * 100).toFixed(1)}% VR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
