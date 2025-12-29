"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  CHART_METRICS,
  DEFAULT_CHART_METRICS,
  getMetricsForChartType,
  formatMetricValue,
} from "../chart-metrics-config";
import { ChartMetricSelector } from "./chart-metric-selector";

interface Campaign {
  id: string;
  name: string;
  [key: string]: any;
}

interface TopCampaignsProps {
  data: Campaign[];
}

export function TopCampaigns({ data }: TopCampaignsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("spend");

  useEffect(() => {
    const saved = localStorage.getItem("meta-ads-top-campaigns-metric");
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
    localStorage.setItem("meta-ads-top-campaigns-metric", value);
  };

  const sortedCampaigns = useMemo(() => {
    return [...data]
      .sort((a, b) => {
        const aVal = a[selectedMetric] as number;
        const bVal = b[selectedMetric] as number;
        return (bVal || 0) - (aVal || 0);
      })
      .slice(0, 4);
  }, [data, selectedMetric]);

  if (!metricConfig) {
    return null;
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            Top Campaigns
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
            <span className="text-sm font-medium text-slate-500">Campaign</span>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {metricConfig.label}
          </span>
        </div>

        {/* Campaign List */}
        <div className="space-y-3 mb-4">
          {sortedCampaigns.map((campaign) => {
            const value = campaign[selectedMetric] as number;
            const formattedValue = formatMetricValue(value || 0, metricConfig.format);

            return (
              <div
                key={campaign.id}
                className="flex items-center justify-between py-2 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={(campaign as any).preview || "/api/placeholder/80/80"}
                    alt={campaign.name}
                    className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {campaign.name}
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
          Campaign Report
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
