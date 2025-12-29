"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { CountryPerformance } from "../types";
import {
  CHART_METRICS,
  DEFAULT_CHART_METRICS,
  getMetricsForChartType,
  formatMetricValue,
} from "../chart-metrics-config";
import { ChartMetricSelector } from "./chart-metric-selector";

interface TopCountriesProps {
  data: CountryPerformance[];
}

export function TopCountries({ data }: TopCountriesProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>(DEFAULT_CHART_METRICS.topCreatives);

  useEffect(() => {
    const saved = localStorage.getItem("meta-ads-top-countries-metric");
    if (saved) setSelectedMetric(saved);
  }, []);

  const [selectedCountry, setSelectedCountry] = useState<CountryPerformance | null>(null);

  const metricConfig = CHART_METRICS[selectedMetric];
  const availableMetrics = useMemo(
    () => getMetricsForChartType("list"),
    []
  );

  const handleMetricChange = (metric: string | string[]) => {
    const value = Array.isArray(metric) ? metric[0] : metric;
    setSelectedMetric(value);
    localStorage.setItem("meta-ads-top-countries-metric", value);
  };

  const sortedCountries = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[selectedMetric as keyof CountryPerformance] as number;
      const bVal = b[selectedMetric as keyof CountryPerformance] as number;
      return (bVal || 0) - (aVal || 0);
    });
  }, [data, selectedMetric]);

  if (!metricConfig) {
    return null;
  }

  return (
    <>
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Top Countries
            </h3>
            <ChartMetricSelector
              availableMetrics={availableMetrics}
              selectedMetrics={selectedMetric}
              onMetricsChange={handleMetricChange}
              mode="single"
              showCategories={false}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Table Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-medium text-slate-500">Preview</span>
            <span className="text-sm font-medium text-slate-500">Country</span>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {metricConfig.label}
          </span>
        </div>

        {/* Country List */}
        <div className="space-y-3 mb-4">
          {sortedCountries.map((country) => {
            const value = country[selectedMetric as keyof CountryPerformance] as number;
            const formattedValue = formatMetricValue(value || 0, metricConfig.format);

            return (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                className="w-full flex items-center justify-between py-2 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors gap-2 text-left"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {country.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 tabular-nums flex-shrink-0">
                  {formattedValue}
                </span>
              </button>
            );
          })}
        </div>

          {/* View All Button */}
          <Button
            variant="outline"
            className="w-full h-10 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
          >
            Country Report
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedCountry(null)}
        >
          <Card
            className="w-full max-w-2xl bg-white border border-slate-200 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 border-b border-slate-100 flex items-center justify-between flex-row">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedCountry.flag}</span>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedCountry.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedCountry.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Row 1 */}
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Ad Spend</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${selectedCountry.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedCountry.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* Row 2 */}
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Impressions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedCountry.impressions.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Conversions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedCountry.conversions.toLocaleString()}
                  </p>
                </div>

                {/* Row 3 */}
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">ROAS</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedCountry.roas.toFixed(2)}x
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">CPA</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${selectedCountry.cpa.toFixed(2)}
                  </p>
                </div>

                {/* Row 4 */}
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">CTR</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedCountry.ctr.toFixed(2)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedCountry.conversion_rate.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Additional Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Clicks</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedCountry.clicks.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Reach</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedCountry.reach.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Avg. CPC</p>
                    <p className="text-lg font-semibold text-slate-900">
                      ${(selectedCountry.spend / selectedCountry.clicks).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedCountry(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
