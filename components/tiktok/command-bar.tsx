'use client';

import { AlertTriangle } from 'lucide-react';
import type { DataSource, Currency } from '@/lib/tiktok-data';

interface CommandBarProps {
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
}

export function CommandBar({
  dataSource,
  setDataSource,
  currency,
  setCurrency,
  dateRange,
  setDateRange,
}: CommandBarProps) {
  const presets = [
    { label: 'Today', days: 0 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
  ];

  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = days === 0 ? new Date() : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({ from, to });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Date Range Presets */}
      <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        {presets.map((preset) => {
          const isActive =
            Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) ===
            preset.days;

          return (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                isActive
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Data Source Toggle */}
      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2">
          Data Source:
        </span>
        <button
          onClick={() => setDataSource('pixel')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            dataSource === 'pixel'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Pixel
        </button>
        <button
          onClick={() => setDataSource('skan')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
            dataSource === 'skan'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          SKAdNetwork
          {dataSource === 'skan' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-semibold">
              <AlertTriangle className="w-2.5 h-2.5" />
              72h delay
            </span>
          )}
        </button>
      </div>

      {/* Currency Toggle */}
      <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setCurrency('USD')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            currency === 'USD'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          USD
        </button>
        <button
          onClick={() => setCurrency('EUR')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            currency === 'EUR'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          EUR
        </button>
      </div>

      {/* Date Display */}
      <div className="ml-auto text-xs text-zinc-500 dark:text-zinc-400 font-mono">
        {dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
        {dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
}
