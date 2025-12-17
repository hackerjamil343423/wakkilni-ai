'use client';

import { useState } from 'react';
import { CommandBar } from '@/components/tiktok/command-bar';
import { VitalSigns } from '@/components/tiktok/vital-signs';
import { CreativeLab } from '@/components/tiktok/creative-lab';
import { AdGallery } from '@/components/tiktok/ad-gallery';
import { DemographicsHeatmap } from '@/components/tiktok/demographics-heatmap';
import {
  generateMockCreatives,
  generateMockDemographics,
  generateMockTimeSeries,
  type DataSource,
  type Currency,
} from '@/lib/tiktok-data';

export default function TikTokIntelligencePage() {
  const [dataSource, setDataSource] = useState<DataSource>('pixel');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  // Generate mock data (in production, this would come from API)
  const creatives = generateMockCreatives(12);
  const demographics = generateMockDemographics();
  const timeSeries = generateMockTimeSeries(7);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Linear-Style Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Wakklni AI
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                TikTok Intelligence Module v2.0
              </p>
            </div>
          </div>

          <CommandBar
            dataSource={dataSource}
            setDataSource={setDataSource}
            currency={currency}
            setCurrency={setCurrency}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-6 space-y-6">
        {/* Vital Signs */}
        <VitalSigns
          creatives={creatives}
          timeSeries={timeSeries}
          currency={currency}
        />

        {/* Creative Lab - Bento Grid */}
        <CreativeLab creatives={creatives} />

        {/* Ad Gallery */}
        <AdGallery creatives={creatives} currency={currency} />

        {/* Demographics Heatmap */}
        <DemographicsHeatmap demographics={demographics} currency={currency} />
      </div>
    </div>
  );
}
