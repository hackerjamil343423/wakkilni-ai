"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "../types";
import { CalendarIcon, RefreshCw, Zap, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface DashboardHeaderProps {
  onDateRangeChange?: (range: DateRange) => void;
  onAttributionChange?: (attribution: string) => void;
  onCampaignChange?: (campaign: string) => void;
  onCreativeChange?: (creative: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const presets = [
  { label: "Last 7 days", days: 7, id: "7d" },
  { label: "Last 14 days", days: 14, id: "14d" },
  { label: "Last 30 days", days: 30, id: "30d" },
  { label: "Last 60 days", days: 60, id: "60d" },
  { label: "Last 90 days", days: 90, id: "90d" },
];

const campaigns = [
  { id: "all", name: "All Campaigns" },
  { id: "q4_promo", name: "Q4 Promotional Campaign" },
  { id: "holiday_special", name: "Holiday Special" },
  { id: "spring_launch", name: "Spring Product Launch" },
  { id: "retargeting", name: "Retargeting Campaign" },
];

const creatives = [
  { id: "all", name: "All Creatives" },
  { id: "ugc_sarah", name: "UGC Testimonial Sarah" },
  { id: "pain_point", name: "Pain Point Hook" },
  { id: "product_demo", name: "Product Demo V2" },
  { id: "before_after", name: "Before After Results" },
  { id: "founder_story", name: "Founder Story" },
];

export function DashboardHeader({
  onDateRangeChange,
  onAttributionChange,
  onCampaignChange,
  onCreativeChange,
  onRefresh,
  isLoading = false,
}: DashboardHeaderProps) {
  const [selectedPreset, setSelectedPreset] = useState("30d");
  const [date, setDate] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [attribution, setAttribution] = useState("7d_click");
  const [campaign, setCampaign] = useState("all");
  const [creative, setCreative] = useState("all");
  const [dateOpen, setDateOpen] = useState(false);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = {
      from: subDays(new Date(), preset.days),
      to: new Date(),
    };
    setDate(newRange);
    setSelectedPreset(preset.id);
    onDateRangeChange?.(newRange);
    setDateOpen(false);
  };

  const handleAttributionChange = (value: string) => {
    setAttribution(value);
    onAttributionChange?.(value);
  };

  const handleCampaignChange = (value: string) => {
    setCampaign(value);
    onCampaignChange?.(value);
  };

  const handleCreativeChange = (value: string) => {
    setCreative(value);
    onCreativeChange?.(value);
  };

  const currentPreset = presets.find(p => p.id === selectedPreset);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Meta Ads Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Facebook & Instagram performance
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date Range Picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 justify-start text-left font-normal border-slate-200 hover:bg-slate-50",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
              <span className="text-sm">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "MMM d")} - {format(date.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(date.from, "MMM d, yyyy")
                  )
                ) : (
                  "Pick a date"
                )}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="end">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 mb-2 px-2">
                Select Range
              </p>
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-between text-sm",
                    selectedPreset === preset.id && "bg-slate-100"
                  )}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                  {selectedPreset === preset.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Campaign Filter */}
        <Select value={campaign} onValueChange={handleCampaignChange}>
          <SelectTrigger className="w-[180px] h-9 text-sm border-slate-200">
            <SelectValue placeholder="Select Campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Creative Filter */}
        <Select value={creative} onValueChange={handleCreativeChange}>
          <SelectTrigger className="w-[180px] h-9 text-sm border-slate-200">
            <SelectValue placeholder="Select Creative" />
          </SelectTrigger>
          <SelectContent>
            {creatives.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Attribution Window */}
        <Select value={attribution} onValueChange={handleAttributionChange}>
          <SelectTrigger className="w-[130px] h-9 text-sm border-slate-200">
            <SelectValue placeholder="Attribution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d_click">1d click</SelectItem>
            <SelectItem value="7d_click">7d click</SelectItem>
            <SelectItem value="28d_click">28d click</SelectItem>
            <SelectItem value="1d_view">1d view</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4 mr-2",
              isLoading && "animate-spin"
            )}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
