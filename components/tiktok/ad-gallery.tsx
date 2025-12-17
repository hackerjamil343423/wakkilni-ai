'use client';

import { Play, Zap } from 'lucide-react';
import type { TikTokCreative, Currency } from '@/lib/tiktok-data';

interface AdGalleryProps {
  creatives: TikTokCreative[];
  currency: Currency;
}

interface CreativeCardProps {
  creative: TikTokCreative;
  currency: Currency;
}

function CreativeCard({ creative, currency }: CreativeCardProps) {
  const currencySymbol = currency === 'USD' ? '$' : '€';

  const getHookColor = (rate: number) => {
    if (rate > 30) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (rate > 20) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const getHoldColor = (rate: number) => {
    if (rate > 20) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (rate > 10) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-lg">
      {/* Video Thumbnail - 9:16 Aspect Ratio */}
      <div className="relative bg-zinc-100 dark:bg-zinc-800 aspect-[9/16] overflow-hidden">
        {/* Placeholder with play icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {/* Spark Ad Badge */}
        {creative.is_spark_ad && (
          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold">
            <Zap className="w-3 h-3 fill-current" />
            Spark
          </div>
        )}

        {/* Bottom Overlay - Spend & CPA */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
          <div className="flex items-center justify-between text-white text-xs">
            <div>
              <p className="text-zinc-300 mb-0.5">Spend</p>
              <p className="font-semibold text-sm">
                {currencySymbol}
                {creative.metrics.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-zinc-300 mb-0.5">CPA</p>
              <p className="font-semibold text-sm">
                {currencySymbol}
                {creative.metrics.cpa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Metrics Badges */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">
          {creative.filename}
        </p>

        <div className="flex items-center gap-2">
          {/* Hook Rate */}
          <div className={`flex-1 px-2 py-1.5 rounded-md ${getHookColor(creative.derived.thumbstop_rate)}`}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5 opacity-70">
              Hook
            </p>
            <p className="text-sm font-bold">
              {creative.derived.thumbstop_rate.toFixed(1)}%
            </p>
          </div>

          {/* Hold Rate */}
          <div className={`flex-1 px-2 py-1.5 rounded-md ${getHoldColor(creative.derived.retention_rate)}`}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5 opacity-70">
              Hold
            </p>
            <p className="text-sm font-bold">
              {creative.derived.retention_rate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex-1">
            <span className="block text-[10px] uppercase tracking-wider mb-0.5">Finish</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {creative.derived.finish_rate.toFixed(1)}%
            </span>
          </div>
          <div className="flex-1">
            <span className="block text-[10px] uppercase tracking-wider mb-0.5">ROAS</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {creative.derived.roas.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Spark Ad Metrics */}
        {creative.is_spark_ad && (
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3 text-xs">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">Visits: </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {creative.metrics.profile_visits.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">Follows: </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {creative.metrics.follows.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdGallery({ creatives, currency }: AdGalleryProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Creative Gallery
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {creatives.length} active creatives
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {creatives.map((creative) => (
          <CreativeCard key={creative.id} creative={creative} currency={currency} />
        ))}
      </div>
    </div>
  );
}
