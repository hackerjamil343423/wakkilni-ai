"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  SlidersHorizontal,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DashboardFilters, CampaignType, CampaignStatus } from "../types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCampaignTypes, setSelectedCampaignTypes] = useState<CampaignType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      if (date <= endDate) {
        onFiltersChange({
          dateRange: { startDate: date, endDate },
          campaignTypes: selectedCampaignTypes,
          campaignStatuses: selectedStatuses,
        });
      }
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      if (startDate <= date) {
        onFiltersChange({
          dateRange: { startDate, endDate: date },
          campaignTypes: selectedCampaignTypes,
          campaignStatuses: selectedStatuses,
        });
        setCalendarOpen(false);
      }
    }
  };

  const handleCampaignTypeToggle = (type: CampaignType) => {
    const updated = selectedCampaignTypes.includes(type)
      ? selectedCampaignTypes.filter((t) => t !== type)
      : [...selectedCampaignTypes, type];

    setSelectedCampaignTypes(updated);

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

    onFiltersChange({
      dateRange: { startDate, endDate },
      campaignTypes: selectedCampaignTypes,
      campaignStatuses: updated,
    });
  };

  const clearFilters = () => {
    setSelectedCampaignTypes([]);
    setSelectedStatuses([]);

    onFiltersChange({
      dateRange: { startDate, endDate },
      campaignTypes: [],
      campaignStatuses: [],
    });
  };

  const activeFilterCount = selectedCampaignTypes.length + selectedStatuses.length;

  return (
    <div className="space-y-4">
      {/* Control Bar - Glassmorphism Style */}
      <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        {/* Date Range Picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>{format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500">Start Date</label>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  disabled={(date) => date > endDate}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500">End Date</label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  disabled={(date) => date < startDate}
                  className="rounded-md border"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

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
