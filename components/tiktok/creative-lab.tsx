'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TikTokCreative } from '@/lib/tiktok-data';

interface CreativeLabProps {
  creatives: TikTokCreative[];
}

export function CreativeLab({ creatives }: CreativeLabProps) {
  // Calculate aggregate retention funnel
  const aggregateMetrics = creatives.reduce(
    (acc, creative) => {
      acc.impressions += creative.metrics.impressions;
      acc.video_watched_2s += creative.metrics.video_watched_2s;
      acc.video_watched_6s += creative.metrics.video_watched_6s;
      acc.video_views_p100 += creative.metrics.video_views_p100;
      return acc;
    },
    { impressions: 0, video_watched_2s: 0, video_watched_6s: 0, video_views_p100: 0 }
  );

  const funnelData = [
    {
      stage: 'Impressions',
      value: aggregateMetrics.impressions,
      percentage: 100,
      dropoff: 0,
    },
    {
      stage: '2s Views',
      value: aggregateMetrics.video_watched_2s,
      percentage: (aggregateMetrics.video_watched_2s / aggregateMetrics.impressions) * 100,
      dropoff:
        ((aggregateMetrics.impressions - aggregateMetrics.video_watched_2s) /
          aggregateMetrics.impressions) *
        100,
    },
    {
      stage: '6s Views',
      value: aggregateMetrics.video_watched_6s,
      percentage: (aggregateMetrics.video_watched_6s / aggregateMetrics.impressions) * 100,
      dropoff:
        ((aggregateMetrics.video_watched_2s - aggregateMetrics.video_watched_6s) /
          aggregateMetrics.video_watched_2s) *
        100,
    },
    {
      stage: '100% Views',
      value: aggregateMetrics.video_views_p100,
      percentage: (aggregateMetrics.video_views_p100 / aggregateMetrics.impressions) * 100,
      dropoff:
        ((aggregateMetrics.video_watched_6s - aggregateMetrics.video_views_p100) /
          aggregateMetrics.video_watched_6s) *
        100,
    },
  ];

  // Top performers by thumbstop rate
  const topHooks = [...creatives]
    .sort((a, b) => b.derived.thumbstop_rate - a.derived.thumbstop_rate)
    .slice(0, 5);

  const getBarColor = (index: number) => {
    const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
    return colors[index] || '#d1fae5';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Retention Waterfall */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Video Retention Waterfall
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Drop-off analysis across video engagement stages
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              type="number"
              className="text-xs text-zinc-500 dark:text-zinc-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              dataKey="stage"
              type="category"
              className="text-xs text-zinc-900 dark:text-zinc-100 font-medium"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'value') {
                  return [value.toLocaleString(), 'Count'];
                }
                return [value, name];
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Drop-off indicators */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {funnelData.slice(1).map((stage, idx) => (
            <div
              key={stage.stage}
              className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Drop-off at {stage.stage}
              </p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {stage.dropoff.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Top Performing Hooks */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Top Performing Hooks
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sorted by Thumbstop Rate
          </p>
        </div>

        <div className="space-y-4">
          {topHooks.map((creative, index) => (
            <div
              key={creative.id}
              className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg p-3 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 w-6">
                  #{index + 1}
                </span>
                <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate flex-1">
                  {creative.filename}
                </p>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                    creative.derived.thumbstop_rate > 30
                      ? 'bg-emerald-500'
                      : creative.derived.thumbstop_rate > 20
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(creative.derived.thumbstop_rate, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Hook Rate</span>
                <span
                  className={`text-sm font-semibold ${
                    creative.derived.thumbstop_rate > 30
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : creative.derived.thumbstop_rate > 20
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {creative.derived.thumbstop_rate.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
