"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SlidersHorizontal,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  BarChart3,
  Search,
  Zap,
  Video,
  Globe,
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
import { type DateRange } from "react-day-picker";

const CAMPAIGN_TYPES: CampaignType[] = [
  "SEARCH",
  "DISPLAY",
  "VIDEO",
  "SHOPPING",
  "PERFORMANCE_MAX",
  "DEMAND_GEN",
];

const CAMPAIGN_STATUSES: CampaignStatus[] = ["ENABLED", "PAUSED", "REMOVED"];

type TabId = "overview" | "search" | "pmax" | "video" | "audience";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "search", label: "Search", icon: Search },
  { id: "pmax", label: "PMax", icon: Zap },
  { id: "video", label: "Video", icon: Video },
  { id: "audience", label: "Audience", icon: Globe },
];

interface DashboardHeaderProps {
  onFiltersChange: (filters: DashboardFilters) => void;
  onTabChange?: (tab: TabId) => void;
  currentTab?: TabId;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function DashboardHeader({
  onFiltersChange,
  onTabChange,
  currentTab = "overview",
  isLoading,
  onRefresh,
}: DashboardHeaderProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [selectedCampaignTypes, setSelectedCampaignTypes] = useState<CampaignType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    if (newRange?.from && newRange?.to) {
      onFiltersChange({
        dateRange: { startDate: newRange.from, endDate: newRange.to },
        campaignTypes: selectedCampaignTypes,
        campaignStatuses: selectedStatuses,
      });
    }
  };

  const handleCampaignTypeToggle = (type: CampaignType) => {
    const updated = selectedCampaignTypes.includes(type)
      ? selectedCampaignTypes.filter((t) => t !== type)
      : [...selectedCampaignTypes, type];

    setSelectedCampaignTypes(updated);

    onFiltersChange({
      dateRange: {
        startDate: dateRange?.from || new Date(),
        endDate: dateRange?.to || new Date(),
      },
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
      dateRange: {
        startDate: dateRange?.from || new Date(),
        endDate: dateRange?.to || new Date(),
      },
      campaignTypes: selectedCampaignTypes,
      campaignStatuses: updated,
    });
  };

  const clearFilters = () => {
    setSelectedCampaignTypes([]);
    setSelectedStatuses([]);

    onFiltersChange({
      dateRange: {
        startDate: dateRange?.from || new Date(),
        endDate: dateRange?.to || new Date(),
      },
      campaignTypes: [],
      campaignStatuses: [],
    });
  };

  const activeFilterCount = selectedCampaignTypes.length + selectedStatuses.length;

  return (
    <div className="space-y-4">
      {/* Control Bar with Date Picker and Tabs */}
      <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm gap-4">
        {/* Date Range Picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700 hover:bg-violet-200 dark:hover:bg-violet-900/50"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                  : "Select dates"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              className="rounded-lg border"
            />
          </PopoverContent>
        </Popover>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all ml-auto",
            showFilters || activeFilterCount > 0
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
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
