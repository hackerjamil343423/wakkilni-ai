"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Filter } from "lucide-react";
import { DashboardFilters, CampaignType, CampaignStatus } from "../types";

const CAMPAIGN_TYPES: CampaignType[] = [
  "SEARCH",
  "DISPLAY",
  "VIDEO",
  "SHOPPING",
  "PERFORMANCE_MAX",
  "DEMAND_GEN",
];

const CAMPAIGN_STATUSES: CampaignStatus[] = ["ENABLED", "PAUSED", "REMOVED"];

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
  const [selectedCampaignTypes, setSelectedCampaignTypes] = useState<
    CampaignType[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Title Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Google Ads Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive advertising intelligence and performance analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4">
        {/* Date Range Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range:
            </span>
            <div className="flex gap-2">
              {["7d", "30d", "90d", "ytd"].map((range) => (
                <Button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  variant={dateRange === range ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {range === "7d"
                    ? "7 days"
                    : range === "30d"
                      ? "30 days"
                      : range === "90d"
                        ? "90 days"
                        : "YTD"}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Campaign Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Campaign Type
              </label>
              <div className="flex flex-wrap gap-2">
                {CAMPAIGN_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleCampaignTypeToggle(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCampaignTypes.includes(type)
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {type === "PERFORMANCE_MAX"
                      ? "Performance Max"
                      : type === "DEMAND_GEN"
                        ? "Demand Gen"
                        : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Campaign Status
              </label>
              <div className="flex flex-wrap gap-2">
                {CAMPAIGN_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusToggle(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatuses.includes(status)
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {status === "ENABLED"
                      ? "Active"
                      : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedCampaignTypes.length > 0 || selectedStatuses.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedCampaignTypes.length > 0 || selectedStatuses.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedCampaignTypes.map((type) => (
            <div
              key={type}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
            >
              {type === "PERFORMANCE_MAX"
                ? "Performance Max"
                : type === "DEMAND_GEN"
                  ? "Demand Gen"
                  : type.charAt(0) + type.slice(1).toLowerCase()}
              <button
                onClick={() => handleCampaignTypeToggle(type)}
                className="ml-1 hover:opacity-70"
              >
                ✕
              </button>
            </div>
          ))}
          {selectedStatuses.map((status) => (
            <div
              key={status}
              className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
            >
              {status === "ENABLED"
                ? "Active"
                : status.charAt(0) + status.slice(1).toLowerCase()}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 hover:opacity-70"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
