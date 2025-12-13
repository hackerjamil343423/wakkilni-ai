"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, ChevronDown } from "lucide-react";
import { ChartMetricConfig, getCategoryLabel } from "../chart-metrics-config";
import { cn } from "@/lib/utils";

interface ChartMetricSelectorProps {
  // Available metrics to choose from
  availableMetrics: ChartMetricConfig[];

  // Currently selected metric(s)
  selectedMetrics: string | string[];

  // Callback when selection changes
  onMetricsChange: (metrics: string | string[]) => void;

  // Selection mode
  mode: "single" | "multiple";

  // Max selections for multiple mode
  maxSelections?: number;

  // Button label
  label?: string;

  // Show category grouping
  showCategories?: boolean;

  // Button variant
  variant?: "outline" | "ghost";
}

export function ChartMetricSelector({
  availableMetrics,
  selectedMetrics,
  onMetricsChange,
  mode,
  maxSelections,
  label,
  showCategories = true,
  variant = "outline",
}: ChartMetricSelectorProps) {
  const [open, setOpen] = useState(false);

  // Convert to array for consistent handling
  const selectedArray = Array.isArray(selectedMetrics)
    ? selectedMetrics
    : [selectedMetrics];

  // Group by category if enabled
  const metricsByCategory = useMemo(() => {
    if (!showCategories) return { all: availableMetrics };

    const grouped: Record<string, ChartMetricConfig[]> = {};
    availableMetrics.forEach((metric) => {
      if (!grouped[metric.category]) {
        grouped[metric.category] = [];
      }
      grouped[metric.category].push(metric);
    });

    // Sort categories in a consistent order
    const categoryOrder = [
      "acquisition",
      "engagement",
      "conversion",
      "cost",
      "performance",
    ];
    const sortedGrouped: Record<string, ChartMetricConfig[]> = {};
    categoryOrder.forEach((cat) => {
      if (grouped[cat]) {
        sortedGrouped[cat] = grouped[cat];
      }
    });

    return sortedGrouped;
  }, [availableMetrics, showCategories]);

  const handleToggle = (metricId: string) => {
    if (mode === "single") {
      onMetricsChange(metricId);
      setOpen(false);
    } else {
      // Multiple mode
      const isSelected = selectedArray.includes(metricId);
      let newSelection: string[];

      if (isSelected) {
        newSelection = selectedArray.filter((id) => id !== metricId);
      } else {
        if (maxSelections && selectedArray.length >= maxSelections) {
          // Replace last item if at max
          newSelection = [...selectedArray.slice(0, -1), metricId];
        } else {
          newSelection = [...selectedArray, metricId];
        }
      }

      onMetricsChange(newSelection);
    }
  };

  const getButtonLabel = () => {
    if (label) return label;
    if (mode === "single") {
      const selected = availableMetrics.find(
        (m) => m.id === selectedMetrics
      );
      return selected ? selected.label : "Select Metric";
    }
    return `${selectedArray.length}${maxSelections ? `/${maxSelections}` : ""} Selected`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className="h-8 text-xs border-slate-300 hover:bg-slate-50"
        >
          <Settings className="w-3.5 h-3.5 mr-1.5" />
          {getButtonLabel()}
          <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="end">
        <div className="space-y-3 max-h-[360px] overflow-y-auto">
          {Object.entries(metricsByCategory).map(([category, metrics]) => (
            <div key={category}>
              {showCategories && (
                <p className="text-xs font-semibold text-slate-700 mb-2 px-1">
                  {getCategoryLabel(category as any)}
                </p>
              )}
              <div className="space-y-1">
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleToggle(metric.id)}
                  >
                    <Checkbox
                      checked={selectedArray.includes(metric.id)}
                      className="mt-0.5"
                      onCheckedChange={() => handleToggle(metric.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-sm text-slate-900 cursor-pointer block font-medium">
                        {metric.label}
                      </label>
                      <p className="text-xs text-slate-500">
                        {metric.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {showCategories &&
                category !== Object.keys(metricsByCategory).slice(-1)[0] && (
                  <div className="my-2 border-t border-slate-200" />
                )}
            </div>
          ))}
        </div>
        {mode === "multiple" && maxSelections && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              {selectedArray.length >= maxSelections
                ? `Maximum ${maxSelections} selected`
                : `Select up to ${maxSelections} metrics`}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
