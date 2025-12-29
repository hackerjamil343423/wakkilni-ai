"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreVertical } from "lucide-react";
import { CreativePerformance } from "../types";
import {
  CHART_METRICS,
  DEFAULT_CHART_METRICS,
  getMetricsForChartType,
  formatMetricValue,
} from "../chart-metrics-config";
import { ChartMetricSelector } from "./chart-metric-selector";

interface TopCreativesProps {
  data: CreativePerformance[];
}

export function TopCreatives({ data }: TopCreativesProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>(DEFAULT_CHART_METRICS.topCreatives);

  useEffect(() => {
    const saved = localStorage.getItem("meta-ads-top-creatives-metric");
    if (saved) setSelectedMetric(saved);
  }, []);

  const metricConfig = CHART_METRICS[selectedMetric];
  const availableMetrics = useMemo(
    () => getMetricsForChartType("list"),
    []
  );

  const handleMetricChange = (metric: string | string[]) => {
    const value = Array.isArray(metric) ? metric[0] : metric;
    setSelectedMetric(value);
    localStorage.setItem("meta-ads-top-creatives-metric", value);
  };

  const sortedCreatives = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[selectedMetric as keyof CreativePerformance] as number;
      const bVal = b[selectedMetric as keyof CreativePerformance] as number;
      return (bVal || 0) - (aVal || 0);
    }).slice(0, 4);
  }, [data, selectedMetric]);

  if (!metricConfig) {
    return null;
  }
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            Top Creatives
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
            <span className="text-sm font-medium text-slate-500">Creative</span>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {metricConfig.label}
          </span>
        </div>

        {/* Creative List */}
        <div className="space-y-3 mb-4">
          {sortedCreatives.map((creative, index) => {
            const value = creative[selectedMetric as keyof CreativePerformance] as number;
            const formattedValue = formatMetricValue(value || 0, metricConfig.format);

            return (
              <div
                key={creative.id}
                className="flex items-center justify-between py-2 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={creative.preview}
                    alt={creative.name}
                    className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {creative.name.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 tabular-nums flex-shrink-0">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <Button
          variant="outline"
          className="w-full h-10 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
        >
          Creative Report
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
