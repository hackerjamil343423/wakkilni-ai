'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import {
  calculateAggregateMetrics,
  type TikTokCreative,
  type TikTokTimeSeriesData,
  type Currency,
} from '@/lib/tiktok-data';

interface VitalSignsProps {
  creatives: TikTokCreative[];
  timeSeries: TikTokTimeSeriesData[];
  currency: Currency;
}

interface KPICardProps {
  label: string;
  value: string;
  sparklineData: number[];
  trend?: 'up' | 'down';
}

function KPICard({ label, value, sparklineData, trend }: KPICardProps) {
  const chartData = sparklineData.map((val, idx) => ({ value: val, index: idx }));

  return (
    <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      {/* Sparkline Background */}
      <div className="absolute inset-0 opacity-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={2}
              dot={false}
              className="text-zinc-900 dark:text-zinc-100"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {trend === 'up' ? '↑' : '↓'}
            </span>
          )}
        </div>

        {/* Mini Sparkline */}
        <div className="mt-3 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={1.5}
                dot={false}
                className="text-zinc-400 dark:text-zinc-600"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function VitalSigns({ creatives, timeSeries, currency }: VitalSignsProps) {
  const metrics = calculateAggregateMetrics(creatives);
  const currencySymbol = currency === 'USD' ? '$' : '€';

  const kpis = [
    {
      label: 'Total Spend',
      value: `${currencySymbol}${metrics.total_spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      sparklineData: timeSeries.map((d) => d.spend),
      trend: 'up' as const,
    },
    {
      label: 'ROAS',
      value: `${metrics.avg_roas.toFixed(2)}x`,
      sparklineData: timeSeries.map((d) => d.roas),
      trend: 'up' as const,
    },
    {
      label: 'Avg. CPA',
      value: `${currencySymbol}${metrics.avg_cpa.toFixed(2)}`,
      sparklineData: timeSeries.map((d) => d.cpa),
      trend: 'down' as const,
    },
    {
      label: 'Avg. Thumbstop Rate',
      value: `${metrics.avg_thumbstop_rate.toFixed(1)}%`,
      sparklineData: timeSeries.map((d) => d.thumbstop_rate),
      trend: 'up' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          sparklineData={kpi.sparklineData}
          trend={kpi.trend}
        />
      ))}
    </div>
  );
}
