'use client';

import type { TikTokDemographic, Currency } from '@/lib/tiktok-data';

interface DemographicsHeatmapProps {
  demographics: TikTokDemographic[];
  currency: Currency;
}

export function DemographicsHeatmap({ demographics, currency }: DemographicsHeatmapProps) {
  const currencySymbol = currency === 'USD' ? '$' : '€';

  const genders: TikTokDemographic['gender'][] = ['Female', 'Male', 'Unknown'];
  const ageGroups: TikTokDemographic['age_group'][] = ['18-24', '25-34', '35-44', '45+'];

  // Find min and max CPA for color scaling
  const cpas = demographics.map((d) => d.cpa);
  const minCPA = Math.min(...cpas);
  const maxCPA = Math.max(...cpas);

  const getCPAIntensity = (cpa: number) => {
    // Normalize CPA to 0-1 range
    const normalized = (cpa - minCPA) / (maxCPA - minCPA);

    // Return color intensity (darker red = higher CPA = more expensive)
    if (normalized > 0.8) return 'bg-red-600 text-white';
    if (normalized > 0.6) return 'bg-red-500 text-white';
    if (normalized > 0.4) return 'bg-red-400 text-white';
    if (normalized > 0.2) return 'bg-red-300 text-zinc-900';
    return 'bg-red-200 text-zinc-900';
  };

  const getDemographic = (gender: TikTokDemographic['gender'], age: TikTokDemographic['age_group']) => {
    return demographics.find((d) => d.gender === gender && d.age_group === age);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Demographics Heatmap
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          CPA by Gender & Age Group (Darker = Higher CPA)
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Table */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-5 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="p-3 border-r border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Gender / Age
                </span>
              </div>
              {ageGroups.map((age) => (
                <div
                  key={age}
                  className="p-3 border-r last:border-r-0 border-b border-zinc-200 dark:border-zinc-700 text-center"
                >
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {age}
                  </span>
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {genders.map((gender, genderIdx) => (
              <div key={gender} className="grid grid-cols-5">
                {/* Gender Label */}
                <div className="p-3 border-r border-b last:border-b-0 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {gender}
                  </span>
                </div>

                {/* Data Cells */}
                {ageGroups.map((age, ageIdx) => {
                  const demo = getDemographic(gender, age);
                  if (!demo) return null;

                  return (
                    <div
                      key={`${gender}-${age}`}
                      className={`p-3 border-r last:border-r-0 border-b ${
                        genderIdx === genders.length - 1 ? 'last:border-b-0' : ''
                      } border-zinc-200 dark:border-zinc-700 ${getCPAIntensity(demo.cpa)} transition-all hover:scale-105 hover:shadow-lg cursor-pointer`}
                    >
                      <div className="text-center">
                        <p className="text-sm font-bold mb-1">
                          {currencySymbol}
                          {demo.cpa.toFixed(2)}
                        </p>
                        <p className="text-[10px] opacity-80">
                          {demo.conversions.toLocaleString()} conv.
                        </p>
                        <p className="text-[10px] opacity-70 mt-0.5">
                          {currencySymbol}
                          {demo.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })} spend
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">CPA Range:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">Mid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
