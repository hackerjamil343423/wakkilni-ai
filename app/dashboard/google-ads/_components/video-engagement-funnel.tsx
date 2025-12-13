"use client";

import { useMemo } from "react";
import { VideoPerformance } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Film, AlertCircle } from "lucide-react";

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

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Video Engagement Funnel
            </CardTitle>
            <CardDescription>
              Quartile completion analysis and viewer retention tracking
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Funnel Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <defs>
                <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4285f4" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 12, angle: -45, textAnchor: "end", height: 80 }}
              />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {data.name}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Views: {data.value.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Percentage: {data.percentage.toFixed(2)}%
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Retention: {data.retention.toFixed(1)}%
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" fill="url(#colorFunnel)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Details Table */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Funnel Metrics
          </h4>
          <div className="space-y-3">
            {funnelData.map((stage, index) => (
              <div key={stage.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {stage.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                      {stage.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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
                      className="text-xs font-semibold w-12 text-right"
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
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Diagnostic Insights
          </h4>

          {funnelData[2] && (
            <div
              className={`border-l-4 rounded-lg p-3 ${
                funnelData[2].retention >= 80
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                  : funnelData[2].retention >= 60
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                    : funnelData[2].retention >= 40
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                      : "bg-red-50 dark:bg-red-900/20 border-red-500"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Hook Performance</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    First 5 seconds (Impressions → 25% completion):{" "}
                    <span className="font-semibold">{funnelData[2].retention.toFixed(1)}%</span>{" "}
                    retention
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    {getRetentionStatus(funnelData[2].retention)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {funnelData[4] && funnelData[5] && (
            <div
              className={`border-l-4 rounded-lg p-3 ${
                funnelData[4].retention - funnelData[5].retention < 20
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                  : funnelData[4].retention - funnelData[5].retention < 40
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Pitch & CTA Performance</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Final segment (75% → 100% completion):{" "}
                    <span className="font-semibold">{funnelData[5].retention.toFixed(1)}%</span>{" "}
                    retention
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    {funnelData[5].retention < 50
                      ? "Video may be too long or CTA is weak. Consider shorter format or stronger call-to-action."
                      : "Good pitch effectiveness. Viewers are completing the video."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Videos by Spend */}
        {topVideos.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Top Videos by Spend
            </h4>
            <div className="space-y-2">
              {topVideos.map((video) => (
                <div key={video.videoId} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-900/50 rounded transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {video.title}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{video.impressions.toLocaleString()} impressions</span>
                      <span>{video.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${video.spend.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(video.viewRate * 100).toFixed(1)}% VR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Videos
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.length}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg View Rate
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(
                (data.reduce((sum, v) => sum + v.viewRate, 0) / (data.length || 1)) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Spend
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${(data.reduce((sum, v) => sum + v.spend, 0) / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg ROAS
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(
                data.reduce((sum, v) => sum + (v.conversions > 0 ? (v.conversionValue / v.spend) : 0), 0) /
                (data.length || 1)
              ).toFixed(2)}
              x
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
