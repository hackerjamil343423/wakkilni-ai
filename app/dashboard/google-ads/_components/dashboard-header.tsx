"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Download,
  SlidersHorizontal,
  Calendar,
  X,
  Command,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { DashboardFilters, CampaignType, CampaignStatus } from "../types";
import { cn } from "@/lib/utils";

const CAMPAIGN_TYPES: CampaignType[] = [
  "SEARCH",
  "DISPLAY",
  "VIDEO",
  "SHOPPING",
  "PERFORMANCE_MAX",
  "DEMAND_GEN",
];

const CAMPAIGN_STATUSES: CampaignStatus[] = ["ENABLED", "PAUSED", "REMOVED"];

const DATE_PRESETS = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "ytd", label: "YTD" },
] as const;

interface DashboardHeaderProps {
  onFiltersChange: (filters: DashboardFilters) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function DashboardHeader({
  onFiltersChange,
  isLoading,
  onRefresh,
}: DashboardHeaderProps) {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCampaignTypes, setSelectedCampaignTypes] = useState<CampaignType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(false);

  const getDateRange = useCallback(
    (range: string): { startDate: Date; endDate: Date } => {
      const endDate = new Date();
      const startDate = new Date();

      switch (range) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "ytd": {
          const year = new Date().getFullYear();
          startDate.setFullYear(year, 0, 1);
          break;
        }
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      return { startDate, endDate };
    },
    []
  );

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const { startDate, endDate } = getDateRange(range);

    onFiltersChange({
      dateRange: { startDate, endDate },
      campaignTypes: selectedCampaignTypes,
      campaignStatuses: selectedStatuses,
    });
  };

  const handleCampaignTypeToggle = (type: CampaignType) => {
    const updated = selectedCampaignTypes.includes(type)
      ? selectedCampaignTypes.filter((t) => t !== type)
      : [...selectedCampaignTypes, type];

    setSelectedCampaignTypes(updated);
    const { startDate, endDate } = getDateRange(dateRange);

    onFiltersChange({
      dateRange: { startDate, endDate },
      campaignTypes: updated,
      campaignStatuses: selectedStatuses,
    });
  };

  const handleStatusToggle = (status: CampaignStatus) => {
    const updated = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];

    setSelectedStatuses(updated);
    const { startDate, endDate } = getDateRange(dateRange);

    onFiltersChange({
      dateRange: { startDate, endDate },
      campaignTypes: selectedCampaignTypes,
      campaignStatuses: updated,
    });
  };

  const clearFilters = () => {
    setSelectedCampaignTypes([]);
    setSelectedStatuses([]);
    const { startDate, endDate } = getDateRange("30d");

    onFiltersChange({
      dateRange: { startDate, endDate },
      campaignTypes: [],
      campaignStatuses: [],
    });
  };

  const activeFilterCount = selectedCampaignTypes.length + selectedStatuses.length;

  return (
    <div className="space-y-4">
      {/* Top Bar - Title & Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Google Ads
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Performance analytics & intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="h-9 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Command Bar - Glassmorphism Style */}
      <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        {/* AI Search Bar */}
        <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400 flex-1">
            Ask AI about your campaigns...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-700 rounded">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />

        {/* Date Range Selector */}
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-zinc-400 mr-1" />
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleDateRangeChange(preset.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                dateRange === preset.id
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Compare Toggle */}
        <button
          onClick={() => setCompareEnabled(!compareEnabled)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            compareEnabled
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <span className={cn(
            "w-2 h-2 rounded-full transition-colors",
            compareEnabled ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600"
          )} />
          Compare
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            showFilters || activeFilterCount > 0
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform",
            showFilters && "rotate-180"
          )} />
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
          {/* Campaign Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Campaign Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_TYPES.map((type) => {
                const isSelected = selectedCampaignTypes.includes(type);
                const label = type === "PERFORMANCE_MAX"
                  ? "PMax"
                  : type === "DEMAND_GEN"
                    ? "Demand Gen"
                    : type.charAt(0) + type.slice(1).toLowerCase();

                return (
                  <button
                    key={type}
                    onClick={() => handleCampaignTypeToggle(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      isSelected
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campaign Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_STATUSES.map((status) => {
                const isSelected = selectedStatuses.includes(status);
                const label = status === "ENABLED" ? "Active" : status.charAt(0) + status.slice(1).toLowerCase();
                const dotColor = status === "ENABLED" ? "bg-emerald-500" : status === "PAUSED" ? "bg-amber-500" : "bg-zinc-400";

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusToggle(status)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      isSelected
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Active filters:</span>
          {selectedCampaignTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-medium"
            >
              {type === "PERFORMANCE_MAX" ? "PMax" : type === "DEMAND_GEN" ? "Demand Gen" : type.charAt(0) + type.slice(1).toLowerCase()}
              <button
                onClick={() => handleCampaignTypeToggle(type)}
                className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedStatuses.map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-medium"
            >
              {status === "ENABLED" ? "Active" : status.charAt(0) + status.slice(1).toLowerCase()}
              <button
                onClick={() => handleStatusToggle(status)}
                className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
